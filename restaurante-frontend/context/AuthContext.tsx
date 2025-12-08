import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, useSegments } from "expo-router";
import { getItem, saveItem, deleteItem } from "./storage";

const API_URL = "https://appdelivery-vwmv.onrender.com";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextData {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, email: string, password: string) => Promise<void>;
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await getItem("authToken");
      const storedUser = await getItem("authUser");
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!token && !inAuthGroup) router.replace("/(auth)/login");
    else if (token && inAuthGroup) router.replace("/(tabs)");
  }, [token, segments, isLoading]);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Error al iniciar sesión");

    setToken(result.access_token);
    setUser(result.user);
    await saveItem("authToken", result.access_token);
    await saveItem("authUser", JSON.stringify(result.user));

    router.replace("/(tabs)");
  };

  const signUp = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Error al registrarse");

    router.replace("/(auth)/login");
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await deleteItem("authToken");
    await deleteItem("authUser");
    router.replace("/(auth)/login");
  };

  const updateProfile = async (
    name: string,
    email: string,
    password: string
  ) => {
    if (!token || !user) throw new Error("No autenticado");

    const response = await fetch(`${API_URL}/api/auth/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        password_actual: password,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo actualizar");

    setUser(result.user);
    await saveItem("authUser", JSON.stringify(result.user));
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        updateProfile,
        token,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
