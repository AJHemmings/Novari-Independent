"use client";

import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { User } from "@supabase/supabase-js";

interface StreakData {
  user_id: string;
  last_login_date: string;
  current_streak: number;
  longest_streak: number;
}

export default function StreakCounter({ user }: { user: User }) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateStreak = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch existing streak data
        const { data, error: fetchError } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching streak:", fetchError);
          setError(`Failed to fetch streak: ${fetchError.message}`);
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split("T")[0];

        if (!data) {
          // Create new streak record if none exists
          const newStreak: StreakData = {
            user_id: user.id,
            last_login_date: today,
            current_streak: 1,
            longest_streak: 1,
          };

          const { error: insertError } = await supabase
            .from("user_streaks")
            .insert(newStreak);

          if (insertError) {
            console.error("Error creating streak:", insertError);
            setError(`Failed to create streak: ${insertError.message}`);
          } else {
            setStreakData(newStreak);
          }
        } else {
          // Update existing streak logic
          const updatedStreak = { ...data };
          const lastLoginDate = new Date(data.last_login_date);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          // Check if it's a new day
          if (
            new Date(data.last_login_date).toISOString().split("T")[0] !== today
          ) {
            // Determine streak increment
            const isConsecutiveDay =
              lastLoginDate.toISOString().split("T")[0] ===
              yesterday.toISOString().split("T")[0];

            updatedStreak.current_streak = isConsecutiveDay
              ? data.current_streak + 1
              : 1;

            // Update longest streak if needed
            updatedStreak.longest_streak = Math.max(
              updatedStreak.longest_streak,
              updatedStreak.current_streak
            );

            // Update last login date
            updatedStreak.last_login_date = today;

            // Update in database
            const { error: updateError } = await supabase
              .from("user_streaks")
              .update(updatedStreak)
              .eq("user_id", user.id);

            if (updateError) {
              console.error("Error updating streak:", updateError);
              setError(`Failed to update streak: ${updateError.message}`);
            } else {
              setStreakData(updatedStreak);
            }
          } else {
            // If already logged in today, just set the existing data
            setStreakData(data);
          }
        }
      } catch (catchError) {
        console.error("Unexpected error:", catchError);
        setError(
          `Unexpected error: ${
            catchError instanceof Error ? catchError.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateStreak();
  }, [user]);

  // Render loading state
  if (loading) {
    return (
      <div className="text-center text-emerald-800">Loading streak...</div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
        <p>Error loading streak: {error}</p>
      </div>
    );
  }

  // Render no streak data
  if (!streakData) {
    return (
      <div className="text-center text-emerald-800">
        No streak data available
      </div>
    );
  }

  // Render streak data
  return (
    <div className="text-center bg-emerald-50 p-8 rounded-full shadow-md flex-col items-center justify-center">
      <h2 className="text-xl mb-3 font-bold text-emerald-800">
        Current Streak
      </h2>
      <div className="inline-flex items-center justify-center w-18 h-18 bg-white text-emerald-500 rounded-full shadow-lg mb-2">
        <span className="text-5xl" role="img" aria-label="green heart emoji">
          💚
        </span>
      </div>
      <p className="text-xl font-semibold text-emerald-800 mb-1">
        {streakData.current_streak} day
        {streakData.current_streak !== 1 ? "s" : ""}
      </p>
      <p className=" text-sm text-emerald-800">
        Longest Streak: {streakData.longest_streak} day
        {streakData.longest_streak !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
