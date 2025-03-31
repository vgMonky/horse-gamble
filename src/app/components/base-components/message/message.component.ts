import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { IMessageData } from 'src/types/IMessageData';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None
})
export class MessageComponent implements OnInit {
    // Input property to receive the message data
    @Input() message!: IMessageData;
    // Output event emitter to notify when the message is dismissed
    @Output() dismiss: EventEmitter<string> = new EventEmitter<string>();

    constructor (

    ) {}

    ngOnInit(): void {
        // If autoClose is enabled and duration is set, dismiss the message automatically
        if (this.message.autoClose && this.message.duration) {
            setTimeout(() => {
                this.onDismiss();
            }, this.message.duration);
        }
    }

    // Emit the dismiss event with the message id
    public onDismiss(): void {
        this.dismiss.emit(this.message.id);
    }
}
