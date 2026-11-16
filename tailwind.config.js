const t = (v) => `rgb(var(--${v}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: t('bg'), surface: t('surface'), surface2: t('surface-2'), line: t('line'),
        ink: t('ink'), muted: t('muted'),
        brand: t('brand'), brandsoft: t('brand-soft'),
        accent: t('accent'), accentsoft: t('accent-soft'),
        success: t('success'), successsoft: t('success-soft'),
        warn: t('warn'), warnsoft: t('warn-soft'),
        danger: t('danger'), dangersoft: t('danger-soft'),
      },
      fontFamily: {
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
