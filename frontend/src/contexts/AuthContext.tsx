import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import {
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from '@/graphql/operations'
import { clearToken, getToken, setToken } from '@/lib/apollo'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (name: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [fetchMe] = useLazyQuery(ME_QUERY, { fetchPolicy: 'network-only' })
  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)
  const [updateProfileMutation] = useMutation(UPDATE_PROFILE_MUTATION)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const { data } = await fetchMe()
      setUser(data?.me ?? null)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [fetchMe])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      })
      setToken(data.login.token, remember)
      setUser(data.login.user)
    },
    [loginMutation],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await registerMutation({
        variables: { input: { name, email, password } },
      })
      setToken(data.register.token, true)
      setUser(data.register.user)
    },
    [registerMutation],
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    void client.clearStore()
  }, [client])

  const updateProfile = useCallback(
    async (name: string) => {
      const { data } = await updateProfileMutation({
        variables: { input: { name } },
      })
      setUser(data.updateProfile)
    },
    [updateProfileMutation],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, loading, login, register, logout, updateProfile, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
