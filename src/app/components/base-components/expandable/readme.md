# Expandable Component

A reusable Angular standalone component for collapsible content.

## 🚀 Usage

### 1. Import the Component
Make sure to import the `ExpandableComponent` in your Angular component:

```typescript
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
```

### 2. Set the Component HTML
Use the `<app-expandable>` tag with `closedHeader`, `openHeader`, and `body` content.

```html
<app-expandable>
    <!-- Header when closed -->
    <div closedHeader>
        <h2>I'm closed</h2>
    </div>

    <!-- Header when opened -->
    <div openHeader>
        <h2>I'm opened</h2>
    </div>

    <!-- Body content when expanded -->
    <div body>
        <p>This is the body content visible when expanded.</p>
    </div>
</app-expandable>
```

That's it! The component will handle the open/close behavior automatically. 🎉