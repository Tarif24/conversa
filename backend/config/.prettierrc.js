export default {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100, // Slightly wider for backend code
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    // Backend specific overrides
    overrides: [
        {
            files: ['*.json'],
            options: {
                tabWidth: 4,
            },
        },
        {
            files: ['*.sql'],
            options: {
                printWidth: 120,
                tabWidth: 2,
            },
        },
    ],
};
