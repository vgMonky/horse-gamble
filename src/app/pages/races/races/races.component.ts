import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { OngoingRacesExpandableComponent } from '@app/components/ongoing-race-expandable/ongoing-race-expandable.component';

@Component({
    standalone: true,
    selector: 'app-races',
    imports: [
        SharedModule,
        CommonModule,
        OngoingRacesExpandableComponent
    ],
    templateUrl: './races.component.html',
    styleUrls: ['./races.component.scss']
})
export class RacesComponent {

}
