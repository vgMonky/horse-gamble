# ToggleComponent Usage Guide

## Overview
The `ToggleComponent` is a reusable Angular component that allows toggling between multiple projected states. The currently active state is highlighted and emits an event (`stateChange`) that can be used by the parent component.

---

## How to Use

### Step 1: Import the Component
Make sure the `ToggleComponent` is properly declared in your standalone project and available for import.

```typescript
import { ToggleComponent } from './components/experimental/toggle.component';
```

### Step 2: Add the Component to Your Template

Project multiple content states using Angular's `ng-template` inside the `ToggleComponent`. Each `ng-template` should be tagged with `#stateContent`.

```html
<app-toggle (stateChange)="onStateChange($event)">
    <ng-template #stateContent>
        <p>State 0: Welcome!</p>
    </ng-template>

    <ng-template #stateContent>
        <p>State 1: How are you?</p>
    </ng-template>

    <ng-template #stateContent>
        <p>State 2: Goodbye!</p>
    </ng-template>
</app-toggle>
```

### Step 3: Listen for the `stateChange` Event
The `stateChange` event emits the current active state index whenever the state changes. In the parent component, you can capture and use this event as needed.

Example:

```typescript
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <h1>Current State = {{ currentState }}</h1>
        
        <app-toggle (stateChange)="onStateChange($event)">
            <ng-template #stateContent>
                <p>State 0</p>
            </ng-template>

            <ng-template #stateContent>
                <p>State 1</p>
            </ng-template>

            <ng-template #stateContent>
                <p>State 2</p>
            </ng-template>
        </app-toggle>
    `,
})
export class AppComponent {
    currentState = 0;

    onStateChange(newState: number) {
        this.currentState = newState;
    }
}
```

---

## Example Behavior
- **Initial Display:** The first state (`State 0`) will be shown when the component loads.
- **State Toggle:** Clicking any button will toggle to the corresponding state.
- **Event Emission:** Each toggle emits the current state index, which the parent component can use to update UI or trigger additional logic.

