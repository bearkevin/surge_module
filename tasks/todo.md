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
