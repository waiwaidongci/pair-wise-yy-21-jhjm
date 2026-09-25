<script setup lang="ts">
export interface TimelineItem {
  time: string;
  text: string;
}

defineProps<{ items?: TimelineItem[]; title?: string }>();
</script>

<template>
  <div class="shared-widget">
    <strong>{{ title ?? "TimelineList" }}</strong>
    <ul v-if="items && items.length" class="timeline">
      <li v-for="(item, index) in items" :key="index">
        <span class="timeline-time">{{ item.time }}</span>
        <span>{{ item.text }}</span>
      </li>
    </ul>
    <span v-else class="badge">READY</span>
  </div>
</template>
