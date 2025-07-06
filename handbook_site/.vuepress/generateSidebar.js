// handbook_site/.vuepress/generateSidebar.js

const fs = require('fs');
const path = require('path');

/**
 * Parses the HANDBOOK_STRUCTURE_MAPPING.md file to extract the site structure.
 * @returns {Array<Object>} An array of objects, each representing a page or directory.
 *                          Each object has: level, originalPath, englishPath (future use), chineseTitle, remarks.
 */
function parseMappingFile() {
  const mappingFilePath = path.resolve(__dirname, '../../docs/HANDBOOK_STRUCTURE_MAPPING.md');
  let fileContent;
  try {
    fileContent = fs.readFileSync(mappingFilePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading mapping file: ${mappingFilePath}`, error);
    return [];
  }

  const lines = fileContent.split('\\n');
  const structure = [];
  let tableStarted = false;

  for (const line of lines) {
    if (line.trim().startsWith('|------|')) { // Table header separator
      tableStarted = true;
      continue;
    }
    if (!tableStarted || !line.trim().startsWith('|')) {
      continue;
    }

    const cells = line.split('|').map(cell => cell.trim()).slice(1, -1); // Get content cells, remove outer empty cells

    if (cells.length >= 4) { // Ensure we have enough columns
      // originalPath is at index 1, englishPath at 2, chineseTitle at 3
      // Level can be inferred from the leading 'L ' in originalPath or taken directly if a column exists
      // For now, let's simplify and assume structure based on indentation or a dedicated level column later

      // cells[0] is '层级', cells[1] is '原始中文路径/文件名', cells[2] is '规划的英文路径/文件名', cells[3] is '期望的中文导航/页面标题', cells[4] is '备注'
      const level = parseInt(cells[0], 10);
      let originalPath = cells[1].replace(/^(L\s)+/, '').replace(/`/g, ''); // Remove level indicators and backticks
      const englishPath = cells[2].replace(/`/g, '');
      const chineseTitle = cells[3];
      const remarks = cells[4] || '';

      if (isNaN(level)) {
        // console.warn(`Skipping line due to invalid level: ${line}`);
        continue;
      }

      structure.push({
        level,
        originalPath,
        englishPath, // Keep for reference, might be useful later
        chineseTitle,
        remarks
      });
    }
  }
  return structure;
}

/**
 * Placeholder for a function that will take the parsed mapping
 * and the actual file system structure to generate VuePress sidebar config.
 * and the actual file system structure to generate VuePress sidebar and nav config.
 */
function generateSidebarAndNavConfig(parsedMapping, contentRootDir, handbookBaseDirInVuepress = '/') {
  console.log("Generating Sidebar and Nav Config...");
  console.log("Mapping data entries:", parsedMapping.length);
  console.log("Content root directory:", contentRootDir);
  console.log("Handbook base directory in VuePress:", handbookBaseDirInVuepress);

  const sidebar = {};
  const nav = [];

  // Helper to find a mapping entry by its original (Chinese) path
  const findMappingByOriginalPath = (originalPath) => {
    // Normalize path: remove leading/trailing slashes, replace multiple slashes
    const normalize = p => p.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    const normalizedOriginalPath = normalize(originalPath);
    return parsedMapping.find(m => normalize(m.originalPath) === normalizedOriginalPath);
  };

  // Normalize handbookBaseDirInVuepress to ensure it ends with a slash if not empty
  let baseLinkPath = handbookBaseDirInVuepress;
  if (baseLinkPath && !baseLinkPath.endsWith('/')) {
    baseLinkPath += '/';
  }
  if (baseLinkPath === '/') baseLinkPath = ''; // Avoid double slash at the beginning of links

  // Process top-level directories first for Nav and Sidebar keys
  const topLevelDirs = parsedMapping.filter(item => item.level === 1 && item.originalPath.endsWith('/'));

  topLevelDirs.forEach(topDir => {
    const topDirKey = `${baseLinkPath}${topDir.originalPath}`; // Path for sidebar key and nav link
    nav.push({
      text: topDir.chineseTitle || topDir.originalPath.replace(/\/$/, ''),
      link: topDirKey
    });
    sidebar[topDirKey] = []; // Initialize sidebar array for this top-level section
  });

  // Recursive function to build sidebar items
  function buildSidebarItems(currentFsPath, currentRelativePath, currentLevelMapping) {
    let items = [];
    try {
      const entries = fs.readdirSync(currentFsPath, { withFileTypes: true });

      // Custom sort: numeric prefix first, then by locale string
      entries.sort((a, b) => {
        const re = /^(\d+)[_ ]?/; // Matches leading digits optionally followed by _ or space
        const aMatch = a.name.match(re);
        const bMatch = b.name.match(re);

        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1], 10);
          const bNum = parseInt(bMatch[1], 10);
          if (aNum !== bNum) {
            return aNum - bNum;
          }
        }
        // If numbers are same, or one/both don't have a numeric prefix, sort by name
        return a.name.localeCompare(b.name, 'zh-CN-u-co-pinyin');
      });

      for (const entry of entries) {
        const entryName = entry.name;
        const entryFsPath = path.join(currentFsPath, entryName);
        // Construct the originalPath key as it would appear in the mapping file (relative to contentRootDir)
        const entryOriginalPathRelative = path.join(currentRelativePath, entryName).replace(/\\/g, '/');

        const mappingEntry = findMappingByOriginalPath(entryOriginalPathRelative + (entry.isDirectory() ? '/' : ''));
        const title = mappingEntry ? mappingEntry.chineseTitle : entryName.replace(/\.md$/, '');

        // Construct the VuePress link path
        // It's relative to the `docsDir`, which is `contentRootDir`
        // So, if contentRootDir is '../运维工程师实战手册', and entryOriginalPathRelative is '01_基础设施/01_Linux系统管理/01_基础命令.md'
        // The VuePress path becomes '/01_基础设施/01_Linux系统管理/01_基础命令.md' (leading slash added by VuePress)
        // Or for README.md in a dir, it becomes '/dir_name/'
        let vuepressPath = `${baseLinkPath}${entryOriginalPathRelative}`;

        if (entry.isDirectory()) {
          const readmeMapping = findMappingByOriginalPath(entryOriginalPathRelative + '/README.md');
          const groupTitle = readmeMapping ? readmeMapping.chineseTitle : title;

          const children = buildSidebarItems(entryFsPath, entryOriginalPathRelative, currentLevelMapping);
          if (children.length > 0 || readmeMapping) { // Only add group if it has children or a README
            const group = {
              title: groupTitle,
              collapsable: true, // Default to true, can be made configurable
              children: [],
            };
            // If there's a README, add it as the first item (VuePress convention for dir link)
            if (fs.existsSync(path.join(entryFsPath, 'README.md'))) {
               // VuePress uses '' or '/' for README.md within a group path
               // The path for the group itself often implies the README.
               // We can add an explicit link to README if needed, or rely on VuePress convention.
               // For a link to `group/README.md`, VuePress path would be `group/` or `group/README.html`
               // Let's make the group itself clickable by linking to its base path
               group.path = `${baseLinkPath}${entryOriginalPathRelative}/`; // Path for the group itself
            }
            group.children.push(...children.filter(c => c !== `${baseLinkPath}${entryOriginalPathRelative}/`)); // Add children, avoid duplicate README link
             // If there are children, add the group. If no children but has a README, it's a simple link.
            if (group.children.length > 0) {
                items.push(group);
            } else if (group.path) { // Only README, no other children
                items.push({ title: group.title, path: group.path });
            }
          }
        } else if (entryName.toLowerCase().endsWith('.md')) {
          if (entryName.toLowerCase() !== 'readme.md') { // READMEs are handled by their parent dir group
            items.push({ title: title, path: vuepressPath.replace(/\.md$/, '.html')});
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentFsPath}:`, error);
    }
    return items;
  }

  // Populate sidebar for each top-level directory
  topLevelDirs.forEach(topDir => {
    const topDirFsPath = path.join(contentRootDir, topDir.originalPath);
    const topDirRelativePath = topDir.originalPath;
    const sidebarKey = `${baseLinkPath}${topDir.originalPath}`;

    // Get children for this top-level directory
    sidebar[sidebarKey] = buildSidebarItems(topDirFsPath, topDirRelativePath, parsedMapping);

    // Ensure the main README.md of the top-level dir is the first item if it exists
    // and is represented by an empty string or a direct link to the overview page.
    const topReadmeMapping = findMappingByOriginalPath(topDir.originalPath + 'README.md');
    if (topReadmeMapping && fs.existsSync(path.join(topDirFsPath, 'README.md'))) {
        // Prepend the README of the top-level directory.
        // VuePress convention: an empty string '' in the children array refers to the parent directory's README.md
        // Or, more explicitly: { title: 'Overview', path: topDirKey }
        sidebar[sidebarKey].unshift({ title: topReadmeMapping.chineseTitle || '概览', path: topDirKey });
    }
  });

  console.log("Generated Nav:", JSON.stringify(nav, null, 2));
  console.log("Generated Sidebar:", JSON.stringify(sidebar, null, 2));
  return { nav, sidebar };
}


// For testing:
const mappingData = parseMappingFile();
if (mappingData.length > 0) {
  console.log(`Successfully parsed ${mappingData.length} entries from mapping file.`);
  // console.log("First few entries:", JSON.stringify(mappingData.slice(0, 5), null, 2));

  // Define the root directory of the actual content (relative to this script's location)
  const testContentAbsolutePath = path.resolve(__dirname, '../../ops_handbook'); // UPDATED for testing consistency

  // generateSidebarAndNavConfig(mappingData, testContentAbsolutePath); // Use test path if uncommented
  // The actual VuePress config will call this function with path from config.js.
} else {
  console.log("No data parsed from mapping file or file was empty/not found.");
}

module.exports = {
  parseMappingFile,
  generateSidebarAndNavConfig
};
// const mappingData = parseMappingFile();
// if (mappingData.length > 0) {
//   console.log(`Successfully parsed ${mappingData.length} entries from mapping file.`);
//   console.log("First few entries:", JSON.stringify(mappingData.slice(0, 5), null, 2));
//   // const sidebarConfig = generateSidebarConfig(mappingData, '../运维工程师实战手册');
//   // console.log("Dummy Sidebar Config:", JSON.stringify(sidebarConfig, null, 2));
// } else {
//   console.log("No data parsed from mapping file or file was empty/not found.");
// }

module.exports = {
  parseMappingFile,
  generateSidebarConfig // Exporting for future use
};
