<script setup lang="ts">
import { formatRisk } from "../../utils/formatters";

defineProps<{ value?: string; title?: string }>();
</script>

<template>
  <span v-if="value" class="badge priority-tag" :data-level="value">{{ formatRisk(value) }}</span>
  <div v-else class="shared-widget"><strong>{{ title ?? "PriorityTag" }}</strong><span class="badge">READY</span></div>
</template>
