"use client";
import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import PositiveQuotes from "./components/PositiveQuotes";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ember_preferences: string;
};

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      const user = data?.session?.user || null;

      if (error) {
        console.error("Error fetching user:", error);
      }

      if (isMounted) {
        setUser(user);
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id);
        if (data && data.length > 0) {
          const profileData = data[0] as Profile;
          setProfile(profileData);
        }
      }
    };
    checkUser();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      router.replace("/auth/signin");
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return null; // Prevent rendering before redirecting
  }

  return (
    <div className="bg-custom-green text-white min-h-screen">
      <Header user={user} />
      <PositiveQuotes />
      <Carousel userProfile={profile as Profile} />
      <div className="absolute top-4 left-4">
        <button
          onClick={handleLogout}
          className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
