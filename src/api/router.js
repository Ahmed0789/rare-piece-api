import { search } from '~/src/api/elastic-search'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([search])
    }
  }
}

export { router }