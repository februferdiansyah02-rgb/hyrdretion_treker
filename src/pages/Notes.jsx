import { useState } from "react";

import firstIcon from "../assets/firstIcon.png";
import secondIcon from "../assets/secondIcon.png";
import thirdIcon from "../assets/thirdIcon.png";
import fourIcon from "../assets/fourIcon.png";
import fiveIcon from "../assets/fiveIcon.png";

function Notes() {
  const [notifications] = useState([
    {
      id: 1,
      title: "Time to drink water!",
      message: "It's been 2 hours since your last intake. Stay hydrated!",
      time: "10:34 AM",
      icon: firstIcon,
    },
    {
      id: 2,
      title: "Nice progress!",
      message: "You've reached 56% of your daily goal. Keep going!",
      time: "09:12 AM",
      icon: secondIcon,
    },
    {
      id: 3,
      title: "Good morning!",
      message:
        "Start your day with a glass of water. Your body will thank you!",
      time: "07:30 AM",
      icon: thirdIcon,
    },
    {
      id: 4,
      title: "You're doing great!",
      message: "You're 75% to your daily goal. Almost there!",
      time: "04:15 PM",
      icon: fourIcon,
    },
    {
      id: 5,
      title: "Daily goal achieved!",
      message:
        "Congrats! You've reached your daily water intake target!",
      time: "08:03 PM",
      icon: fiveIcon,
    },
    {
      id: 6,
      title: "Don't forget!",
      message:
        "A little water before bed helps your body recover.",
      time: "10:30 PM",
      icon: firstIcon,
    },
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-7">

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Notifications & Notes
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Keep track of your water intake schedule and progress updates
          </p>
        </div>

        {/* ACTIVE ALERT */}
        <div
          className="
            shrink-0
            rounded-full
            bg-sky-100
            px-4
            py-2
            text-xs
            font-semibold
            text-sky-500
          "
        >
          {notifications.length} Active Alerts
        </div>
      </div>

      {/* NOTIFICATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="
              flex
              items-center
              gap-5
              min-h-[125px]
              rounded-2xl
              border
              border-slate-100
              bg-white
              p-5
              shadow-sm
              transition
              duration-200
              hover:shadow-md
            "
          >

            {/* ICON BOX */}
            <div
              className="
                flex
                h-[72px]
                w-[72px]
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#EAF7FF]
              "
            >
              <img
                src={notification.icon}
                alt={notification.title}
                className="
                  h-[52px]
                  w-[52px]
                  object-contain
                "
              />
            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">

              {/* TITLE + TIME */}
              <div className="flex items-start justify-between gap-3">

                <h2
                  className="
                    text-sm
                    md:text-base
                    font-bold
                    text-[#35A7F5]
                  "
                >
                  {notification.title}
                </h2>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    font-medium
                    text-slate-300
                  "
                >
                  {notification.time}
                </span>

              </div>

              {/* MESSAGE */}
              <p
                className="
                  mt-2
                  text-xs
                  md:text-sm
                  leading-5
                  text-slate-500
                "
              >
                {notification.message}
              </p>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Notes;