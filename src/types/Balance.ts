import { Token } from "./Token";

export interface Balance {
    amount: {
        raw: number;
        formatted: string;
    };
    token: Token;
}
