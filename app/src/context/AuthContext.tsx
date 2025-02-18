import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "../config/supabase"
import { api } from "../api"

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null }
    error: AuthError | null
  }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      const currentSession = data?.session

      if (currentSession?.user?.id && currentSession.user.id !== user?.id) {
        console.log("🔄 Setting user from session:", currentSession.user.id)
        setUser(currentSession.user)
        await fetchUserProfile(currentSession.user.id)
      }

      setSession(currentSession)
      setLoading(false)
    }

    fetchSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user?.id && newSession.user.id !== user?.id) {
        console.log("🔄 Auth state changed, setting user:", newSession.user.id)
        setUser(newSession.user)
        await fetchUserProfile(newSession.user.id)
      }

      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, []) // Run only once on mount

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // Save user ID in local storage
      localStorage.setItem("user_id", data.user.id)

      // Fetch user profile to get role
      const { data: userProfile } = await api.get(
        `/user/get-user/${data.user.id}`
      )

      if (!userProfile) throw new Error("User profile not found")

      // Save role in local storage
      localStorage.setItem("user_role", userProfile.role)

      // Store user in state
      setUser(userProfile)

      return userProfile.role // Return role for navigation
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // 🔹 Reset state on logout
    setUser(null)
    setSession(null)
    // set location to /login after signout
    window.location.href = "/logout-success"
  }

  // Function to fetch user profile after login
  const fetchUserProfile = async (authId: string) => {
    try {
      console.log("Fetching profile for:", authId)

      const { data } = await api.get(`/user/get-user/${authId}`) // Ensure this matches your backend route

      if (!data) throw new Error("User profile not found")

      setUser((prevUser) => ({
        ...prevUser,
        ...data, // Merge full profile into state
      }))
    } catch (err) {
      console.error("Error fetching user profile:", err)
    }
  }

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          email_confirm: false,
        },
      },
    })
  }

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
