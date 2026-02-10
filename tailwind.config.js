/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('@navikt/ds-tailwind')],
    content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
}
