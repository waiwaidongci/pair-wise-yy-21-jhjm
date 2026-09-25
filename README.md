# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器（待复电/已复电）、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- SparePartUsageStatus（PENDING/APPROVED/REJECTED/CONSUMED/POST_RESTORE_ADJUST）: 前后端 constants/SparePartUsageStatus、statusText、utils/formatters、复电核对与补记逻辑、备件异常筛选器、TicketsPage 展示均有引用。
- CrewDutyStatus（AVAILABLE/BUSY/OFF_DUTY）与 CrewReleaseResult（RELEASED/NOT_RELEASED）: 前后端 constants/CrewDutyStatus、statusText、utils/formatters、CrewCard、班组释放逻辑均有引用。

## 复电交接台（/tickets）

- 确认复电前逐笔核对该工单的备件申请：申请被退回（REJECTED）或申请量与实际用量不一致时不能确认，页面和接口都会列出具体备件。
- 确认成功后保存复电时间（restored_at）、备件实耗（actual_quantity + CONSUMED）和班组释放结果（crew_release_result=RELEASED），班组 current_ticket_id 清空并回到 AVAILABLE 可派状态。
- 班组记录中挂的不是这张工单（crew.current_ticket_id ≠ ticket.id）时，确认不生效（CREW_TICKET_MISMATCH）。
- 已复电工单只能补记备件调整说明（POST_RESTORE_ADJUST，adjust_note 必填），不能改回未复电（TICKET_ALREADY_RESTORED）。
- 记录保存在后端，关闭页面再打开仍会重新加载；列表支持待复电、备件异常、已复电筛选。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
