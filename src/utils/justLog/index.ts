import consola, { FancyReporter } from 'consola'

export const justLog = consola.create({
  defaults: {
    tag: 'Póke',
  },
  reporters: [new FancyReporter()],
})
