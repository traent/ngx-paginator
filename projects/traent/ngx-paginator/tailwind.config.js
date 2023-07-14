/** @type {import('tailwindcss').Config} */

const tw_traent = require('@traent/design-system/tailwind/tw-base-theme');
const tw_plugins = require('@traent/design-system/tailwind/tw-plugins');
const prefix = 'tw-';

module.exports = {
  prefix,
  content: [
    "./projects/traent/ngx-paginator/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: { ...tw_traent.theme },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        // ':root': { ...tw_plugins.extractPalette(theme('colors')) },
        ...tw_plugins.customContainer(prefix),
        ...tw_plugins.customHeading(prefix),
        ...tw_plugins.fontOverride(prefix),
        ...tw_plugins.hideScrollbars(prefix),
        ...tw_plugins.hoverContainer(prefix),
        ...tw_plugins.matIconHeight(prefix),
      });
    },
  ],
}
