export interface IMessageData {
    id: string;             // Unique identifier for the message
    content: string;         // Message text
    type: string;            // Message type
    autoClose: boolean;     // Flag indicating if the message should auto-close
    duration: number;       // Duration in milliseconds for auto-close
    destroyDelay: number;   // Delay in milliseconds before destroying the message
    destroying: boolean;    // Flag indicating if the message is being destroyed
}
