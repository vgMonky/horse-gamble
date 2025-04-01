import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tooltip',
    template: `
        <div
            [ngClass]="{
                'c-tooltip': true,
                'c-tooltip--visible': visible
            }"
            [ngStyle]="{ top: top + 'px', left: left + 'px' }">
            {{ text | translate}}
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./tooltip.component.scss'],
    standalone: true,
    imports: [
        TranslateModule,
        CommonModule
    ]
})
export class TooltipComponent {
    @Input() text: string = '';
    visible: boolean = false;
    target: DOMRect | null = null;
    top: number = 0;
    left: number = 0;

    constructor(
        private el: ElementRef,
        private cd: ChangeDetectorRef
    ) {}

    // Update tooltip position and trigger change detection
    setPosition(target: DOMRect): void {
        this.target = target;
    }

    // Show tooltip and trigger change detection
    async show(): Promise<void> {
        this.visible = true;

        const tooltip = this.el.nativeElement.querySelector('.c-tooltip');
        if (tooltip) {
            if (this.target) {
                const rect = tooltip.getBoundingClientRect();
                const y_offset = 5;
                this.top = this.target.top - rect.height - y_offset;
                this.left = this.target.left + (this.target.width / 2) - (rect.width / 2);

                const padding = 10;
                const innerWidth = window.innerWidth - padding;
                const innerHeight = window.innerHeight - padding;

                if (this.left + rect.width + padding > innerWidth) {
                    // if it's outside by the right, put it at the end
                    this.left = innerWidth - rect.width - padding;
                } else if (this.left < padding) {
                    // if it's outside by the left, put it at the beginning
                    this.left = padding;
                } else if (this.top < padding) {
                    // if it's outside by the top, put it at the top
                    this.top = padding;
                } else if (this.top + rect.height + padding > innerHeight) {
                    // if it's outside by the bottom, put it at the bottom
                    this.top = innerHeight - rect.height - padding;
                }

                this.cd.markForCheck();
            }
        } else {
            // wait for the tooltip to be rendered
            await new Promise(resolve => setTimeout(resolve, 0));
            this.show();
        }

    }

    // Hide tooltip and trigger change detection
    hide(): void {
        this.visible = false;
        this.cd.markForCheck();
    }
}
