interface BabelConfig {
  presets: Array<
    [string, Record<string, unknown>] | string
  >;
}

// babel.config.ts
const config: BabelConfig = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};

export default config;
