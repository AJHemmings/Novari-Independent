"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  access_token: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        setUser({
          id: data.session.user.id,
          name: profile?.name ?? "",
          access_token: data.session.access_token,
        });
      } else {
        setUser(null);
      }
    };

    checkUser();
  }, []);
  return { user };
}
