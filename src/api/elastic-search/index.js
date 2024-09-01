import { esController } from '~/src/api/health/controller'

const elasticsearch = {
  plugin: {
    name: 'Elastic Search',
    register: async (server) => {
      server.route({
        method: 'GET',
        path: '/es?',
        ...esController
      })
    }
  }
}

export { elasticsearch }