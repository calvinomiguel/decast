module.exports = {
  root: true,
  env: {
    browser: true
  },
  globals: {
    expect: true
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: ['prettier', 'vue'],
  parserOptions: {
		parser: 'babel-eslint',
    sourceType: 'module',
  },
 	rules: {
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 4,
        multiline: {
          max: 5,
          allowFirstLine: true
        }
      }
    ],
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        ignores: ['fai'] // Font Awesome 5 Vue Component
      }
    ],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'acc', // for reduce accumulators
          'e', // for e.returnvalue
          'state' // for vuex state setting
        ]
      }
    ],
    'import/no-unresolved': 0,
    'no-plusplus': 0
  }

}