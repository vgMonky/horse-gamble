export type TransferStatus = {
    state: 'none' | 'success' | 'failure';
    message?: string; // Failure or success message
    summary?: TransferSummary | null; // Null when state is 'failure' or 'none'
};

export type TransferSummary = {
    from: string;
    to: string;
    amount: string;
    transaction: string; // A short prefix of the transaction hash
};
