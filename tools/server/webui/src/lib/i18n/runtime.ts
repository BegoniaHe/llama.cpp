import { browser } from '$app/environment';
import {
	baseLocale,
	getLocale,
	getTextDirection,
	locales,
	setLocale,
	type Locale
} from '$lib/paraglide/runtime';

let initialized = false;

function normalizeLocale(locale: string | undefined | null): Locale {
	if (!locale) {
		return baseLocale;
	}

	const normalized = locale.toLowerCase();
	const supported = locales.find((candidate) => candidate.toLowerCase() === normalized);

	if (supported) {
		return supported;
	}

	const baseLanguage = normalized.split(/[-_]/)[0];
	return locales.find((candidate) => candidate.toLowerCase() === baseLanguage) ?? baseLocale;
}

export function getCurrentLocale(): Locale {
	return normalizeLocale(getLocale());
}

export function syncDocumentLocale(): void {
	if (!browser) return;

	const locale = getCurrentLocale();
	document.documentElement.lang = locale;
	document.documentElement.dir = getTextDirection(locale);
}

export function initializeI18n(): void {
	if (!browser || initialized) return;

	initialized = true;
	syncDocumentLocale();
}

export async function updateLocale(locale: string): Promise<Locale> {
	const nextLocale = normalizeLocale(locale);
	await setLocale(nextLocale, { reload: false });
	syncDocumentLocale();
	return nextLocale;
}
