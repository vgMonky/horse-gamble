// tooltip.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { TooltipService } from './tooltip.service';

@Directive({
    selector: '[tooltip]',
    standalone: true
})
export class TooltipDirective {
    @Input('tooltip') tooltipText: string = '';

    constructor(
        private el: ElementRef,
        private tooltipService: TooltipService
    ) {
    }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        const rect = this.el.nativeElement.getBoundingClientRect();
        this.tooltipService.show(this.tooltipText, rect);
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        this.tooltipService.hide();
    }
}
