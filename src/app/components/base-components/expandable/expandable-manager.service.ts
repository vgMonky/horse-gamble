import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpandableManagerService {
    private state = new BehaviorSubject<Record<string, boolean>>({});
    private groupMap = new Map<string, Set<string>>(); // Tracks expandables in groups
    state$ = this.state.asObservable();

    registerGroup(groupId: string, expandableId: string) {
        if (!this.groupMap.has(groupId)) {
            this.groupMap.set(groupId, new Set());
        }
        this.groupMap.get(groupId)!.add(expandableId);

        console.log(`Expandable registered: ${expandableId} | Group: ${groupId}`);
    }

    open(id: string, groupId?: string) {
        console.log(`Opening: ${id}`, groupId ? `| Group: ${groupId}` : "| No Group");

        const newState = { ...this.state.getValue(), [id]: true };

        // If in a group, close others
        if (groupId && this.groupMap.has(groupId)) {
            for (const expandable of this.groupMap.get(groupId)!) {
                if (expandable !== id) {
                    newState[expandable] = false;
                    console.log(`Closing (from group): ${expandable}`);
                }
            }
        }

        this.state.next(newState);
    }

    close(id: string) {
        console.log(`Closing: ${id}`);
        this.state.next({ ...this.state.getValue(), [id]: false });
    }

    toggle(id: string, groupId?: string) {
        const currentState = this.state.getValue();
        console.log(`Toggling: ${id}`, groupId ? `| Group: ${groupId}` : "| No Group");

        if (currentState[id]) {
            this.close(id);
        } else {
            this.open(id, groupId);
        }
    }

}
