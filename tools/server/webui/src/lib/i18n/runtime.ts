import { browser } from '$app/environment';
import { m } from '$lib/paraglide/messages';
import {
	baseLocale,
	getLocale,
	getTextDirection,
	localStorageKey,
	locales,
	setLocale,
	type Locale
} from '$lib/paraglide/runtime';

let initialized = false;

export const SYSTEM_LANGUAGE_VALUE = 'system';

const LOCALE_LABELS: Partial<Record<Locale, string>> = {
	en: 'English',
	'zh-cn': '简体中文'
};

function getLocaleDisplayName(locale: Locale): string {
	const explicitLabel = LOCALE_LABELS[locale];
	if (explicitLabel) {
		return explicitLabel;
	}

	try {
		return new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) ?? locale.toUpperCase();
	} catch {
		return locale.toUpperCase();
	}
}

export function getLanguageOptions(): Array<{ value: string; label: string }> {
	return [
		{ value: SYSTEM_LANGUAGE_VALUE, label: m.settings_language_system_default() },
		...locales.map((locale) => ({
			value: locale,
			label: getLocaleDisplayName(locale)
		}))
	];
}

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

export async function applyLocalePreference(preference?: string): Promise<Locale> {
	if (!browser || !preference || preference === SYSTEM_LANGUAGE_VALUE) {
		if (browser) {
			localStorage.removeItem(localStorageKey);
		}

		syncDocumentLocale();
		return getCurrentLocale();
	}

	return updateLocale(preference);
}

export async function updateLocale(locale: string): Promise<Locale> {
	const nextLocale = normalizeLocale(locale);
	await setLocale(nextLocale, { reload: false });
	syncDocumentLocale();
	return nextLocale;
}
