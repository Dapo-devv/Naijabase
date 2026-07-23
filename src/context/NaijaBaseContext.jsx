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

  const fetchUserData = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("data")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("⚠️ No data row found for user. Creating one now...");
          const freshData = getFreshUserData();
          const { error: insertError, data: insertData } = await supabase
            .from("user_data")
            .insert({ id: userId, data: freshData });

          if (insertError) {
            console.error("❌ Failed to create user data row:", insertError);
          } else {
            console.log("✅ Data row created successfully!", insertData);
            setUserData(freshData);
          }
        } else if (error.status === 401) {
          console.error("❌ Supabase session expired. Logging out...");
          supabase.auth.signOut();
          setUser(null);
          setUserData(null);
          setLoading(false);
        } else {
          console.error("❌ Error fetching user data:", error);
        }
        return;
      }

      if (data) {
        console.log("✅ Loaded user data:", data.data);
        setUserData(data.data);
      }
    } catch (err) {
      console.error("❌ Unexpected error in fetchUserData:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  const register = useCallback(
    async (email, password, username, name, surname) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, name, surname } },
      });
      if (authError) return { ok: false, error: authError.message };
      if (!authData.user) return { ok: false, error: "Account creation failed." };

      setUser(authData.user);
      await fetchUserData(authData.user.id);
      return { ok: true };
    },
    [fetchUserData],
  );

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  // 🚀 FIXED: Functional setter ensures we NEVER lose old data due to stale closures
  const updateUserData = useCallback(async (updater) => {
    if (!user) return;
    setUserData((prevData) => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      supabase
        .from('user_data')
        .update({ data: newData, updated_at: new Date() })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error("❌ Supabase sync failed:", error);
        });
      return newData;
    });
  }, [user]);

  // 🚀 FIXED: Same functional setter for Import
  const replaceUserData = useCallback(async (newData) => {
    if (!user) return;
    setUserData(newData);
    await supabase
      .from('user_data')
      .update({ data: newData, updated_at: new Date() })
      .eq('id', user.id);
  }, [user]);

  const deleteAccount = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
  }, []);

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
  if (!ctx) throw new Error("useNaijaBase must be used within NaijaBaseProvider");
  return ctx;
}