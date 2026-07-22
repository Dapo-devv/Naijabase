import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../lib/supabase";
import { getFreshUserData } from "../utils/constants";

const NaijaBaseContext = createContext(null);

export function NaijaBaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Robust Fetch Function ---
  const fetchUserData = useCallback(async (userId) => {
    if (!userId) return;

    // 1. Attempt to fetch the existing data
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("id", userId)
      .single();

    // 2. If truly not found (PGRST116), we create the row safely
    if (error && error.code === "PGRST116") {
      const freshData = getFreshUserData();
      // Insert the row into Supabase so it exists for future refreshes
      const { error: insertError } = await supabase
        .from("user_data")
        .insert({ id: userId, data: freshData });

      if (insertError) {
        console.error("Failed to create user data row:", insertError);
      } else {
        setUserData(freshData);
      }
      return;
    }

    // 3. If there's a different error
    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    // 4. Success! Set the real data
    if (data) {
      setUserData(data.data);
    }
  }, []);

  // --- Auth Listener ---
  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (isMounted && session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      }
      if (isMounted) setLoading(false);
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user.id);
          } else {
            setUser(null);
            setUserData(null);
          }
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  // --- Register ---
  const register = useCallback(
    async (email, password, username, name, surname) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, name, surname } },
      });
      if (authError) return { ok: false, error: authError.message };
      if (!authData.user)
        return { ok: false, error: "Account creation failed." };

      // The DB trigger handles the insert, but we fetch immediately after
      setUser(authData.user);
      await fetchUserData(authData.user.id);
      return { ok: true };
    },
    [fetchUserData],
  );

  // --- Login ---
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  // --- Logout ---
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  }, []);

  // --- Reset Password ---
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  // --- Update Data (Persists to Supabase) ---
  const updateUserData = useCallback(
    async (updater) => {
      if (!user) return;
      const newData =
        typeof updater === "function" ? updater(userData) : updater;
      setUserData(newData);

      const { error } = await supabase
        .from("user_data")
        .update({ data: newData, updated_at: new Date() })
        .eq("id", user.id);

      if (error) console.error("Supabase sync failed:", error);
    },
    [user, userData],
  );

  // --- Replace Data (Import) ---
  const replaceUserData = useCallback(
    async (newData) => {
      if (!user) return;
      setUserData(newData);
      await supabase
        .from("user_data")
        .update({ data: newData, updated_at: new Date() })
        .eq("id", user.id);
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  }, []);

  // --- User Object Composition ---
  const currentUser = useMemo(() => {
    if (!user || !userData) return null;
    return {
      id: user.id,
      email: user.email,
      username: userData.username,
      name: userData.name,
      surname: userData.surname,
      data: userData,
    };
  }, [user, userData]);

  const value = useMemo(
    () => ({
      state: { currentUserId: user?.id || null, loading },
      currentUser,
      login,
      register,
      logout,
      resetPassword,
      deleteAccount,
      updateUserData,
      replaceUserData,
    }),
    [
      user,
      currentUser,
      loading,
      login,
      register,
      logout,
      resetPassword,
      deleteAccount,
      updateUserData,
      replaceUserData,
    ],
  );

  return (
    <NaijaBaseContext.Provider value={value}>
      {children}
    </NaijaBaseContext.Provider>
  );
}

export function useNaijaBase() {
  const ctx = useContext(NaijaBaseContext);
  if (!ctx)
    throw new Error("useNaijaBase must be used within NaijaBaseProvider");
  return ctx;
}
