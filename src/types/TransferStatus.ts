export type TransferStatus = {
    state: 'none' | 'success' | 'failure';
    message?: string; // Failure or success message
    // summary?: TransferSummary;  // This will be defined later
};