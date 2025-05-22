// next-i18next.config.js
module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'fr', 'es'], // Add more as needed
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
  };
  