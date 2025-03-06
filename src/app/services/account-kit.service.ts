import { Injectable } from '@angular/core';
import { AccountKit } from '@wharfkit/account';
import { APIClient } from '@wharfkit/antelope';
import { Chains } from '@wharfkit/common';

@Injectable({
    providedIn: 'root' // Singleton service
})
export class AccountKitService {
    private accountKit: AccountKit;

    constructor() {
        const client = new APIClient({ url: 'https://mainnet.telos.net' });
        this.accountKit = new AccountKit(Chains.Telos, { client });
    }

    /** Validates if the given EOSIO account exists */
    async validateAccount(username: string): Promise<boolean> {
        try {
            await this.accountKit.load(username);
            return true;
        } catch {
            return false;
        }
    }
}
