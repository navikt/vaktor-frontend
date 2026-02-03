const nextConfig = require('eslint-config-next')

module.exports = [
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'dist/**'],
    },
    ...nextConfig,
]
