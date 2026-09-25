<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import CrewCard from "../components/common/CrewCard.vue";
import TimelineList from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useCrewStore } from "../stores/CrewStore";
import { useRestorationHandoverStore } from "../stores/RestorationHandoverStore";
import { useTicketFlow, type FlowResult } from "../hooks/useTicketFlow";
import { useCrewAvailability } from "../hooks/useCrewAvailability";
import { SparePartUsageStatusText } from "../constants/SparePartUsageStatus";
import { formatDate } from "../utils/formatters";

const ticketStore = useRepairTicketStore();
const partStore = useSparePartUsageStore();
const crewStore = useCrewStore();
const handoverStore = useRestorationHandoverStore();
const flow = useTicketFlow();
const crewAvailability = useCrewAvailability();

onMounted(() => {
  ticketStore.load();
  partStore.load();
  crewStore.load();
  handoverStore.load();
});

type TicketFilter = "ALL" | "PENDING" | "PART_EXCEPTION";
const filter = ref<TicketFilter>("ALL");
const filterOptions: { key: TicketFilter; label: string }[] = [
  { key: "ALL", label: "全部" },
  { key: "PENDING", label: "待复电" },
  { key: "PART_EXCEPTION", label: "备件异常" }
];

const pendingCount = computed(() => ticketStore.rows.filter((row) => flow.isPendingRestoration(row)).length);
const exceptionCount = computed(() => ticketStore.rows.filter((row) => flow.hasException(row.id)).length);
const restoredCount = computed(() => ticketStore.rows.filter((row) => row.status === "RESTORED").length);

const filteredTickets = computed(() => {
  if (filter.value === "PENDING") return ticketStore.rows.filter((row) => flow.isPendingRestoration(row));
  if (filter.value === "PART_EXCEPTION") return ticketStore.rows.filter((row) => flow.hasException(row.id));
  return ticketStore.rows;
});

const selectedId = ref<number | null>(null);
const selected = computed(() => ticketStore.rows.find((row) => row.id === selectedId.value) ?? null);
const selectedCrew = computed(() => (selected.value ? flow.crewOf(selected.value) : null));
const crewBound = computed(() =>
  selected.value ? crewAvailability.isBoundTo(selectedCrew.value, selected.value.id) : false
);
const checks = computed(() => (selected.value ? flow.checksOf(selected.value.id) : []));
const blockers = computed(() => checks.value.filter((item) => !item.ok));
const canConfirm = computed(
  () => !!selected.value && flow.isPendingRestoration(selected.value) && blockers.value.length === 0 && crewBound.value
);
const selectedHandover = computed(() => (selected.value ? flow.handoverOf(selected.value.id) : null));

const partCheckLabel = (ticketId: number) => {
  const items = flow.partsOf(ticketId);
  if (items.length === 0) return "无备件";
  return flow.hasException(ticketId) ? "备件异常" : "核对通过";
};

// 复电前由补记人逐笔登记实耗
const actualDrafts = reactive<Record<number, number>>({});
watch(selectedId, () => {
  Object.keys(actualDrafts).forEach((key) => delete actualDrafts[Number(key)]);
  flow.partsOf(selectedId.value ?? -1).forEach((usage) => {
    actualDrafts[usage.id] = usage.actual_quantity ?? usage.quantity;
  });
  confirmResult.value = null;
  adjustResult.value = null;
});

function registerActual(usageId: number) {
  const value = actualDrafts[usageId];
  if (value === undefined || value === null || Number.isNaN(value)) return;
  partStore.updateActual(usageId, value);
}

const confirmResult = ref<FlowResult | null>(null);
const confirming = ref(false);
async function onConfirm() {
  if (!selected.value) return;
  confirming.value = true;
  confirmResult.value = await flow.confirmRestoration(selected.value.id);
  confirming.value = false;
}

// 复电后补记：只允许调整实耗并必填调整说明
const adjustForm = reactive({ usageId: 0, actual: 0, note: "" });
const adjustResult = ref<FlowResult | null>(null);
function resetAdjustForm() {
  const first = flow.partsOf(selectedId.value ?? -1)[0];
  adjustForm.usageId = first?.id ?? 0;
  adjustForm.actual = first?.actual_quantity ?? first?.quantity ?? 0;
  adjustForm.note = "";
}
watch(selectedId, resetAdjustForm);
watch(() => selected.value?.status, resetAdjustForm);
watch(
  () => adjustForm.usageId,
  (id) => {
    const usage = partStore.rows.find((row) => row.id === id);
    if (usage) adjustForm.actual = usage.actual_quantity ?? usage.quantity;
  }
);
async function onAdjust() {
  if (!selected.value) return;
  adjustResult.value = await flow.adjustRestoredPart(selected.value.id, adjustForm.usageId, adjustForm.actual, adjustForm.note);
}

const handoverItems = computed(() =>
  [...handoverStore.rows]
    .sort((a, b) => b.restored_at.localeCompare(a.restored_at))
    .map((record) => ({
      time: formatDate(record.restored_at),
      text: `工单 #${record.ticket_id} 复电确认 · 班组「${record.crew_name}」${record.crew_released ? "已释放回可派" : "未释放"} · 备件实耗 ${
        record.parts.map((part) => `${part.part_name}×${part.actual_quantity ?? "-"}`).join("、") || "无"
      }`
    }))
);
</script>

<template>
  <section class="metrics">
    <StatCard label="待复电工单" :value="pendingCount" />
    <StatCard label="备件异常工单" :value="exceptionCount" />
    <StatCard label="已复电工单" :value="restoredCount" />
  </section>

  <section class="panel wide">
    <div class="panel-head">
      <h2>工单列表</h2>
      <div class="filters">
        <button
          v-for="option in filterOptions"
          :key="option.key"
          :class="{ active: filter === option.key }"
          @click="filter = option.key"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <table class="table" v-if="filteredTickets.length">
      <thead>
        <tr>
          <th>工单</th><th>优先级</th><th>状态</th><th>班组</th><th>派工时间</th><th>复电时间</th><th>备件核对</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in filteredTickets" :key="ticket.id" :class="{ selected: ticket.id === selectedId }">
          <td>#{{ ticket.id }}</td>
          <td><PriorityTag :value="ticket.priority" /></td>
          <td><StatusBadge :value="ticket.status" /></td>
          <td>{{ flow.crewOf(ticket)?.name ?? "未派班" }}</td>
          <td>{{ formatDate(ticket.assigned_at) }}</td>
          <td>{{ ticket.restored_at ? formatDate(ticket.restored_at) : "—" }}</td>
          <td>
            <span class="badge" :class="flow.hasException(ticket.id) ? 'badge-bad' : 'badge-ok'">{{ partCheckLabel(ticket.id) }}</span>
          </td>
          <td><button class="link" @click="selectedId = ticket.id">核对</button></td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-else />
  </section>

  <section class="workbench" v-if="selected">
    <div class="panel wide">
      <h2>复电核对 · 工单 #{{ selected.id }}</h2>
      <div class="crew-strip">
        <CrewCard :crew="selectedCrew" />
        <p v-if="selectedCrew && !crewBound && flow.isPendingRestoration(selected)" class="alert alert-error">
          班组「{{ selectedCrew.name }}」当前挂接的工单是 #{{ selectedCrew.current_ticket_id }}，不是本工单，确认将不生效。
        </p>
        <p v-if="!selectedCrew" class="alert alert-error">该工单未找到对应班组记录，确认将不生效。</p>
      </div>

      <table class="table" v-if="checks.length">
        <thead>
          <tr>
            <th>备件编码</th><th>名称</th><th>申请量</th><th>实际用量</th><th>申请状态</th><th>核对结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in checks" :key="item.usage.id">
            <td>{{ item.usage.part_code }}</td>
            <td>{{ item.usage.part_name }}</td>
            <td>{{ item.usage.quantity }}</td>
            <td v-if="flow.isPendingRestoration(selected)">
              <span class="actual-input">
                <input type="number" min="0" v-model.number="actualDrafts[item.usage.id]" />
                <button class="link" @click="registerActual(item.usage.id)">登记</button>
              </span>
            </td>
            <td v-else>{{ item.usage.actual_quantity ?? "—" }}</td>
            <td>
              <StatusBadge :value="SparePartUsageStatusText[item.usage.usage_status as keyof typeof SparePartUsageStatusText] ?? item.usage.usage_status" />
            </td>
            <td>
              <span v-if="item.ok" class="check-ok">✓ 一致</span>
              <span v-else class="check-bad">{{ item.reasons.join("；") }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else />

      <template v-if="flow.isPendingRestoration(selected)">
        <div class="actions">
          <button class="primary" :disabled="!canConfirm || confirming" @click="onConfirm">
            {{ confirming ? "确认中…" : "确认复电" }}
          </button>
          <span v-if="blockers.length" class="hint">备件核对未通过：{{ blockers.map((item) => item.usage.part_name).join("、") }}</span>
          <span v-else-if="!crewBound" class="hint">班组未挂接本工单，不能确认</span>
        </div>
        <p v-if="confirmResult && !confirmResult.ok" class="alert alert-error">
          {{ confirmResult.message }}
          <template v-if="confirmResult.blockers?.length">
            （{{ confirmResult.blockers.map((item) => `${item.usage.part_name}：${item.reasons.join("；")}`).join("；") }}）
          </template>
        </p>
        <p v-if="confirmResult?.ok" class="alert alert-ok">复电确认成功，班组已释放回可派状态。</p>
      </template>

      <template v-else>
        <div class="restore-summary">
          <p>复电时间：<strong>{{ selected.restored_at ? formatDate(selected.restored_at) : "—" }}</strong></p>
          <p v-if="selectedHandover">
            班组释放：「{{ selectedHandover.crew_name }}」{{ selectedHandover.crew_released ? "已清空当前工单并回到可派" : "未释放" }}
            （{{ formatDate(selectedHandover.released_at) }}）
          </p>
        </div>
        <h3>复电后补记备件</h3>
        <p class="hint">工单已复电，不能改回未复电；补记只允许登记实耗并留下调整说明。</p>
        <div class="adjust-form">
          <select v-model.number="adjustForm.usageId">
            <option v-for="usage in flow.partsOf(selected.id)" :key="usage.id" :value="usage.id">
              {{ usage.part_code }} · {{ usage.part_name }}（申请 {{ usage.quantity }}）
            </option>
          </select>
          <input type="number" min="0" v-model.number="adjustForm.actual" placeholder="实际用量" />
          <input type="text" v-model="adjustForm.note" placeholder="调整说明（必填）" />
          <button class="primary" @click="onAdjust">补记</button>
        </div>
        <p v-if="adjustResult && !adjustResult.ok" class="alert alert-error">{{ adjustResult.message }}</p>
        <p v-if="adjustResult?.ok" class="alert alert-ok">补记已保存，工单保持已复电状态。</p>
        <ul class="adjust-notes" v-if="flow.partsOf(selected.id).some((usage) => usage.adjust_note)">
          <li v-for="usage in flow.partsOf(selected.id).filter((item) => item.adjust_note)" :key="usage.id">
            {{ usage.part_name }}：实耗 {{ usage.actual_quantity }}，说明「{{ usage.adjust_note }}」
          </li>
        </ul>
      </template>
    </div>

    <div class="panel">
      <h2>复电交接记录</h2>
      <TimelineList v-if="handoverItems.length" :items="handoverItems" title="交接流水" />
      <EmptyState v-else />
    </div>
  </section>

  <section class="panel" v-else>
    <h2>复电交接记录</h2>
    <TimelineList v-if="handoverItems.length" :items="handoverItems" title="交接流水" />
    <EmptyState v-else />
  </section>
</template>
