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

function getSignupErrorMessage(authError) {
  const raw =
    typeof authError?.message === "string" ? authError.message.trim() : "";
  if (raw.toLowerCase().includes("already registered"))
    return "This email is already registered. Please log in instead.";
  return raw.length > 0 && raw !== "{}" && !raw.startsWith("{")
    ? raw
    : "We couldn't create your account. Please try again.";
}

export function NaijaBaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchUserData = useCallback(async (authUser) => {
    if (!authUser?.id) return;
    const userId = authUser.id;
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("data")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No row exists — create one with full metadata from auth
          console.log("⚠️ Creating new user_data row with metadata...");
          const freshData = getFreshUserData();
          freshData.email = authUser.email || "";
          freshData.name = authUser.user_metadata?.name || "";
          freshData.surname = authUser.user_metadata?.surname || "";
          freshData.username = authUser.user_metadata?.username || "";

          const { error: insertError } = await supabase
            .from("user_data")
            .insert({ id: userId, data: freshData });

          if (insertError) {
            console.error("❌ Failed to create user data:", insertError);
          } else {
            setUserData(freshData);
          }
        } else if (error.status === 401) {
          await supabase.auth.signOut();
          setUser(null);
          setUserData(null);
          setLoading(false);
        } else {
          console.error("❌ Error fetching user data:", error);
        }
        return;
      }

      if (data) {
        // Ensure metadata stays in sync with auth
        const userMeta = authUser.user_metadata || {};
        const needsSync =
          data.data.email !== authUser.email ||
          (userMeta.name && data.data.name !== userMeta.name) ||
          (userMeta.surname && data.data.surname !== userMeta.surname) ||
          (userMeta.username && data.data.username !== userMeta.username);

        if (needsSync) {
          const synced = {
            ...data.data,
            email: authUser.email,
            name: userMeta.name || data.data.name,
            surname: userMeta.surname || data.data.surname,
            username: userMeta.username || data.data.username,
          };
          setUserData(synced);
          supabase
            .from("user_data")
            .update({ data: synced })
            .eq("id", userId)
            .then(({ error: e }) => {
              if (e) console.warn("Metadata sync failed:", e);
            });
        } else {
          setUserData(data.data);
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) {
        setUser(session.user);
        fetchUserData(session.user);
      }
      if (isMounted) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
          if (event === "SIGNED_OUT") setIsPasswordRecovery(false);

          if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user);
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
        options: {
          data: { username, name, surname },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (authError)
        return { ok: false, error: getSignupErrorMessage(authError) };
      if (authData?.user?.identities?.length === 0)
        return { ok: false, error: "Email already registered." };
      if (authData?.user && !authData.user.confirmed_at) {
        setEmailConfirmationSent(true);
        return {
          ok: true,
          message:
            "Registration successful! Please check your email to confirm.",
        };
      }
      if (!authData.user)
        return { ok: false, error: "Account creation failed." };
      setUser(authData.user);
      await fetchUserData(authData.user);
      return { ok: true, message: "Account created!" };
    },
    [fetchUserData],
  );

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Email not confirmed"))
        return { ok: false, error: "Please confirm your email first." };
      if (error.message.includes("Invalid login credentials"))
        return { ok: false, error: "Invalid email or password." };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const resendConfirmation = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "Confirmation email resent!" };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setIsPasswordRecovery(false);
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      if (error.message.includes("rate limit"))
        return { ok: false, error: "Too many attempts. Wait a few minutes." };
      if (error.message.includes("Email not found"))
        return { ok: false, error: "No account found with this email." };
      return { ok: false, error: error.message };
    }
    return { ok: true, message: "Password reset link sent!" };
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) return { ok: false, error: "No user logged in." };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId: user.id }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to delete account");
      setUser(null);
      setUserData(null);
      setIsPasswordRecovery(false);
      return { ok: true, message: "Account deleted." };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [user]);

  const updateUserData = useCallback(
    async (updater) => {
      if (!user) return;
      setUserData((prev) => {
        const newData = typeof updater === "function" ? updater(prev) : updater;
        supabase
          .from("user_data")
          .update({ data: newData, updated_at: new Date() })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("❌ Supabase sync failed:", error);
          });
        return newData;
      });
    },
    [user],
  );

  const replaceUserData = useCallback(
    async (newData) => {
      if (!user) return;
      setUserData(newData);
      const { error } = await supabase
        .from("user_data")
        .update({ data: newData, updated_at: new Date() })
        .eq("id", user.id);
      if (error) console.error("❌ Failed to replace user data:", error);
    },
    [user],
  );

  const clearPasswordRecovery = useCallback(
    () => setIsPasswordRecovery(false),
    [],
  );

  const currentUser = useMemo(() => {
    if (!user || !userData) return null;
    return {
      id: user.id,
      email: user.email,
      username: userData.username,
      name: userData.name,
      surname: userData.surname,
      profilePicture: userData.profilePicture || "",
      theme: userData.theme || "light",
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
      emailConfirmationSent,
      resendConfirmation,
      isPasswordRecovery,
      clearPasswordRecovery,
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
      emailConfirmationSent,
      resendConfirmation,
      isPasswordRecovery,
      clearPasswordRecovery,
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
