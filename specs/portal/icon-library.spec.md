# Portal 图标库 Spec

## 概述

Portal 项目统一的图标管理系统，提供一致的图标解析、渲染和扩展机制，支持 Material Symbols 字体和文本 emoji/字符混合渲染。

---

## 设计目标

1. **一致性**：所有组件使用统一的 `AppIcon` 组件和图标解析逻辑
2. **灵活性**：支持多种图标来源（Material Symbols、emoji、文本）
3. **可扩展性**：便于添加新的图标别名和支持列表
4. **防错性**：自动降级处理、无效图标默认值、类型安全

---

## 核心概念

### 图标类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **Material Symbols** | Google Material Symbols 字体（推荐） | `bolt`, `auto_awesome`, `brush` |
| **Emoji** | 标准 Unicode emoji 或文本符号 | `⚡`, `✨`, `🤖` |
| **Text** | 短文本或自定义字符 | `AI`, `文`, `→` |

### 图标解析模式

| 模式 | 说明 | 使用场景 |
|------|------|---------|
| `auto`（默认） | 根据名称特征自动判断是否使用 Material Symbols，否则作文本渲染 | 大多数场景 |
| `material` | 强制使用 Material Symbols，不存在则用别名或 fallback | 明确需要图标字体的场景 |

---

## 组件使用

### AppIcon.vue

统一的图标渲染组件。

```vue
<template>
  <div>
    <!-- 自动模式（推荐） -->
    <AppIcon name="bolt" />
    <AppIcon name="⚡" />
    <AppIcon name="AI" />
    
    <!-- 显式指定 Material Symbols -->
    <AppIcon name="brush" mode="material" />
    
    <!-- 自定义大小 -->
    <AppIcon name="code" :size="32" />
    
    <!-- 自定义 fallback -->
    <AppIcon name="unknown_icon" fallback="help" />
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
</script>
```

### 组件 Props

```typescript
interface AppIconProps {
  name?: string | null        // 图标名称或符号，可空
  fallback?: string           // 无效/缺失图标的默认值（默认: 'help'）
  mode?: 'auto' | 'material'  // 解析模式（默认: 'auto'）
  size?: number | string      // 图标大小，单位 px，也支持 CSS 尺寸如 '1.5rem'
}
```

---

## 图标解析规则

### 1. 空值处理

```typescript
resolvePortalIcon(null)
resolvePortalIcon(undefined)
resolvePortalIcon('')
// → 返回 Material Symbols fallback（默认 'help'）
```

### 2. 强制 Material 模式

```typescript
resolvePortalIcon('bolt', { mode: 'material' })
// → { kind: 'material', value: 'bolt' }

resolvePortalIcon('lightning', { mode: 'material' })
// → { kind: 'material', value: 'bolt' }  // 使用别名
```

### 3. 自动模式判断

```typescript
// 规则 1: 匹配已知 Material Symbol 列表
resolvePortalIcon('auto_awesome')
// → { kind: 'material', value: 'auto_awesome' }

// 规则 2: 包含下划线或多个单词的类名
resolvePortalIcon('smart_toy')
// → { kind: 'material', value: 'smart_toy' }

// 规则 3: 非典型图标名称 → 作为文本/emoji 渲染
resolvePortalIcon('⚡')
// → { kind: 'text', value: '⚡' }

resolvePortalIcon('AI')
// → { kind: 'text', value: 'AI' }
```

---

## 内置 Material Symbols

### 已知的 Material Symbols 列表

| 符号 | 说明 | 别名 |
|------|------|------|
| `auto_awesome` | AI 相关 - 自动优化 | - |
| `bolt` | 电源/快速 | `lightning` |
| `brush` | 设计/绘制 | - |
| `build` | 构建/工具 | - |
| `code` | 编程 | - |
| `construction` | 施工/建设 | - |
| `engineering` | 工程 | - |
| `extension` | 扩展/插件 | - |
| `insights` | 数据/洞察 | - |
| `memory` | 内存/学习 | - |
| `science` | 科学/实验 | - |
| `smart_toy` | 智能/机器人 | - |
| `terminal` | 终端/命令行 | - |

### 添加新的 Material Symbols

编辑 `packages/portal/src/utils/portalIcon.ts`：

```typescript
// 1. 如果需要别名，添加到 MATERIAL_SYMBOL_ALIASES
const MATERIAL_SYMBOL_ALIASES: Record<string, string> = {
  lightning: 'bolt',
  // 新增:
  // flash: 'bolt',
}

// 2. 如果是常见图标，添加到 KNOWN_AUTO_MATERIAL_SYMBOLS
const KNOWN_AUTO_MATERIAL_SYMBOLS = new Set([
  'auto_awesome',
  'bolt',
  // 新增:
  // 'settings',
])
```

---

## 在组件中的使用示例

### 示例 1: AiTrendSection（AI 风向标）

```vue
<template>
  <div v-for="trend in trends" :key="trend.id">
    <AppIcon 
      class="trend-icon"
      :name="trend.icon"
      fallback="bolt"
      mode="material"
      :size="24"
    />
    <h3>{{ trend.title }}</h3>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { getAiTrends } from '@/api/aiTrends'

// 从 API 获取的 trend.icon 使用 Material Symbol 名称
// 如: 'bolt', 'auto_awesome', 'smart_toy' 等
</script>
```

### 示例 2: ToolGuide（工具指导，支持自由文本）

```vue
<template>
  <div v-for="guide in guides" :key="guide.id">
    <!-- 支持 emoji 或 Material Symbol -->
    <AppIcon 
      :name="guide.icon"
      fallback="help"
      mode="auto"
      :size="40"
    />
    <h3>{{ guide.title }}</h3>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { getToolGuides } from '@/api/toolGuides'

// guide.icon 可以是:
// - Material Symbol: 'code', 'brush', 'auto_awesome'
// - Emoji: '💻', '🎨', '✨'
// - 文本: 'AI', '数据', '管理'
</script>
```

---

## Material Symbols 字体

### 字体文件

- 位置：`packages/portal/src/assets/fonts/material-symbols-rounded-latin-400-normal.woff2`
- 格式：WOFF2（现代浏览器优化）
- 样式：Rounded（圆角风格）
- 字重：400（Regular）

### 字体加载

在 `packages/portal/src/assets/main.css` 中定义：

```css
@font-face {
  font-family: 'Material Symbols Rounded';
  src: url('/src/assets/fonts/material-symbols-rounded-latin-400-normal.woff2')
    format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

---

## 类型定义

```typescript
// 图标类型
export type PortalIconKind = 'material' | 'text'
export type PortalIconMode = 'auto' | 'material'

// 解析后的结果
export interface ResolvedPortalIcon {
  kind: PortalIconKind
  value: string
}

// 解析选项
interface ResolvePortalIconOptions {
  fallback?: string
  mode?: PortalIconMode
}
```

---

## 工具函数（utils/portalIcon.ts）

| 函数 | 说明 | 示例 |
|------|------|------|
| `resolvePortalIcon(icon, options)` | 解析图标，返回 `{ kind, value }` | `resolvePortalIcon('bolt')` |
| `normalizeMaterialSymbolName(name)` | 规范化名称（小写、空格转下划线） | `normalizeMaterialSymbolName('Auto Awesome')` → `'auto_awesome'` |
| `canonicalizeMaterialSymbolName(name)` | 规范化 + 应用别名 | `canonicalizeMaterialSymbolName('lightning')` → `'bolt'` |
| `isAutoMaterialSymbolName(icon)` | 判断是否应在自动模式下使用 Material Symbols | `isAutoMaterialSymbolName('bolt')` → `true` |

---

## 测试

测试文件位置：`packages/portal/tests/portalIcon.spec.ts`

涵盖场景：
- ✅ 空值处理
- ✅ 别名解析
- ✅ 自动/强制模式判断
- ✅ emoji 与文本混合
- ✅ 未知图标的 fallback 降级

---

## 迁移指南

### 从旧的 emoji 映射迁移

**旧代码：**
```typescript
function resolveTrendIcon(icon?: string | null): string {
  const iconMap: Record<string, string> = {
    bolt: '⚡',
    brush: '🖌',
    auto_awesome: '✨',
  }
  return iconMap[normalized] || '📡'
}
```

**新代码：**
```vue
<AppIcon :name="trend.icon" fallback="bolt" mode="material" />
```

### 从直接 emoji 迁移

**旧代码：**
```vue
<span>{{ trend.emoji }}</span>  <!-- 直接渲染 emoji -->
```

**新代码：**
```vue
<AppIcon :name="trend.emoji" fallback="help" mode="auto" />
```

---

## 最佳实践

1. **优先使用 Material Symbols**：对于系统图标、操作图标，使用 Material Symbol 名称
2. **用户贡献内容允许 emoji**：ToolGuide、案例展示等允许用户提供 emoji
3. **始终设置 fallback**：为缺失/无效图标设置合理的默认值
4. **指定 mode**：
   - `mode="material"` 用于 API 返回的标准图标名（确定性）
   - `mode="auto"` 用于用户输入或混合来源（容错性）
5. **保持命名一致**：新增图标时，遵循 Material Symbols 命名规范

---

## 相关文件

- 组件：`packages/portal/src/components/AppIcon.vue`
- 工具函数：`packages/portal/src/utils/portalIcon.ts`
- 测试：`packages/portal/tests/portalIcon.spec.ts`
- 字体：`packages/portal/src/assets/fonts/material-symbols-rounded-latin-400-normal.woff2`
- 样式：`packages/portal/src/assets/main.css`
