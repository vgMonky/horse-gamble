# Expandable Component

A reusable Angular standalone component for collapsible content.

## 🚀 Usage

### 1. Import the Component
Make sure to import the `ExpandableComponent` in your Angular component:

```typescript
import { ExpandableComponent } from '@app/components/base-components/expandable/expandable.component';
```

### 2. Set the Component HTML
Use the `<app-expandable>` tag with `expandableId`, `closedHeader`, `openHeader`, and `body` content.

```html
<app-expandable expandableId="A">
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

### 3. Controlling Expandables via Service
To manually open, close, or toggle an expandable, use the `ExpandableManagerService`:

```typescript
import { ExpandableManagerService } from '@app/components/base-components/expandable-manager.service';

constructor(private expandableManager: ExpandableManagerService) {}

this.expandableManager.open('expandable-1'); // Open
this.expandableManager.close('expandable-1'); // Close
this.expandableManager.toggle('expandable-1'); // Toggle
```

---

## Expandable Group

To manage multiple expandables together, use the `ExpandableGroupComponent`. It ensures only one expandable stays open at a time within the group.

### 1. Import the Component
```typescript
import { ExpandableGroupComponent } from '@app/components/base-components/expandable/expandable-group.component';
```

### 2. Wrap Expandables Inside the Group
```html
<app-expandable-group>
    <app-expandable expandableId="expandable-1">
        <div closedHeader>First Item</div>
        <div openHeader>First Item (Expanded)</div>
        <div body>Details for the first item.</div>
    </app-expandable>

    <app-expandable expandableId="expandable-2">
        <div closedHeader>Second Item</div>
        <div openHeader>Second Item (Expanded)</div>
        <div body>Details for the second item.</div>
    </app-expandable>
</app-expandable-group>
```

Now, when you open one expandable, any previously open expandable within the group will automatically close. 🎉

## Expandable Style
You can customize the look of each expandable using style variants.

### 🔧 1. Use a Variant
Pass a variant input to apply a specific style:

```html
<app-expandable expandableId="a" variant="1">
    <div closedHeader>Closed</div>
    <div openHeader>Open</div>
    <div body>Body</div>
</app-expandable>
```

This will apply the class expandable-variant-1 to the component.

### 🎨 2. Add a New Variant (Sass Modules)

1. **Create a new SCSS partial** with a mixin in `src/app/components/base-components/expandable/_expandable-3.scss`:

    ```scss
    // _expandable-3.scss
    @mixin variant-3 {
      .c-expandable {
        border-left: 4px solid hotpink;
        background: #1a1a1a;
      }
    }
    ```

2. **Load and include** it in your `expandable.component.scss` alongside the others:

    ```scss
    // expandable.component.scss

    // existing variants
    @use './expandable-0' as ex0;
    @use './expandable-1' as ex1;
    @use './expandable-2' as ex2;

    // new variant
    @use './expandable-3' as ex3;

    :host(.expandable-variant-3) {
      @include ex3.variant-3;
    }
    ```

That’s it! Now <app-expandable variant="3"> will use your custom style. ✅
