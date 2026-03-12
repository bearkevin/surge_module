# Task Log - 2026-02-27

## 任务
将 `sub_info.sgmodule` 的脚本引用切换为仓库内 `scripts/subscription_panel.js` 的 GitHub Raw URL，并确保本地脚本与原远程引用脚本一致。

## 计划（可检查项）
- [x] 拉取原 `sub_info.sgmodule` 里引用的远程脚本
- [x] 对比远程脚本与 `scripts/subscription_panel.js`
- [x] 若不一致，用远程脚本覆盖本地脚本
- [x] 修改 `sub_info.sgmodule` 中两处 `script-path` 指向 Raw URL
- [x] 校验变更（哈希/差异/配置行）
- [x] 提交并推送到 `origin/main`

## 执行记录（高层）
1. 对比结果不一致：本地与远程脚本哈希不同。
2. 已用远程脚本覆盖 `scripts/subscription_panel.js`，覆盖后两者一致。
3. 将 `sub_info.sgmodule` 两处 `script-path` 更新为：
   `https://raw.githubusercontent.com/bearkevin/surge_module/main/scripts/subscription_panel.js`
4. 已完成 Git 提交与推送。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `sub_info.sgmodule`
- 提交信息：`chore: sync subscription panel script and use raw script-path`
- 提交哈希：`d0714a0`
- 结果：已推送到 `origin/main`

---

# Task Log - 2026-03-12

## 任务
调整 `scripts/subscription_panel.js` 的重置日来源优先级：优先使用 `subscription-userinfo` 中的 `resetday`，否则回退到传入参数，并兼容 `reset_day` 与 `resetday` 两种参数名。

## 计划（可检查项）
- [x] 确认当前脚本对 `subscription-userinfo`、`reset_day` 的解析方式
- [x] 设计最终重置日解析优先级：`header.resetday` > `argument.reset_day` > `argument.resetday`
- [x] 修改脚本，仅调整重置日来源逻辑，不改动其他显示行为
- [x] 运行针对性验证，覆盖 header 优先、参数回退、无效值回退场景
- [x] 更新评审记录
- [x] 更新 `tasks/lessons.md` 记录本次纠正得到的经验

## 执行记录（高层）
1. 已确认 `subscription-userinfo` 当前会遍历并解析所有符合 `key=value` 的数值字段，因此 `resetday` 无需额外定制解析。
2. 已在脚本中新增统一的最终重置日解析步骤，按 `header.resetday`、`args.reset_day`、`args.resetday` 的优先级选择最终重置日。
3. 已用本地 `node` + `vm` 仿真验证 5 个场景：header 优先、`reset_day` 回退、`resetday` 回退、无效 header 回退、无有效值时不返回重置日。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
  - `tasks/lessons.md`
- 验证方式：运行本地 `node` 仿真，直接调用 `resolveResetDay(...)` 验证优先级与回退逻辑
- 结果：5/5 场景通过，未改动流量、到期日、标题、图标相关逻辑

---

# Task Log - 2026-03-12

## 任务
将 `scripts/subscription_panel.js` 的重置日优先级改为“传参优先，header 回退”：优先使用传入的 `resetday`，其次兼容旧参数 `reset_day`，最后再使用 `subscription-userinfo` 中的 `resetday`。

## 计划（可检查项）
- [x] 核对当前脚本与现网配置里的 `resetday` / `reset_day` 使用情况
- [x] 调整 `resolveResetDay(...)` 的候选顺序为 `args.resetday` > `args.reset_day` > `info.resetday`
- [x] 运行针对性验证，覆盖传参优先、旧参数兼容、header 回退、无效值回退场景
- [x] 更新评审记录
- [x] 更新 `tasks/lessons.md` 记录本次用户纠正得到的经验

## 执行记录（高层）
1. 已确认当前脚本仍是 header 优先，仓库现网配置仍在使用 `reset_day=25`。
2. 已将最终重置日解析顺序调整为 `args.resetday`、`args.reset_day`、`info.resetday`。
3. 已用本地 `node` + `vm` 仿真验证 6 个场景，覆盖传参优先、旧参数兼容、header 回退、无效值回退、无重置日隐藏显示。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
  - `tasks/lessons.md`
- 验证方式：运行本地 `node` 仿真，检查 `resetday`、`reset_day`、header `resetday` 的优先级与回退逻辑
- 结果：6/6 场景通过，当前行为已改为“传参优先，header 回退”，未改动流量、到期日、标题、图标相关逻辑
