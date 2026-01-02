/**
 * Translations for ApiNotioTrack library
 * Supports multiple languages with fallback to Polish
 */

export const translations = {
  pl: {
    modal: {
      title: 'Zgłoś nielegalną treść',
      violationLabel: 'Rodzaj naruszenia',
      violations: [
        'Treści szerzące nienawiść',
        'Dezinformacja/Fake News',
        'Naruszenie praw autorskich',
        'Mowa nienawiść',
        'Cyberprzemoc',
        'Inne (sprecyzuj)'
      ],
      emailPlaceholder: 'Adres e-mail',
      additionalInfoPlaceholder: 'Dodatkowe informacje (opcjonalne)',
      submitButton: 'Wyślij zgłoszenie',
      badgeTitle: 'Zgłoś nielegalną treść'
    }
  },
  en: {
    modal: {
      title: 'Report illegal content',
      violationLabel: 'Type of violation',
      violations: [
        'Hate speech content',
        'Disinformation/Fake News',
        'Copyright infringement',
        'Hate speech',
        'Cyberbullying',
        'Other (specify)'
      ],
      emailPlaceholder: 'Email address',
      additionalInfoPlaceholder: 'Additional information (optional)',
      submitButton: 'Submit report',
      badgeTitle: 'Report illegal content'
    }
  },
  de: {
    modal: {
      title: 'Illegale Inhalte melden',
      violationLabel: 'Art der Verletzung',
      violations: [
        'Hassrede-Inhalte',
        'Desinformation/Fake News',
        'Urheberrechtsverletzung',
        'Hassrede',
        'Cybermobbing',
        'Sonstiges (angeben)'
      ],
      emailPlaceholder: 'E-Mail-Adresse',
      additionalInfoPlaceholder: 'Zusätzliche Informationen (optional)',
      submitButton: 'Meldung senden',
      badgeTitle: 'Illegale Inhalte melden'
    }
  },
  fr: {
    modal: {
      title: 'Signaler un contenu illégal',
      violationLabel: 'Type de violation',
      violations: [
        'Contenu de haine',
        'Désinformation/Fake News',
        'Violation du droit d\'auteur',
        'Discours de haine',
        'Cyberharcèlement',
        'Autre (préciser)'
      ],
      emailPlaceholder: 'Adresse e-mail',
      additionalInfoPlaceholder: 'Informations supplémentaires (optionnel)',
      submitButton: 'Envoyer le signalement',
      badgeTitle: 'Signaler un contenu illégal'
    }
  },
  es: {
    modal: {
      title: 'Reportar contenido ilegal',
      violationLabel: 'Tipo de violación',
      violations: [
        'Contenido de odio',
        'Desinformación/Fake News',
        'Violación de derechos de autor',
        'Discurso de odio',
        'Ciberacoso',
        'Otro (especificar)'
      ],
      emailPlaceholder: 'Dirección de correo electrónico',
      additionalInfoPlaceholder: 'Información adicional (opcional)',
      submitButton: 'Enviar reporte',
      badgeTitle: 'Reportar contenido ilegal'
    }
  }
};

/**
 * Default language (fallback)
 */
export const defaultLanguage = 'pl';

/**
 * Supported languages
 */
export const supportedLanguages = Object.keys(translations);
