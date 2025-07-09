import { Request, Response, NextFunction } from 'express';

export interface LocaleRequest extends Request {
  locale?: string;
  localeSettings?: {
    language: string;
    region?: string;
    currency?: string;
    timezone?: string;
    dateFormat?: string;
    numberFormat?: string;
  };
}

export interface LocaleContext {
  locale: string;
  language: string;
  region?: string;
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
}

// Supported locales
const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'] as const;
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const;

/**
 * Middleware to extract and validate locale information
 */
export function withLocale() {
  return (req: LocaleRequest, res: Response, next: NextFunction) => {
    // Extract locale from various sources (in order of preference)
    const locale = 
      req.headers['accept-language'] as string ||
      req.headers['x-locale'] as string ||
      req.query.locale as string ||
      req.body?.locale ||
      process.env.DEFAULT_LOCALE ||
      'en-US';

    // Parse locale (e.g., "en-US" -> { language: "en", region: "US" })
    const [language, region] = locale.split('-');
    
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language as any)) {
      return res.status(400).json({
        error: 'Unsupported language',
        code: 'UNSUPPORTED_LANGUAGE',
        message: `Language '${language}' is not supported. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
        supportedLanguages: SUPPORTED_LANGUAGES
      });
    }

    // Set default region if not provided
    const finalRegion = region || getDefaultRegion(language);
    const finalLocale = `${language}-${finalRegion}`;

    // Attach locale information to request
    req.locale = finalLocale;
    req.localeSettings = {
      language,
      region: finalRegion,
      currency: getCurrencyForRegion(finalRegion),
      timezone: getTimezoneForRegion(finalRegion),
      dateFormat: getDateFormatForRegion(finalRegion),
      numberFormat: getNumberFormatForRegion(finalRegion)
    };

    next();
  };
}

/**
 * Optional locale middleware (uses default if not provided)
 */
export function withOptionalLocale() {
  return (req: LocaleRequest, res: Response, next: NextFunction) => {
    const locale = 
      req.headers['accept-language'] as string ||
      req.headers['x-locale'] as string ||
      req.query.locale as string ||
      req.body?.locale ||
      process.env.DEFAULT_LOCALE ||
      'en-US';

    const [language, region] = locale.split('-');
    const finalRegion = region || getDefaultRegion(language);
    const finalLocale = `${language}-${finalRegion}`;

    req.locale = finalLocale;
    req.localeSettings = {
      language,
      region: finalRegion,
      currency: getCurrencyForRegion(finalRegion),
      timezone: getTimezoneForRegion(finalRegion),
      dateFormat: getDateFormatForRegion(finalRegion),
      numberFormat: getNumberFormatForRegion(finalRegion)
    };

    next();
  };
}

/**
 * Get locale context from request
 */
export function getLocaleContext(req: LocaleRequest): LocaleContext | null {
  if (!req.locale || !req.localeSettings) return null;
  
  return {
    locale: req.locale,
    ...req.localeSettings
  };
}

// Helper functions for locale settings
function getDefaultRegion(language: string): string {
  const defaults: Record<string, string> = {
    en: 'US',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    ja: 'JP',
    zh: 'CN'
  };
  return defaults[language] || 'US';
}

function getCurrencyForRegion(region: string): string {
  const currencies: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    ES: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    JP: 'JPY',
    CN: 'CNY'
  };
  return currencies[region] || 'USD';
}

function getTimezoneForRegion(region: string): string {
  const timezones: Record<string, string> = {
    US: 'America/New_York',
    GB: 'Europe/London',
    ES: 'Europe/Madrid',
    FR: 'Europe/Paris',
    DE: 'Europe/Berlin',
    JP: 'Asia/Tokyo',
    CN: 'Asia/Shanghai'
  };
  return timezones[region] || 'UTC';
}

function getDateFormatForRegion(region: string): string {
  const dateFormats: Record<string, string> = {
    US: 'MM/DD/YYYY',
    GB: 'DD/MM/YYYY',
    ES: 'DD/MM/YYYY',
    FR: 'DD/MM/YYYY',
    DE: 'DD.MM.YYYY',
    JP: 'YYYY/MM/DD',
    CN: 'YYYY/MM/DD'
  };
  return dateFormats[region] || 'MM/DD/YYYY';
}

function getNumberFormatForRegion(region: string): string {
  const numberFormats: Record<string, string> = {
    US: '1,234.56',
    GB: '1,234.56',
    ES: '1.234,56',
    FR: '1 234,56',
    DE: '1.234,56',
    JP: '1,234.56',
    CN: '1,234.56'
  };
  return numberFormats[region] || '1,234.56';
} 