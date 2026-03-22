# Маппинг UI-компонентов из platform-develop в Drivengo CRM

Этот файл содержит детальный маппинг компонентов и паттернов UI из `references/platform-develop` в проект Drivengo CRM.

**Основной донор UI:** `references/platform-develop` (приоритетный)
**Лицензия platform-develop:** EPL-2.0 (Eclipse Public License 2.0)

---

## Базовые UI компоненты

| Что в Drivengo | Где сейчас (файл) | Какой аналог в platform-develop | Путь в platform-develop | Что переносим | Что адаптируем |
|---|---|---|---|---|---|
| Button | `src/ui/Button.tsx` | Button, ModernButton | `packages/ui/src/components/Button.svelte`, `ModernButton.svelte` | стили, варианты (primary/secondary/positive/negative), размеры, состояния (loading/disabled/pressed/selected) | Svelte -> React, адаптация props под React API |
| IconButton | `src/ui/Button.tsx` (IconButton) | ButtonIcon, CircleButton | `packages/ui/src/components/ButtonIcon.svelte`, `CircleButton.svelte` | стили, размеры, состояния | Svelte -> React |
| Input | `src/ui/Input.tsx` | EditBox, ModernEditbox | `packages/ui/src/components/EditBox.svelte`, `ModernEditbox.svelte` | стили, состояния (error/disabled/focus), типы | Svelte -> React |
| SearchInput | `src/ui/Input.tsx` (SearchInput) | SearchEdit, SearchInput | `packages/ui/src/components/SearchEdit.svelte`, `SearchInput.svelte` | стили, иконка поиска | Svelte -> React |
| Tabs | `src/ui/Tabs.tsx` | Tabs, ModernTab, TabList | `packages/ui/src/components/Tabs.svelte`, `ModernTab.svelte`, `TabList.svelte` | стили табов, активное состояние, hover | адаптация под Radix UI (текущий подход), стили из platform-develop |
| Badge | `src/ui/Badge.tsx` | Chip, StateTag, StatusBadge | `packages/ui/src/components/Chip.svelte`, `StateTag.svelte`, `StatusBadge.svelte` | стили, варианты для статусов, цвета | адаптация под React |
| Dialog | `src/ui/Dialog.tsx` | Dialog, ModernDialog, Modal | `packages/ui/src/components/Dialog.svelte`, `ModernDialog.svelte`, `Modal.svelte` | стили, layout, overlay | адаптация под Radix UI (текущий подход) |
| DropdownMenu | `src/ui/DropdownMenu.tsx` | Dropdown, DropdownPopup, Menu, PopupMenu | `packages/ui/src/components/Dropdown.svelte`, `DropdownPopup.svelte`, `Menu.svelte`, `PopupMenu.svelte` | стили, позиционирование | адаптация под Radix UI (текущий подход) |
| Tooltip | `src/ui/Tooltip.tsx` | TooltipInstance | `packages/ui/src/components/TooltipInstance.svelte` | стили, позиционирование | адаптация под Radix UI (текущий подход) |
| EmptyState | `src/ui/EmptyState.tsx` | SectionEmpty | `packages/ui/src/components/SectionEmpty.svelte` | стили, иконка, текст | улучшение текущего компонента |

---

## Новые компоненты (для создания)

| Компонент | Где создать | Аналог в platform-develop | Путь в platform-develop | Что переносим | Что адаптируем |
|---|---|---|---|---|---|
| Card | `src/ui/kit/Card.tsx` | Card (presentation), Panel | `packages/presentation/src/components/Card.svelte`, `packages/ui/src/components/Panel.svelte` | стили, варианты, layout | Svelte -> React, адаптация под Tailwind |
| Separator | `src/ui/kit/Separator.tsx` | Separator | `packages/ui/src/components/Separator.svelte` | стили, ориентация (вертикальный/горизонтальный) | Svelte -> React |
| Skeleton | `src/ui/kit/Skeleton.tsx` | Loading, Spinner | `packages/ui/src/components/Loading.svelte`, `Spinner.svelte` | стили для loading состояний | создание компонента для skeleton screens |
| ScrollArea | `src/ui/kit/ScrollArea.tsx` | ScrollBox, Scroller, ScrollerBar | `packages/ui/src/components/ScrollBox.svelte`, `Scroller.svelte`, `ScrollerBar.svelte` | стилизация скроллбаров | улучшение текущего скролла, стили platform-develop |
| Tag | `src/ui/kit/Tag.tsx` (или расширить Badge) | Chip, StateTag | `packages/ui/src/components/Chip.svelte`, `StateTag.svelte` | стили, варианты для каналов (Avito, Telegram, Calls) | адаптация Badge или создание Tag |

---

## Компоненты страниц

| Что в Drivengo | Где сейчас (файл) | Какой аналог в platform-develop | Путь в platform-develop | Что переносим | Что адаптируем |
|---|---|---|---|---|---|
| Pipeline Board | `features/pipeline/PipelineBoard.tsx` | Kanban | `packages/kanban/src/components/Kanban.svelte`, `KanbanRow.svelte` | layout колонок, стили, drag & drop визуальные паттерны | логика drag & drop (dnd-kit), данные (наши API) |
| StageColumn | `features/pipeline/StageColumn.tsx` | KanbanRow | `packages/kanban/src/components/KanbanRow.svelte` | header колонки, стили, метрики | структура данных (наши стадии) |
| DealCard | `features/pipeline/DealCard.tsx` | Card в Kanban | `packages/kanban/src/components/KanbanRow.svelte` (карточки внутри) | иерархия контента, стили, hover состояния | структура данных (наши сделки) |
| Deal Left Panel | `features/deal/DealLeftPanel.tsx` | Detail view, AttributesBar | `packages/presentation/src/components/AttributesBar.svelte`, `AttributeEditor.svelte` | layout секций, стили полей, collapsible секции | структура полей, вкладки "Основное/Перевозка/Страховка" (не меняем) |
| FieldRow | `ui/FieldRow.tsx` | AttributeEditor | `packages/presentation/src/components/AttributeEditor.svelte` | стили label/value, alignment, пустые значения | структура данных (наши поля) |
| Section | `ui/Section.tsx` | Section, AccordionItem | `packages/ui/src/components/Section.svelte`, `AccordionItem.svelte` | collapsible стиль, заголовок, иконка | логика collapse (текущий store) |
| Deal Chat | `features/deal/DealChat.tsx` | MessageBox, MessageViewer, Timeline | `packages/presentation/src/components/MessageBox.svelte`, `MessageViewer.svelte`, `packages/ui/src/components/Timeline.svelte` | стили сообщений, пузырьки, timeline layout | данные (наши сообщения, каналы) |
| Drivebox List | `pages/DriveboxPage.tsx` (левая панель) | ListView, ListViewItem | `packages/ui/src/components/ListView.svelte`, `ListViewItem.svelte` | стили списка, активное состояние, unread dot | структура данных (наши диалоги) |
| Drivebox Timeline | `features/drivebox/DriveboxTimeline.tsx` | MessageBox, MessageViewer | `packages/presentation/src/components/MessageBox.svelte`, `MessageViewer.svelte` | стили сообщений, унификация с DealChat | данные (наши сообщения) |

---

## Design Tokens & Theme

| Что в Drivengo | Где сейчас | Источник в platform-develop | Путь в platform-develop | Что переносим | Что адаптируем |
|---|---|---|---|---|---|
| Цвета (buttons) | `ui-tokens.css` | Button colors | `packages/theme/styles/_colors.scss` | `--primary-button-default`, `--secondary-button-default`, `--positive-button-default`, `--negative-button-default` | адаптация под Tailwind (CSS variables) |
| Цвета (states) | `ui-tokens.css` | State colors | `packages/theme/styles/_colors.scss` | `--theme-state-positive-color`, `--theme-state-negative-color` | адаптация под Tailwind |
| Цвета (text) | `ui-tokens.css` | Text colors | `packages/theme/styles/_colors.scss` | `--global-primary-TextColor`, `--global-secondary-TextColor`, `--global-tertiary-TextColor` | адаптация под Tailwind |
| Spacing | `ui-tokens.css` | Spacing scale | `packages/theme/styles/_vars.scss` | `--spacing-0_25`, `--spacing-0_5`, `--spacing-1`, `--spacing-2`, и т.д. | адаптация под Tailwind |
| Border Radius | `ui-tokens.css` | Border radius | `packages/theme/styles/_vars.scss` | `--min-BorderRadius`, `--small-BorderRadius`, `--medium-BorderRadius`, `--large-BorderRadius` | адаптация под Tailwind |
| UI Elements Size | `ui-tokens.css` | Sizes | `packages/theme/styles/_vars.scss` | `--global-small-Size`, `--global-medium-Size`, `--global-large-Size` | адаптация под Tailwind |
| Shadows | `ui-tokens.css` | Shadows | `packages/theme/styles/_vars.scss` | `--global-popover-ShadowBlur`, `--global-modal-ShadowBlur` | адаптация под Tailwind |
| Типографика | `index.css` | Typography | `packages/theme/styles/common.scss` | `.font-regular-12`, `.font-medium-12`, `.font-bold-12`, `.heading-medium-16`, `.heading-bold-16`, `.heading-ui-H2` | адаптация под Tailwind classes или CSS variables |

---

## Примечания по адаптации

### Svelte -> React
- Platform-develop использует Svelte, Drivengo - React/TypeScript
- Нужно адаптировать компоненты: Svelte props -> React props, Svelte slots -> React children, Svelte reactive -> React state/hooks
- Стили из SCSS -> Tailwind classes или CSS variables

### Радикс UI компоненты
- Текущие компоненты (Tabs, Dialog, DropdownMenu, Tooltip) используют Radix UI
- Нужно адаптировать стили из platform-develop, но сохранить Radix UI функциональность
- Стили platform-develop применяются через className

### Данные и логика
- **НЕ МЕНЯЕМ:** API контракты, бизнес-логику, структуру данных, вкладки "Основное/Перевозка/Страховка"
- Меняем только UI: стили, layout, визуальные паттерны, компоненты

---

## Порядок внедрения

1. **Этап 0**: Этот маппинг (создан)
2. **Этап 1**: Design Tokens & Theme System (перенос токенов)
3. **Этап 2**: UI Kit (создание `src/ui/kit/*` с компонентами)
4. **Этап 3**: Pipeline UI (канбан через платформенные компоненты)
5. **Этап 4**: Deal UI (карточка сделки через платформенный layout)
6. **Этап 5**: Drivebox UI (инбокс через платформенные паттерны)
7. **Этап 6**: Финальная полировка
