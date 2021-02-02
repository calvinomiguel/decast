const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

module.exports = {
    plugins: [
        require('autoprefixer'),
        require('tailwindcss'),
        cssnano({
            preset: 'default',
        }),
        purgecss({
            content: [
                './src/**/*.html',
                './src/**/*.vue',
            ],
            defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
            css: [
                './src/assets/styles/tailwind.css',
                './src/assets/styles/inter.css'
            ],
        }),
    ]
}