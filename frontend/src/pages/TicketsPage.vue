<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useCrewStore } from "../stores/CrewStore";
import { useTicketFlow, isPendingRestore, ticketHasPartsAbnormal, type TicketListFilter } from "../hooks/useTicketFlow";
import { useCrewAvailability } from "../hooks/useCrewAvailability";
import { formatDateOrDash, formatTicketStatus, formatUsageStatus, formatCrewRelease, formatRisk } from "../utils/formatters";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import StatusBadge from "../components/common/StatusBadge.vue";
import CrewCard from "../components/common/CrewCard.vue";
import EmptyState from "../components/common/EmptyState.vue";

const ticketStore = useRepairTicketStore();
const usageStore = useSparePartUsageStore();
const crewStore = useCrewStore();
const { rows: tickets } = storeToRefs(ticketStore);
const { rows: usages } = storeToRefs(usageStore);
const { rows: crews } = storeToRefs(crewStore);

const flow = useTicketFlow({ tickets, crews, usages });
const { crewOf, isCrewMatched } = useCrewAvailability(crews);

const filters: Array<{ key: TicketListFilter; label: string }> = [
  { key: "PENDING_RESTORE", label: "待复电" },
  { key: "PARTS_ABNORMAL", label: "备件异常" },
  { key: "RESTORED", label: "已复电" },
  { key: "ALL", label: "全部" }
];

const countOf = (key: TicketListFilter) => {
  if (key === "PENDING_RESTORE") return tickets.value.filter(isPendingRestore).length;
  if (key === "PARTS_ABNORMAL") return tickets.value.filter((t) => ticketHasPartsAbnormal(t.id, usages.value)).length;
  if (key === "RESTORED") return tickets.value.filter((t) => !isPendingRestore(t)).length;
  return tickets.value.length;
};

const crew = computed(() => crewOf(flow.selected.value));
const crewMatched = computed(() => isCrewMatched(flow.selected.value, crew.value));
const isRestored = computed(() => !!flow.selected.value && !isPendingRestore(flow.selected.value));

const confirmResult = ref<string>("");
const adjustNotes = reactive<Record<number, string>>({});
const adjustMessage = ref<string>("");

const reloadAll = async () => {
  await Promise.all([ticketStore.load(), usageStore.load(), crewStore.load()]);
};

onMounted(async () => {
  await reloadAll();
  const first = flow.filteredTickets.value[0];
  if (first) flow.select(first.id);
});

const pick = (id: number) => {
  confirmResult.value = "";
  adjustMessage.value = "";
  ticketStore.lastError = null;
  flow.select(id);
};

const confirm = async () => {
  const ticket = flow.selected.value;
  if (!ticket) return;
  confirmResult.value = "";
  try {
    const handover = await ticketStore.confirm(ticket.id, flow.confirmPayload());
    console.info(LOG_TEMPLATES.RepairTicket[4], handover.ticket.id);
    confirmResult.value =
      `复电确认成功：复电时间 ${formatDateOrDash(handover.ticket.restored_at)}，` +
      `班组释放结果 ${formatCrewRelease(handover.ticket.crew_release_result)}，班组已回到可派状态`;
    await reloadAll();
  } catch {
    console.info(LOG_TEMPLATES.RepairTicket[5], ticket.id);
  }
};

const adjust = async (usageId: number) => {
  adjustMessage.value = "";
  ticketStore.lastError = null;
  try {
    await usageStore.adjust(usageId, {
      adjust_note: adjustNotes[usageId] ?? "",
      actual_quantity: flow.actuals[usageId] ?? undefined
    });
    console.info(LOG_TEMPLATES.SparePartUsage[5], usageId);
    adjustMessage.value = "补记已保存：仅记录调整说明，工单保持已复电";
    adjustNotes[usageId] = "";
    await reloadAll();
  } catch (err) {
    adjustMessage.value = err instanceof Error ? err.message : String(err);
  }
};

const errorParts = computed(() => ticketStore.lastError?.details?.parts ?? []);
</script>

<template>
  <section class="tickets-desk">
    <div class="panel">
      <h2>工单列表</h2>
      <div class="filter-bar">
        <button
          v-for="item in filters"
          :key="item.key"
          :class="{ active: flow.filter.value === item.key }"
          @click="flow.filter.value = item.key"
        >
          {{ item.label }}（{{ countOf(item.key) }}）
        </button>
      </div>
      <EmptyState v-if="flow.filteredTickets.value.length === 0" />
      <article
        v-for="ticket in flow.filteredTickets.value"
        :key="ticket.id"
        class="row ticket-row"
        :class="{ selected: flow.selectedId.value === ticket.id }"
        @click="pick(ticket.id)"
      >
        <strong>#{{ ticket.id }} · {{ formatRisk(ticket.priority) }}优先级</strong>
        <StatusBadge :value="formatTicketStatus(ticket.status)" />
        <span>复电时间：{{ formatDateOrDash(ticket.restored_at) }}</span>
        <span v-if="ticketHasPartsAbnormal(ticket.id, usages)" class="badge danger">备件异常</span>
      </article>
    </div>

    <div class="panel" v-if="flow.selected.value">
      <h2>复电交接台 · 工单 #{{ flow.selected.value.id }}</h2>
      <CrewCard :crew="crew" :matched="isRestored ? undefined : crewMatched" />

      <template v-if="!isRestored">
        <h3>备件逐笔核对</h3>
        <EmptyState v-if="flow.checks.value.length === 0" />
        <article v-for="check in flow.checks.value" :key="check.usage.id" class="row part-row" :class="{ blocked: check.problem }">
          <div>
            <strong>{{ check.usage.part_name }}</strong>
            <span class="muted">{{ check.usage.part_code }} · {{ check.usage.warehouse_name }}</span>
          </div>
          <span>申请量 {{ check.usage.quantity }}</span>
          <StatusBadge :value="formatUsageStatus(check.usage.usage_status)" />
          <label v-if="check.usage.usage_status !== 'REJECTED'">
            实际用量
            <input type="number" min="0" v-model.number="flow.actuals[check.usage.id]" />
          </label>
          <span v-else class="badge danger">已退回</span>
        </article>

        <ul v-if="flow.blockers.value.length" class="blockers">
          <li v-for="message in flow.blockers.value" :key="message">{{ message }}</li>
        </ul>

        <div v-if="ticketStore.lastError" class="error-box">
          <strong>{{ ticketStore.lastError.message }}</strong>
          <ul v-if="errorParts.length">
            <li v-for="part in errorParts" :key="part.usage_id">
              {{ part.part_name }}（{{ part.part_code }}）：申请量 {{ part.quantity }}，实际用量 {{ part.actual_quantity ?? "未登记" }}
            </li>
          </ul>
        </div>
        <div v-if="confirmResult" class="ok-box">{{ confirmResult }}</div>

        <button class="primary" :disabled="!flow.canConfirm.value || ticketStore.confirming" @click="confirm">
          {{ ticketStore.confirming ? "确认中…" : "确认复电" }}
        </button>
      </template>

      <template v-else>
        <h3>复电结果</h3>
        <article class="row"><strong>复电时间</strong><span>{{ formatDateOrDash(flow.selected.value.restored_at) }}</span></article>
        <article class="row"><strong>班组释放结果</strong><StatusBadge :value="formatCrewRelease(flow.selected.value.crew_release_result)" /></article>

        <h3>备件实耗</h3>
        <article v-for="usage in flow.usagesOf(flow.selected.value.id)" :key="usage.id" class="row part-row">
          <div>
            <strong>{{ usage.part_name }}</strong>
            <span class="muted">{{ usage.part_code }}</span>
            <div v-if="usage.adjust_note" class="muted">调整说明：{{ usage.adjust_note }}</div>
          </div>
          <span>申请 {{ usage.quantity }} → 实耗 {{ usage.actual_quantity ?? "—" }}</span>
          <StatusBadge :value="formatUsageStatus(usage.usage_status)" />
        </article>

        <h3>复电后补记</h3>
        <p class="muted">工单已复电，不能再改回未复电；补记备件只会留下调整说明。</p>
        <article v-for="usage in flow.usagesOf(flow.selected.value.id)" :key="'adjust-' + usage.id" class="row part-row">
          <span>{{ usage.part_name }}</span>
          <label>
            实耗
            <input type="number" min="0" v-model.number="flow.actuals[usage.id]" />
          </label>
          <label class="note-field">
            调整说明
            <input type="text" v-model="adjustNotes[usage.id]" placeholder="必填：补记原因" />
          </label>
          <button :disabled="usageStore.adjusting" @click="adjust(usage.id)">保存补记</button>
        </article>
        <div v-if="adjustMessage" class="ok-box">{{ adjustMessage }}</div>
      </template>
    </div>
    <div class="panel" v-else><EmptyState /></div>
  </section>
</template>

<style scoped>
.tickets-desk { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 18px; align-items: start; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.filter-bar button { border: 1px solid #c9d0c3; border-radius: 999px; padding: 6px 14px; background: #fff; color: #223126; }
.filter-bar button.active { background: #223126; color: #f5f1e6; }
.ticket-row { cursor: pointer; grid-template-columns: 1fr auto auto auto; }
.ticket-row.selected { background: #f1ecdc; border-radius: 6px; }
.part-row { grid-template-columns: 1fr auto auto auto; }
.part-row.blocked { background: #f8e9e4; border-radius: 6px; }
.muted { color: #596257; font-size: 13px; display: block; }
.badge.danger { background: #f4d7ce; color: #8c2f1b; }
.blockers { color: #8c2f1b; font-weight: 600; line-height: 1.8; }
.error-box { border: 1px solid #d9a08f; background: #f8e9e4; border-radius: 8px; padding: 12px; margin: 12px 0; color: #8c2f1b; }
.ok-box { border: 1px solid #9dbb9f; background: #e9f2e6; border-radius: 8px; padding: 12px; margin: 12px 0; color: #244b31; }
button.primary { background: #274335; color: #f5f1e6; border-radius: 8px; padding: 10px 22px; font-weight: 700; }
button.primary:disabled { opacity: 0.45; cursor: not-allowed; }
input { border: 1px solid #c9d0c3; border-radius: 6px; padding: 6px 8px; margin-left: 6px; max-width: 140px; }
.note-field input { max-width: 220px; }
h3 { margin: 18px 0 10px; font-size: 15px; }
@media (max-width: 900px) { .tickets-desk { grid-template-columns: 1fr; } }
</style>
