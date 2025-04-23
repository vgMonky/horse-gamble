// updated component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OngoingRaceService } from '@app/services/game/ongoing-race.service';
import { OngoingHorseUiComponent } from '@app/components/ongoing-horse-ui/ongoing-horse-ui.component';
import { Subscription } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-ongoing-list-ui',
    imports: [CommonModule, OngoingHorseUiComponent],
    templateUrl: './ongoing-list-ui.component.html',
    styleUrls: ['./ongoing-list-ui.component.scss']
})
export class OngoingListUiComponent implements OnInit, OnDestroy {
    horses: any[] = [];
    finalPosition = 0;

    private sub = new Subscription();

    constructor(private ongoingRaceService: OngoingRaceService) {}

    ngOnInit(): void {
        this.sub.add(
            this.ongoingRaceService.horses$.subscribe(h => {
                this.horses = [...h].sort((a, b) => b.position - a.position);
            })
        );
        this.sub.add(
            this.ongoingRaceService.finalPosition$.subscribe(fp => this.finalPosition = fp)
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}
