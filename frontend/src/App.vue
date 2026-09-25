<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

const pages: Record<string, Component> = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
};

const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const activePage = computed(() => pages[active.value] ?? DashboardPage);
const entries = Object.entries(mockData);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head"><div><p class="eyebrow">grid-repair</p><h1>{{ current?.name }}</h1></div><StatusBadge value="LOCAL_DATA" /></section>
      <template v-if="active === '/dashboard'">
        <section class="metrics"><StatCard label="核心模型" :value="entries.length" /><StatCard label="共享枚举" :value="3" /><StatCard label="本地记录" :value="entries.reduce((s, [, rows]) => s + rows.length, 0)" /></section>
        <section class="workbench"><div class="panel wide"><h2>业务数据</h2><article class="row" v-for="[key, rows] in entries" :key="key"><strong>{{ key }}</strong><span>{{ rows.length }} 条</span><StatusBadge value="READY" /></article></div><div class="panel"><h2>联动检查</h2><p>页面、store、API、构造器、日志模板和枚举常量均按提示词拆分。</p></div></section>
      </template>
      <component v-else :is="activePage" />
    </main>
  </div>
</template>
