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
        console.log('TooltipComponent setPosition', target);
        this.target = target;
    }

    // Show tooltip and trigger change detection
    async show(): Promise<void> {
        console.log('TooltipComponent.show() ');
        this.visible = true;

        const tooltip = this.el.nativeElement.querySelector('.c-tooltip');
        if (tooltip) {
            if (this.target) {
                const rect = tooltip.getBoundingClientRect();
                console.log('TooltipComponent.show() this.el.nativeElement: ', this.el.nativeElement);
                const y_offset = 5;
                this.top = this.target.top - rect.height - y_offset;
                this.left = this.target.left + (this.target.width / 2) - (rect.width / 2);

                if (this.left + rect.width > window.innerWidth) {
                    // if it's outside by the right, put it at the end
                    this.left = window.innerWidth - rect.width;
                } else if (this.left < 0) {
                    // if it's outside by the left, put it at the beginning
                    this.left = 0;
                } else if (this.top < 0) {
                    // if it's outside by the top, put it at the top
                    this.top = 0;
                } else if (this.top + rect.height > window.innerHeight) {
                    // if it's outside by the bottom, put it at the bottom
                    this.top = window.innerHeight - rect.height;
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
        console.log('TooltipComponent hide');
        this.visible = false;
        this.cd.markForCheck();
    }
}
