# QM-UI 核心架构文档 (V1.0)

## 1. 物理分层原则 (Layering Strategy)
我们的表格库严格区分为两层，绝不可跨层污染：
- **Layer 1: The Pure Engine (纯底座 `BaseGridEngine`)**
  - **职责：** 仅负责高阶渲染、键盘事件二维劫持、十字坐标视觉呈现。
  - **原则：** 绝对不包含业务字段硬编码；所有非核心功能（如 Dock、Crosshair、KeyboardNav）必须通过 `features` 属性按需开启。
- **Layer 2: The Business Template (业务模版 `DataEntryGrid`)**
  - **职责：** 承载业务流转。接收底层传来的事件，进行业务规则校验（Schema Validation），控制扫码自动聚焦，并向底座下发 `dockedRowKeys` 聚拢指令。

## 2. 二维键盘导航引擎 (2D Keyboard Navigation)
放弃传统依赖 Tab 的单线跳转，在引擎内部构建二维坐标系：
- **DOM 坐标系：** 所有 `td` 被注入 `data-row` 与 `data-col` 属性。
- **全局事件劫持：** 在滚动容器顶层监听 `onKeyDown`，拦截 `ArrowUp`, `ArrowDown`, `Enter` 等按键。
- **精准制导：** 根据当前坐标计算下一个目标，利用 `document.querySelector` 跨越 DOM 树（包括普通数据区与 Dock 隔离区）实现焦点的 0 毫秒瞬间转移。

## 3. 选中态与编辑态解耦 (Selection vs. Edit Mode)
- 所有单元格（包括只读的文本单元格）必须拥有获取焦点的能力（通过赋予 `tabIndex=0`），以支持全局键盘穿梭和十字星覆盖。
- 可编辑单元格（如 Input）由业务组件内部接管 `autoFocus` 与 `onFocus={e => e.target.select()}`，实现“一挂载即全选”的极致输入心流。

## 4. 错题隔离区与滚动状态机 (Dock Zone & Auto-Scroll)
- **按需吸底：** 异常数据不自动飞走（避免视觉恐慌）。只有当用户主动触发聚拢开关（`isDockActive`），业务层才向底座传递 `dockedRowKeys`。
- **智能平滑滚动：** 聚拢发生的瞬间，利用宏任务 (`setTimeout 0`) 等待 DOM 重排完毕，自动通过 `scrollTo` 将视口平滑移动至底部的错题区。