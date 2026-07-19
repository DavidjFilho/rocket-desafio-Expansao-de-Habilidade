export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const apolloError = error as {
    graphQLErrors?: Array<{ message?: string }>
    message?: string
  }

  const graphQLMessage = apolloError.graphQLErrors?.[0]?.message
  if (graphQLMessage) return graphQLMessage

  if (apolloError.message && apolloError.message !== 'Failed to fetch') {
    return apolloError.message
  }

  return fallback
}
