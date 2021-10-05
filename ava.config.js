export default {
  babel: {
    compileEnhancements: false,
    compileAsTests: [
      'test/helpers/**/*.ts'
    ]
  },
  extensions: [
    'ts',
    'tsx'
  ],
  files: [
    'test/**/*.test.ts?(x)'
  ],
  require: [
    'ignore-styles',
    'esm',
    'ts-node/register',
    'tsconfig-paths/register',
    './test/helpers/setup-enzyme.ts'
  ]
}
