import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Token } from 'src/types';

@Injectable({
    providedIn: 'root'
})
export class TokenListService {
    private tokens$ = new BehaviorSubject<Token[]>([]);

    constructor(private http: HttpClient) {
        this.loadTokenList();
    }

    private loadTokenList(): void {
        this.http.get<Token[]>('assets/tokens_mainnet.json').subscribe({
            next: tokens => {
                this.tokens$.next(tokens);
            },
            error: err => console.error('Error loading token list:', err),
        });
    }

    getTokens() {
        return this.tokens$.asObservable(); // Expose as observable for components
    }

    getTokensValue() {
        return this.tokens$.getValue(); // Get latest value without subscribing
    }
}