/*
 * @Description: fun desc of file
 * @Date: 2020-01-06 16:40:56
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-07 17:12:18
 */
module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    "plugin:vue/base",
    'prettier',
    'prettier/@typescript-eslint'
  ],
  globals: {
    __DEV: 'readonly',
    __STATIC: 'readonly',
    __HOST: 'readonly',
    __APP_VERSION: 'readonly',
    __APP_VERSION_CODE: 'readonly',
    __APP_NAME: 'readonly',
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': [0, {
      ignoreRestArgs: true
    }],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    'no-multiple-empty-lines': 2,
    'prefer-const': 0,
    'prefer-rest-params': 0,
    'no-var': 0,
    'semi': 0,
    "quotes": [1, "single"]
  }
}
