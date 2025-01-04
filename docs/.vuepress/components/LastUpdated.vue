<template>
  <div class="last-updated">
    <span class="prefix">{{ prefix }}: </span>
    <span class="time">{{ formattedDate }}</span>
  </div>
</template>

<script>
export default {
  name: 'LastUpdated',
  props: {
    prefix: {
      type: String,
      default: '上次更新'
    },
    time: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedDate() {
      const date = new Date(this.time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.last-updated
  padding-top: 1rem
  color: #666
  font-size: 0.9em
  
  .prefix
    font-weight: 500
  
  .time
    font-weight: 400
    color: #aaa
</style> 