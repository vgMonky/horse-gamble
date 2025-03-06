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

## Expandable Group

To manage multiple expandables together, use the `ExpandableGroupComponent`. It automatically assigns unique IDs to each `app-expandable` and ensures only one stays open at a time.

### Usage Example

First import the component.
```typescript
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';
```

Then set it up by wrapping the expandables.

```html
<app-expandable-group>
    <app-expandable>
        <div closedHeader>First Item</div>
        <div openHeader>First Item (Expanded)</div>
        <div body>Details for the first item.</div>
    </app-expandable>

    <app-expandable>
        <div closedHeader>Second Item</div>
        <div openHeader>Second Item (Expanded)</div>
        <div body>Details for the second item.</div>
    </app-expandable>
</app-expandable-group>

