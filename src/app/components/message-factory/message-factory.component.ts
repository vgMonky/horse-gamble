import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/services/messages.service';
import { IMessageData } from 'src/types/IMessageData';
import { MessageComponent } from '@app/components/base-components/message/message.component';
import { SharedModule } from '@app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { Ban, Check, Cross, MessageCircleWarning, Plus, TriangleAlert } from 'lucide-angular';
import { LucideIconData } from 'node_modules/lucide-angular/icons/types';

@Component({
    selector: 'app-message-factory',
    templateUrl: './message-factory.component.html',
    styleUrls: ['./message-factory.component.scss'],
    standalone: true,
    imports: [
        MessageComponent,
        CommonModule,
        SharedModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class MessageFactoryComponent implements OnInit, OnDestroy {
    // Array to store messages received from the service
    public messages: IMessageData[] = [];
    private messagesSubscription!: Subscription;
    public icons = {
        error: Ban,
        info: MessageCircleWarning,
        warning: TriangleAlert,
        success: Check,
        close: Plus,
    } as { [key: string]: LucideIconData };

    constructor (private messageService: MessageService) {}

    ngOnInit(): void {
        // Subscribe to the messages observable
        this.messagesSubscription = this.messageService.messages$.subscribe((msgs: IMessageData[]) => {
            this.messages = msgs;
        });
    }

    // Handler for dismiss event from MessageComponent
    public onDismiss(messageId: string): void {
        this.messageService.dismissMessage(messageId);
    }

    ngOnDestroy(): void {
        // Unsubscribe to avoid memory leaks
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
    }
}
