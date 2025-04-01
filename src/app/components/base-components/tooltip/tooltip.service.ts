import { Injectable } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { EnvironmentInjector } from '@angular/core';
import { createComponent } from '@angular/core';
import { ComponentRef } from '@angular/core';
import { EmbeddedViewRef } from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Injectable({
    providedIn: 'root'
})
export class TooltipService {
    private tooltipComponentRef: ComponentRef<TooltipComponent> | null = null;

    constructor(
        private appRef: ApplicationRef,
        private environmentInjector: EnvironmentInjector
    ) {
        // You could also inject other services if needed
    }

    // Show tooltip with provided text and element offset
    public show(text: string, target: DOMRect): void {
        clearTimeout(this.timer);
        if (!this.tooltipComponentRef) {
            // Create the component dynamically
            this.tooltipComponentRef = createComponent(TooltipComponent, {
                environmentInjector: this.environmentInjector
            });

            // Attach the view to the ApplicationRef so it becomes part of Angular's change detection
            this.appRef.attachView(this.tooltipComponentRef.hostView);

            // Get the root DOM element from the component
            const domElem = (this.tooltipComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);
        }
        // Set tooltip text and position
        this.tooltipComponentRef.instance.text = text;
        this.tooltipComponentRef.instance.setPosition(target);
        this.tooltipComponentRef.instance.show();
    }

    // Hide the tooltip
    timer = setTimeout(() => {},0);
    public hide(): void {
        if (this.tooltipComponentRef) {
            this.tooltipComponentRef.instance.hide();
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.destroy();
        }, 400);
    }

    // Destroy the tooltip
    public destroy(): void {
        if (this.tooltipComponentRef) {
            this.appRef.detachView(this.tooltipComponentRef.hostView);
            this.tooltipComponentRef.destroy();
            this.tooltipComponentRef = null;
        }
    }
}
