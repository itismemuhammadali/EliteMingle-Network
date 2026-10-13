import { getLanguage, LanguageCode, t } from './localizationService';

// In-memory cache for translated strings to avoid redundant API calls and latency
const translationCache = new Map<string, string>();

/**
 * Common phrase mappings for fast synchronous translation of frequent database phrases
 */
const COMMON_PHRASE_MAPPINGS: Record<string, Record<string, string>> = {
  es: {
    'Can you believe it': '¿Puedes creerlo?',
    'Video': 'Video',
    'Good Morning': 'Buenos Días',
    'Good Afternoon': 'Buenas Tardes',
    'Good Evening': 'Buenas Noches',
    'Hello everyone': 'Hola a todos',
    'Welcome to the community': 'Bienvenido a la comunidad',
    'No description provided': 'Sin descripción proporcionada',
    'Community Member': 'Miembro de la Comunidad',
    'Super Administrator': 'Superadministrador',
    'All systems operational': 'Todos los sistemas operativos',
    'System operational': 'Sistema operativo',
    'Account created successfully': 'Cuenta creada con éxito',
    'New post shared': 'Nueva publicación compartida',
    'User reported for violation': 'Usuario reportado por infracción',
    'Profile updated': 'Perfil actualizado',
  },
  en: {},
};

/**
 * Localize database roles (e.g. 'admin', 'user', 'moderator')
 */
export const getLocalizedRole = (role?: string): string => {
  if (!role) return '';
  const normalized = role.toLowerCase().trim();
  if (normalized === 'admin') {
    return t('database.roles.admin', 'Administrator');
  }
  if (normalized === 'moderator') {
    return t('database.roles.moderator', 'Moderator');
  }
  if (normalized === 'user' || normalized === 'member') {
    return t('database.roles.user', 'Member');
  }
  return role;
};

/**
 * Localize database account statuses (e.g. 'active', 'inactive', 'blocked', 'suspended')
 */
export const getLocalizedStatus = (status?: string): string => {
  if (!status) return '';
  const normalized = status.toLowerCase().trim();
  if (normalized === 'active') {
    return t('database.statuses.active', 'Active');
  }
  if (normalized === 'inactive') {
    return t('database.statuses.inactive', 'Inactive');
  }
  if (normalized === 'blocked') {
    return t('database.statuses.blocked', 'Blocked');
  }
  if (normalized === 'suspended') {
    return t('database.statuses.suspended', 'Suspended');
  }
  if (normalized === 'pending') {
    return t('database.statuses.pending', 'Pending');
  }
  return status;
};

/**
 * Localize moderation report reasons
 */
export const getLocalizedReportReason = (reason?: string): string => {
  if (!reason) return '';
  const normalized = reason.toLowerCase().replace(/[\s-]+/g, '_').trim();
  if (normalized.includes('harass') || normalized.includes('bully')) {
    return t('database.reasons.harassment', 'Harassment or Bullying');
  }
  if (normalized.includes('hate')) {
    return t('database.reasons.hate_speech', 'Hate Speech');
  }
  if (normalized.includes('spam') || normalized.includes('scam')) {
    return t('database.reasons.spam', 'Spam or Scam');
  }
  if (normalized.includes('inappropriate')) {
    return t('database.reasons.inappropriate', 'Inappropriate Content');
  }
  if (normalized.includes('violen') || normalized.includes('danger')) {
    return t('database.reasons.violence', 'Violence or Dangerous Acts');
  }
  if (normalized.includes('nude') || normalized.includes('sexual')) {
    return t('database.reasons.nudity', 'Nudity or Sexual Content');
  }
  return t('database.reasons.other', reason);
};

/**
 * Localize moderation report statuses
 */
export const getLocalizedReportStatus = (status?: string): string => {
  if (!status) return '';
  const normalized = status.toLowerCase().trim();
  if (normalized === 'pending') {
    return t('adminReports.pendingTab', 'Pending');
  }
  if (normalized === 'resolved') {
    return t('adminReports.resolvedTab', 'Resolved');
  }
  if (normalized === 'dismissed') {
    return t('adminReports.dismissedTab', 'Dismissed');
  }
  return status;
};

/**
 * Localize system notifications pulled from Firestore
 */
export const getLocalizedNotification = (
  title?: string,
  body?: string,
): { title: string; body: string } => {
  const currentLang = getLanguage();
  if (currentLang === 'en') {
    return { title: title || '', body: body || '' };
  }

  let localizedTitle = title || '';
  let localizedBody = body || '';

  // Check common mappings
  if (title && COMMON_PHRASE_MAPPINGS.es[title]) {
    localizedTitle = COMMON_PHRASE_MAPPINGS.es[title];
  }
  if (body && COMMON_PHRASE_MAPPINGS.es[body]) {
    localizedBody = COMMON_PHRASE_MAPPINGS.es[body];
  }

  // Handle common system notification patterns
  if (title?.toLowerCase().includes('report')) {
    localizedTitle = 'Actualización de Reporte';
  } else if (title?.toLowerCase().includes('warning')) {
    localizedTitle = 'Advertencia del Moderador';
  } else if (title?.toLowerCase().includes('friend')) {
    localizedTitle = 'Solicitud de Amistad';
  }

  return { title: localizedTitle, body: localizedBody };
};

/**
 * Asynchronously translate dynamic free-text database entries (e.g. post captions, comments)
 */
export const translateDynamicContent = async (
  text: string,
  targetLang?: LanguageCode,
): Promise<string> => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text || '';
  }

  const lang = targetLang || getLanguage();
  if (lang === 'en') {
    return text;
  }

  const cacheKey = `${lang}:${text.trim()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check known phrase dictionary
  if (COMMON_PHRASE_MAPPINGS[lang]?.[text.trim()]) {
    const directTranslation = COMMON_PHRASE_MAPPINGS[lang][text.trim()];
    translationCache.set(cacheKey, directTranslation);
    return directTranslation;
  }

  try {
    const encoded = encodeURIComponent(text.trim());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encoded}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedSegments = data[0]
          .map((segment: any) => (Array.isArray(segment) ? segment[0] : ''))
          .filter(Boolean)
          .join('');
        if (translatedSegments) {
          translationCache.set(cacheKey, translatedSegments);
          return translatedSegments;
        }
      }
    }
  } catch (err) {
    // Network timeout or error - fallback to original text gracefully
  }

  translationCache.set(cacheKey, text);
  return text;
};

/**
 * Synchronously translate text if cached or known, otherwise returns original text
 */
export const getSyncTranslatedContent = (
  text: string,
  targetLang?: LanguageCode,
): string => {
  if (!text || typeof text !== 'string') return '';
  const lang = targetLang || getLanguage();
  if (lang === 'en') return text;

  const cacheKey = `${lang}:${text.trim()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (COMMON_PHRASE_MAPPINGS[lang]?.[text.trim()]) {
    return COMMON_PHRASE_MAPPINGS[lang][text.trim()];
  }

  // Trigger background translation so subsequent renders display translated text
  translateDynamicContent(text, lang).catch(() => {});

  return text;
};
