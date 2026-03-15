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

---

# Task Log - 2026-03-12

## 任务
调整 `scripts/subscription_panel.js` 的重置剩余天数语义：当 `subscription-userinfo` 中有 `resetday` 时，直接将其作为 `resetDayLeft`；仅在 header 没有有效 `resetday` 时，才使用旧参数 `reset_day` 通过 `getRmainingDays(...)` 计算剩余天数。

## 计划（可检查项）
- [x] 核对当前脚本中 `resetDayLeft`、`resetday`、`reset_day` 的现状与现网参数名
- [x] 调整 `resetDayLeft` 赋值逻辑，使 header `resetday` 直接作为剩余天数
- [x] 保留 header 缺失时对旧参数 `reset_day` 的日期计算回退逻辑
- [x] 运行针对性验证，覆盖 header 直出、旧参数回退、无效值回退、忽略传入 `resetday` 的场景
- [x] 更新评审记录
- [x] 更新 `tasks/lessons.md` 记录本次用户纠正得到的经验

## 执行记录（高层）
1. 已将顶层流程改为直接计算 `resetDayLeft`，不再先解析统一的 `resetDay`。
2. 当 header 中存在有效 `resetday` 时，脚本直接显示该值为剩余天数；只有 header 缺失时才回退到 `args["reset_day"]` 做日期换算。
3. 已移除 `args.resetday` 参与重置剩余天数计算的行为，避免和 header `resetday` 的新语义混淆。
4. 已用固定日期的本地 `node` + `vm` 仿真验证 6 个场景，覆盖 header 直出、旧参数回退、无效值回退、忽略传入 `resetday`、无重置日隐藏显示。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
  - `tasks/lessons.md`
- 验证方式：运行固定日期的本地 `node` 仿真，检查 `resetDayLeft` 在 header 与 `reset_day` 两条分支下的行为
- 结果：6/6 场景通过；header `resetday` 现在直接显示为剩余天数，`reset_day` 仅在 header 缺失时参与日期计算

---

# Task Log - 2026-03-15

## 任务
将 `scripts/subscription_panel.js` 返回内容中的“已用流量 | 总流量”改为仅显示“剩余流量”，其值为 `总流量 - 已用流量`，并在异常场景下最低显示 `0B`。

## 计划（可检查项）
- [x] 确认当前首行流量字符串的拼接方式与参与字段
- [x] 将首行流量计算改为 `remaining = max(total - used, 0)`
- [x] 保持重置天数、到期时间、标题、图标和请求逻辑不变
- [x] 用本地 `node` + `vm` 仿真验证正常、边界、异常和回归场景
- [x] 更新评审记录

## 执行记录（高层）
1. 已确认当前首行由 `info.download + info.upload` 与 `info.total` 组成 `用量：已用 | 总量`。
2. 已将首行调整为 `剩余：...`，并新增 `Math.max(total - used, 0)` 避免异常数据产生负数展示。
3. 保持重置、到期、标题、图标、请求方法和响应头解析逻辑不变。
4. 已使用本地 `node` + `vm` 仿真验证 4 类场景，覆盖正常、边界、异常和回归拼接行为。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
- 验证方式：运行本地 `node` + `vm` 仿真，检查 `$done().content` 在不同流量输入下的首行输出，以及重置/到期行是否保持不变
- 结果：正常场景显示正确剩余流量；`total === used` 与 `used > total` 均显示 `剩余：0B`；重置与到期行仍按原条件拼接

---

# Task Log - 2026-03-15

## 任务
修复 `scripts/subscription_panel.js` 中 Nexitally 重置剩余天数不显示的问题，兼容参数 `resetday` 与 `reset_day` 两种写法，同时保留 header `resetday` 代表“剩余天数”的优先语义。

## 计划（可检查项）
- [x] 核对当前重置天数来源分支与 Nexitally/WCloud 配置差异
- [x] 在 header `resetday` 优先前提下，补回参数 `resetday` 的回退兼容
- [x] 保持剩余流量显示逻辑和其他展示逻辑不变
- [x] 用本地 `node` + `vm` 仿真验证 header、`reset_day`、`resetday` 三条路径
- [x] 更新评审记录
- [x] 更新 `tasks/lessons.md`

## 执行记录（高层）
1. 已确认当前脚本只会从 `info.resetday` 和 `args["reset_day"]` 读取重置信息，而不会读取 `args.resetday`。
2. 已将参数回退分支改为 `args["reset_day"]` 优先、`args.resetday` 兼容回退；header `info.resetday` 仍优先并直接表示“剩余天数”。
3. 保持剩余流量、到期时间、标题、图标、请求方式与响应头解析逻辑不变。
4. 已用本地 `node` + `vm` 仿真验证 5 个场景，覆盖 header 优先、`reset_day` 回退、`resetday` 回退、无效参数隐藏、与剩余流量共存的回归场景。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
  - `tasks/lessons.md`
- 验证方式：运行本地 `node` + `vm` 仿真，检查 `content` 中重置行在 `info.resetday`、`args.reset_day`、`args.resetday` 三种来源下的输出
- 结果：header `resetday` 继续优先直出；`reset_day` 与 `resetday` 均可在 header 缺失时正确回退；剩余流量首行保持为 `剩余：...`

---

# Task Log - 2026-03-15

## 任务
当订阅响应头返回 `resetday=0` 时，将 `scripts/subscription_panel.js` 的重置文案从隐藏改为显示 `重置：今天`。

## 计划（可检查项）
- [x] 核对当前 `resetday=0` 被隐藏的具体原因
- [x] 将重置展示逻辑改为返回最终文案，兼容 `今天` 与 `剩余X天` 两种形式
- [x] 保持剩余流量、到期时间与参数回退逻辑不变
- [x] 用真实 Nexitally 响应头和本地仿真覆盖 `resetday=0`、`resetday>0`、参数回退场景
- [x] 更新评审记录
- [x] 更新 `tasks/lessons.md`

## 执行记录（高层）
1. 已确认该订阅链接在 `2026-03-15` 实际返回 `subscription-userinfo: ... resetday=0`，脚本此前因只接受正整数而隐藏了重置行。
2. 已将重置分支改为统一生成展示文本：header `resetday=0` 时返回 `今天`，header 正整数时返回 `剩余X天`，参数回退仍返回 `剩余X天`。
3. 保持剩余流量首行、到期时间、标题、图标、请求方式与 header 解析逻辑不变。
4. 已用真实响应头和本地 `node` + `vm` 仿真验证 5 个场景，覆盖 `resetday=0`、header 正整数、`reset_day` 回退、`resetday` 回退、异常流量钳制。

## 评审
- 变更文件：
  - `scripts/subscription_panel.js`
  - `tasks/todo.md`
  - `tasks/lessons.md`
- 验证方式：运行本地 `node` + `vm` 仿真，并使用真实 Nexitally 响应头检查 `content` 中重置行输出
- 结果：真实 Nexitally 链接对应响应头现在输出 `重置：今天`；header 正整数与参数回退场景继续输出 `重置：剩余X天`
