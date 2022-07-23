module.exports = {
  apps: [
    {
      name: 'poke-default',
      script: './dist/index.mjs',
      instances: 1,
    },
  ],
}
