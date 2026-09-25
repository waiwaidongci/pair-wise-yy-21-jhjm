<script setup lang="ts">
import type { Crew } from "../../types/Crew";
import { CrewDutyStatusText } from "../../constants/CrewDutyStatus";
import StatusBadge from "./StatusBadge.vue";

defineProps<{ crew?: Crew | null; title?: string }>();
</script>

<template>
  <div class="shared-widget crew-card">
    <template v-if="crew">
      <strong>{{ crew.name }}</strong>
      <StatusBadge :value="CrewDutyStatusText[crew.duty_status as keyof typeof CrewDutyStatusText] ?? crew.duty_status" />
      <span class="crew-meta">当前工单：{{ crew.current_ticket_id === 0 ? "无" : `#${crew.current_ticket_id}` }}</span>
    </template>
    <template v-else>
      <strong>{{ title ?? "CrewCard" }}</strong><span class="badge">READY</span>
    </template>
  </div>
</template>
