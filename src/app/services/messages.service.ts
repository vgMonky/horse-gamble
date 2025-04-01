import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessageData } from 'src/types/IMessageData';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    // Counter to generate unique ids
    private nextId = 0;
    // Array to store the messages
    private messages: IMessageData[] = [];
    // Subject to emit messages changes
    private messagesSubject: BehaviorSubject<IMessageData[]> = new BehaviorSubject<IMessageData[]>([]);

    constructor () {}

    // Observable stream of messages
    public get messages$(): Observable<IMessageData[]> {
        return this.messagesSubject.asObservable();
    }

    private get default(): IMessageData {
        return {
            id: '',
            content: '',
            type: 'info',
            autoClose: false,
            duration: 0,
            destroyDelay: 0,
            destroying: false,
        };
    }

    public pushMessage(message: Partial<IMessageData>): void {

        // Generate a unique id for the message
        message.id = this.nextId.toString();
        this.nextId++;

        // Add the message to the queue
        this.messages.push({
            ...this.default,
            ...message
        });
        this.messagesSubject.next(this.messages);

        const startDestroyingTime = message.duration! + message.destroyDelay!;
        if (message.autoClose && message.duration) {
            setTimeout(() => {
                this.dismissMessage(message.id!);
            }, startDestroyingTime);
        }
    }

    public dismissMessage(id: string): void {

        // get the message by id
        const message = this.messages.find((msg) => msg.id === id);
        if (!message) {
            console.error('Message not found', { id });
            return;
        }

        // Set the destroying flag to true
        message.destroying = true;

        // Actually destroy the message after the destroyDelay
        setTimeout(() => {
            // Remove the message from the queue
            this.messages = this.messages.filter((msg) => msg.id !== id);

            this.messagesSubject.next(this.messages);
        }, message.destroyDelay);
    }

}
