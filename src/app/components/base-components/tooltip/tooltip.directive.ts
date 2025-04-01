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
        console.log('TooltipDirective created');
    }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        console.log('TooltipDirective mouse enter', {
            el: this.el,
            nativeElement: this.el.nativeElement
        });
        const rect = this.el.nativeElement.getBoundingClientRect();
        console.log('TooltipDirective mouse enter', rect );
        this.tooltipService.show(this.tooltipText, rect);
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        console.log('TooltipDirective mouse leave');
        this.tooltipService.hide();
    }
}
