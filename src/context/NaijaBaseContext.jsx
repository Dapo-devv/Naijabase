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

// --- Turn a Supabase signup error into something safe to show a user ---
// Supabase occasionally surfaces an opaque/empty payload (e.g. "{}") when
// the failure happens server-side (a DB trigger, a broken auth hook, an
// email-sending failure, etc). authError.message is still just a string in
// that case, but it's not a sentence — so detect that and fall back instead
// of ever rendering raw response debris to the user.
function getSignupErrorMessage(authError) {
  const raw =
    typeof authError?.message === "string" ? authError.message.trim() : "";

  if (raw.toLowerCase().includes("already registered")) {
    return "This email is already registered. Please log in instead.";
  }

  const looksUsable = raw.length > 0 && raw !== "{}" && !raw.startsWith("{");
  return looksUsable
    ? raw
    : "We couldn't create your account just now. Please try again in a moment.";
}

export function NaijaBaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  // --- Fetch user data from Supabase ---
  const fetchUserData = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("data")
        .eq("id", userId)
        .single();

      if (error) {
        // If no row exists, create a fresh one for the user
        if (error.code === "PGRST116") {
          console.log("⚠️ No data row found for user. Creating one now...");
          const freshData = getFreshUserData();
          const { error: insertError } = await supabase
            .from("user_data")
            .insert({ id: userId, data: freshData });

          if (insertError) {
            console.error("❌ Failed to create user data row:", insertError);
          } else {
            console.log("✅ Data row created successfully!");
            setUserData(freshData);
          }
        } else if (error.status === 401) {
          console.error("❌ Supabase session expired. Logging out...");
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
        console.log("✅ Loaded user data:", data.data);
        setUserData(data.data);
      }
    } catch (err) {
      console.error("❌ Unexpected error in fetchUserData:", err);
    }
  }, []);

  // --- Auth State Listener ---
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

  // --- Register (Sign Up) ---
  const register = useCallback(
    async (email, password, username, name, surname) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, name, surname },
          emailRedirectTo: window.location.origin + "/login",
        },
      });

      if (authError) {
        return { ok: false, error: getSignupErrorMessage(authError) };
      }

      // Check if user already exists (identities array empty means duplicate)
      if (authData?.user?.identities?.length === 0) {
        return {
          ok: false,
          error: "This email is already registered. Please log in instead.",
        };
      }

      // If email confirmation is required
      if (authData?.user && !authData.user.confirmed_at) {
        setEmailConfirmationSent(true);
        return {
          ok: true,
          message:
            "Registration successful! Please check your email to confirm your account.",
        };
      }

      if (!authData.user) {
        return {
          ok: false,
          error: "Account creation failed. Please try again.",
        };
      }

      setUser(authData.user);
      await fetchUserData(authData.user.id);
      return { ok: true, message: "Account created successfully!" };
    },
    [fetchUserData],
  );

  // --- Login ---
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return {
          ok: false,
          error:
            "Please confirm your email before logging in. Check your inbox for the confirmation link.",
        };
      }
      if (error.message.includes("Invalid login credentials")) {
        return {
          ok: false,
          error: "Invalid email or password. Please try again.",
        };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true };
  }, []);

  // --- Resend Confirmation Email ---
  const resendConfirmation = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    return {
      ok: true,
      message: "Confirmation email resent! Please check your inbox.",
    };
  }, []);

  // --- Logout ---
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Error during logout:", error);
    }
    setUser(null);
    setUserData(null);
  }, []);

  // --- Reset Password ---
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) {
      if (error.message.includes("rate limit")) {
        return {
          ok: false,
          error:
            "Too many reset attempts. Please wait a few minutes and try again.",
        };
      }
      if (error.message.includes("Email not found")) {
        return {
          ok: false,
          error: "No account found with this email address.",
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, message: "Password reset link sent! Check your inbox." };
  }, []);

  // --- 🚀 SECURE DELETE ACCOUNT (Calls Edge Function) ---
  const deleteAccount = useCallback(async () => {
    if (!user) return { ok: false, error: "No user logged in." };

    try {
      // Call the secure Supabase Edge Function
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

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Clear local state
      setUser(null);
      setUserData(null);

      return { ok: true, message: "Account deleted successfully." };
    } catch (err) {
      console.error("❌ Unexpected error during account deletion:", err);
      return {
        ok: false,
        error: err.message || "An unexpected error occurred.",
      };
    }
  }, [user]);

  // --- Update User Data (Partial) ---
  const updateUserData = useCallback(
    async (updater) => {
      if (!user) return;
      setUserData((prevData) => {
        const newData =
          typeof updater === "function" ? updater(prevData) : updater;
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

  // --- Replace Entire User Data ---
  const replaceUserData = useCallback(
    async (newData) => {
      if (!user) return;
      setUserData(newData);
      const { error } = await supabase
        .from("user_data")
        .update({ data: newData, updated_at: new Date() })
        .eq("id", user.id);

      if (error) {
        console.error("❌ Failed to replace user data:", error);
      }
    },
    [user],
  );

  // --- Construct Current User Object ---
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

  // --- Context Value ---
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
    ],
  );

  return (
    <NaijaBaseContext.Provider value={value}>
      {children}
    </NaijaBaseContext.Provider>
  );
}

// --- Hook for consuming the context ---
export function useNaijaBase() {
  const ctx = useContext(NaijaBaseContext);
  if (!ctx) {
    throw new Error("useNaijaBase must be used within NaijaBaseProvider");
  }
  return ctx;
}
