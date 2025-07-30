"use client";

import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";

const predefinedEmberOptions = [
  "Self-Awareness and Mindset",
  "Emotional Intelligence and Relationships",
  "Skill Development and Knowledge",
  "Health and Well-Being",
  "Purpose and Goal-Setting",
];

export default function UserProfile() {
  const [emberOptions] = useState<string[]>(predefinedEmberOptions);
  const [selectedEmbers, setSelectedEmbers] = useState<string[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emberTasks, setEmberTasks] = useState<
    { Ember_Type: string; Task_Instructions: string }[]
  >([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id);
        if (data && data.length > 0) {
          const profileData = data[0];
          setFirstName(profileData.first_name);
          setLastName(profileData.last_name);
          setEmail(profileData.email);
          setSelectedEmbers(profileData.ember_preferences.split(","));

          const preferences = profileData.ember_preferences.split(",");
          const { data: tasks } = await supabase
            .from("tasks")
            .select("Ember_Type, Task_Instructions")
            .in("Ember_Type", preferences);

          if (tasks) {
            setEmberTasks(tasks);
          }
        }
      }
    };

    checkUser();
  }, []);

  const handleCheckboxChange = (emberType: string) => {
    setSelectedEmbers((prevSelected) =>
      prevSelected.includes(emberType)
        ? prevSelected.filter((type) => type !== emberType)
        : [...prevSelected, emberType]
    );
  };

  const handleTextInputChange = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.name === "firstName") {
      setFirstName(e.currentTarget.value);
    }

    if (e.currentTarget.name === "lastName") {
      setLastName(e.currentTarget.value);
    }

    if (e.currentTarget.name === "email") {
      setEmail(e.currentTarget.value);
    }
  };

  const handleFormSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ember_preferences: selectedEmbers.join(",") })
      .eq("id", user.id);

    if (!updateError) {
      toast.success("Preferences updated!");
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      ember_preferences: selectedEmbers.join(","),
    });

    if (!upsertError) {
      toast.success("Preferences saved!");
      return;
    }

    console.error("FINAL FAILURE:", {
      userId: user.id,
      error: JSON.stringify(upsertError, null, 2),
      attemptedData: selectedEmbers.join(","),
    });
    toast.error("Failed to save - check console");
  };

  return (
    <div className="bg-custom-green min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/20 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-custom-white mb-6">
            User Profile
          </h1>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  className="text-gray-800 p-2 bg-custom-white rounded border border-gray-200"
                  onChange={handleTextInputChange}
                  value={firstName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  className="text-gray-800 p-2 bg-custom-white rounded border border-custom-white"
                  onChange={handleTextInputChange}
                  value={lastName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="text"
                className="text-gray-800 p-2 bg-custom-white rounded border border-gray-200"
                onChange={handleTextInputChange}
                value={email}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-custom-white mb-4">
              Ember Options
            </h2>
            {emberOptions.map((option) => (
              <div key={option} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedEmbers.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="mr-2"
                />
                <label htmlFor={option} className="text-custom-white">
                  {option}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="w-full py-2 px-4 rounded bg-emerald-700 text-custom-white font-medium shadow-sm hover:text-custom-white hover:bg-emerald-800"
              onClick={handleFormSubmit}
            >
              Save Profile
            </button>
          </div>

          {/* Ember Task Instructions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-custom-white mb-4">
              Ember Tasks & Instructions
            </h2>
            {emberTasks.length > 0 ? (
              emberTasks.map((task) => (
                <div key={task.Ember_Type} className="mb-4">
                  <h3 className="text-lg font-bold text-custom-white">
                    {task.Ember_Type}
                  </h3>
                  <p className="text-custom-white">{task.Task_Instructions}</p>
                </div>
              ))
            ) : (
              <p className="text-custom-white">
                No tasks available for selected preferences.
              </p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
