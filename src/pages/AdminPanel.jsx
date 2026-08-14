import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState(null);

  const ADMIN_EMAIL = "dapodevv@gmail.com";

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // We will use the Supabase SDK to fetch the count directly
        // This bypasses the browser fetch/security issues entirely
        const { count, error } = await supabase
          .from("user_data") // Count rows in your data table
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setTotalUsers(count || 0);
      } catch (err) {
        console.error("Failed to fetch user count:", err);
        setError("Could not load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="p-10 text-center text-red-600 bg-white dark:bg-gray-900 min-h-screen">
        ⛔ You do not have permission to view the Admin Panel.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 bg-white dark:bg-gray-900 min-h-screen">
        <p className="text-lg font-bold">Oops!</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white mb-6">
          TrackCash Admin
        </h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Total Registered Users (Active Profiles)
          </h2>
          {/* Safe rendering */}
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {totalUsers !== null ? totalUsers.toLocaleString() : "0"}
          </p>
        </div>

        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400">
          <p className="font-semibold">🟢 System Status: Healthy</p>
          <p className="text-xs opacity-80 mt-1">
            Data counts active user profiles in the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
