<script setup lang="ts">
import type { Crew } from "../../types/Crew";
import { formatDutyStatus } from "../../utils/formatters";

defineProps<{ crew?: Crew | null; matched?: boolean; title?: string }>();
</script>

<template>
  <div v-if="crew" class="shared-widget crew-card">
    <strong>{{ crew.name }}</strong>
    <span class="badge">{{ formatDutyStatus(crew.duty_status) }}</span>
    <span>当前工单：{{ crew.current_ticket_id ?? "无" }}</span>
    <span v-if="matched === false" class="crew-warn">班组记录中挂的不是这张工单，确认不生效</span>
  </div>
  <div v-else class="shared-widget"><strong>{{ title ?? "CrewCard" }}</strong><span class="badge">READY</span></div>
</template>

<style scoped>
.crew-card { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.crew-warn { color: #9a3b26; font-weight: 700; }
</style>
