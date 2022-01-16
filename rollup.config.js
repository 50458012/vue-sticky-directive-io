import typescript from 'rollup-plugin-typescript2'
const {
  name,
  version,
  typings: input,
  main: file,
  author
} = require('./package.json')

export default { 
  input,
  output: {
    banner:  `/**
    * v${version}
    * (c) ${new Date().getFullYear()} ${author}
    */`,
    file,
    format: 'cjs',
    name,
    sourcemap: false,
    exports: 'named',
  },
  plugins: [typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        target: 'es2015',
      }
    },
    abortOnError: false
  })]
}