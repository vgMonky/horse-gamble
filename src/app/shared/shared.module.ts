// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

@NgModule({
    exports: [
        TranslateModule,
        LucideAngularModule,
    ]
})
export class SharedModule {}
