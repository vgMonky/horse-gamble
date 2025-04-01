// shared.module.ts
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { TooltipDirective } from '@app/components/base-components/tooltip/tooltip.directive';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        LucideAngularModule,
        TooltipDirective,
    ],
    exports: [
        CommonModule,
        TranslateModule,
        LucideAngularModule,
        TooltipDirective,
    ]
})
export class SharedModule {}
