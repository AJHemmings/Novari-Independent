"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import supabase from "../../lib/supabase";

type Task = {
  id: number;
  name: string;
  content: string;
  completed: boolean;
};

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ember_preferences: string;
};

const Carousel = ({ userProfile }: { userProfile: Profile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [cards, setCards] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userProfile) {
        return;
      }
      const { data, error } = await supabase
        .from("Tasks")
        .select("*")
        .in("Ember Type", userProfile.ember_preferences.split(","));
      console.log(userProfile.ember_preferences.split(","));
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        const mappedData = data.map((el) => {
          return {
            id: el.id,
            name: el[`Ember Type`],
            content: el[`Task Instructions`],
            completed: false,
          };
        });
        if (mappedData.length < 4) {
          setCards(mappedData as Task[]);
        } else {
          const shuffleData = mappedData.sort(() => Math.random() - 0.5);
          setCards(shuffleData.slice(0, 3) as Task[]);
        }
      }
    };

    fetchTasks();
  }, [userProfile]);

  const handleComplete = (id: number) => {
    console.log(id);
    const modifiedCards = cards.map((card) => {
      if (card.id !== id) {
        return card;
      } else {
        return {
          ...card,
          completed: true,
        };
      }
    });

    setCards(modifiedCards);
  };

  const handleNext = () => {
    if (isTransitioning) return;

    if (currentIndex === cards.length - 1) {
      setIsTransitioning(true);

      setCurrentIndex(cards.length);

      setTimeout(() => {
        setSkipAnimation(true);
        setCurrentIndex(0);

        setTimeout(() => {
          setSkipAnimation(false);
          setIsTransitioning(false);
        }, 50);
      }, 700);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isTransitioning) return;

    if (currentIndex === 0) {
      setIsTransitioning(true);

      setCurrentIndex(-1);

      setTimeout(() => {
        setSkipAnimation(true);
        setCurrentIndex(cards.length - 1);

        setTimeout(() => {
          setSkipAnimation(false);
          setIsTransitioning(false);
        }, 50);
      }, 700);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="pb-40 w-full flex flex-col items-center justify-center bg-custom-green overflow-hidden">
      <div id="hero" className="relative w-full h-96 perspective">
        {/* Carousel container */}
        <div
          className={`absolute w-full h-full ${
            skipAnimation ? "" : "transition-transform duration-700 ease-out"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${currentIndex * -120}deg)`,
          }}
        >
          {/* Generate all cards */}
          {cards.map((card, index) => {
            const radius = 265;
            const isActive = index === currentIndex % cards.length;

            return (
              <div
                key={index}
                className={`absolute top-0 left-0 right-0 mx-auto w-80 h-100 rounded-full shadow-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  card.completed
                    ? "bg-radial from-emerald-700 from-40% to-emerald-900"
                    : "bg-radial from-green-200 from-40% to-custom-green text-gray-600"
                }`}
                style={{
                  transform: `rotateY(${
                    index * 120
                  }deg) translateZ(${radius}px)`,
                  opacity: isActive ? 1 : 0.2,
                }}
              >
                <div>
                  <h2 className="text-2xl font-bold pt-25 text-center mb-3">
                    {card["name"]}
                  </h2>
                  <p className="text-center">{card.content}</p>
                </div>
                <button
                  id={isActive ? "complete" : ""}
                  onClick={() => handleComplete(card.id)}
                  disabled={card.completed}
                  className={`mt-4 py-3 px-6 rounded-lg self-center transition-all duration-300 
                    ${
                      card.completed
                        ? "bg-green-100 text-green-800 cursor-not-allowed"
                        : "bg-emerald-700 hover:bg-emerald-800 text-custom-white"
                    } font-semibold flex items-center gap-2`}
                >
                  {card.completed ? (
                    <>
                      <Check className="text-green-600" size={20} />
                      <span>Completed</span>
                    </>
                  ) : (
                    "Complete"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation controls */}
      <div id="hero" className="mt-12 flex gap-6">
        <button
          id="prevBtn"
          onClick={handlePrev}
          disabled={isTransitioning}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 py-2 px-6 rounded-xl transition-colors text-2xl"
        >
          ←
        </button>
        <button
          id="nextBtn"
          onClick={handleNext}
          disabled={isTransitioning}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 py-2 px-6 rounded-xl transition-colors text-2xl"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Carousel;
