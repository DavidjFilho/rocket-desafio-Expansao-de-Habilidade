import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import express from 'express'
import { createContext } from './shared/auth.js'
import { typeDefs } from './graphql/typeDefs.js'
import { resolvers } from './graphql/resolvers.js'

const PORT = Number(process.env.PORT) || 3333
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const app = express()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      if (process.env.NODE_ENV === 'production') {
        const { extensions, ...rest } = formattedError
        if (extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'Erro interno do servidor.',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          }
        }
        return { ...rest, extensions }
      }
      return formattedError
    },
  })

  await server.start()

  app.use(
    '/graphql',
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return createContext(req.headers.authorization)
      },
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.listen(PORT, () => {
    console.log(`Financy API ready at http://localhost:${PORT}/graphql`)
  })
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
