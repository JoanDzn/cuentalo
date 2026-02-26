import { useState, useEffect, useCallback } from 'react';

export type PrimaryCurrency = 'USD' | 'VES';

const storageKey = (userId?: string) =>
    userId ? `cuentalo_currency_${userId}` : 'cuentalo_currency_default';

/** Returns the stored primary currency for a user (defaults to USD). */
export function getCurrencyPreference(userId?: string): PrimaryCurrency {
    try {
        const val = localStorage.getItem(storageKey(userId));
        if (val === 'VES') return 'VES';
    } catch { }
    return 'USD';
}

/** Persists the primary currency and notifies other components via StorageEvent. */
export function setCurrencyPreference(currency: PrimaryCurrency, userId?: string) {
    try {
        const key = storageKey(userId);
        localStorage.setItem(key, currency);
        // Dispatch so other hooks in the same tab update
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: currency }));
    } catch { }
}

/**
 * React hook: returns [primaryCurrency, setPrimaryCurrency].
 * Syncs across components in the same tab and across tabs.
 */
export function useCurrencyPreference(userId?: string): [PrimaryCurrency, (c: PrimaryCurrency) => void] {
    const [currency, setCurrency] = useState<PrimaryCurrency>(() => getCurrencyPreference(userId));

    useEffect(() => {
        // Re-read when userId changes (e.g., after login)
        setCurrency(getCurrencyPreference(userId));
    }, [userId]);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === storageKey(userId)) {
                setCurrency((e.newValue as PrimaryCurrency) || 'USD');
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [userId]);

    const set = useCallback((c: PrimaryCurrency) => {
        setCurrencyPreference(c, userId);
        setCurrency(c);
    }, [userId]);

    return [currency, set];
}
