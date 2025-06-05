# WindowContainer Component

A reusable Angular standalone component for modal dialogs.

## 🚀 Usage

### 1. Import the Component

Make sure to import the `WindowContainerComponent` in your Angular component:

```typescript
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';
```

### 2. Set the Component

Use `<app-window-container>` with `*ngIf` and `(close)` to control visibility:

```html
<!-- Trigger button -->
<button (click)="isModalOpen = true">Open modal</button>

<!-- Modal window -->
<app-window-container
  *ngIf="isModalOpen"
  (close)="isModalOpen = false"
>
  <p>Modal content</p>
</app-window-container>
```

Set the var in angular component:

```typescript
isModalOpen = false
```
