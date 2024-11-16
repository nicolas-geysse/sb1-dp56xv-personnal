import eslintPluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...eslintPluginVue.configs['flat/recommended'],
    eslintConfigPrettier,
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off'
        }
    },
    {
        ignores: ['node_modules', 'vendor', 'cypress', 'public/build']
    }
];