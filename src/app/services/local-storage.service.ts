// local-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {

    // Save an object to localStorage as a JSON string
    save(key: string, content: unknown): void {
        try {
            localStorage.setItem(key, JSON.stringify(content));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    // Get an object from localStorage (parse JSON). Return null or a fallback if not found.
    get<T = unknown>(key: string, fallback: T | null = null): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : fallback;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return fallback;
        }
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }
}
