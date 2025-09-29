module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['import', 'promise'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
  overrides: [
    {
      files: ['site/assets/js/**/*.js'],
      env: {
        browser: true,
      },
    },
    {
      files: ['site/papers/build/**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
