import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const TOKEN_KEY = 'financy_token'
const REMEMBER_KEY = 'financy_remember'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, remember: boolean): void {
  clearToken()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors }) => {
  if (!graphQLErrors) return
  const expired = graphQLErrors.some(
    (err) =>
      err.extensions?.code === 'UNAUTHENTICATED' &&
      typeof err.message === 'string' &&
      err.message.toLowerCase().includes('sessão'),
  )
  if (expired) {
    clearToken()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=1'
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only' },
  },
})
