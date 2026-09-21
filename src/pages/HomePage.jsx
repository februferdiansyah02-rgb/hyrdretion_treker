import React from 'react';
import { Droplet } from 'lucide-react';
import logo from '../assets/logo.png';

export default function HomePage({ onAddWater, totalWater = 500 }) {
  const quickAddOptions = [
    { label: '250 ML', value: 250 },
    { label: '500 ML', value: 500 },
    { label: '700 ML', value: 700 },
    { label: '1 L', value: 1000 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h3 className="text-gray-500 font-bold text-lg sm:text-xl">Good afternoon</h3>
          <h1 className="text-sky-400 font-extrabold text-3xl sm:text-4xl tracking-tight">Mayonggg</h1>
        </div>

        <div className="relative w-full  from-sky-700 to-sky-500 rounded-3xl p-5 sm:p-6 h-56 sm:h-60 flex flex-col justify-between overflow-hidden shadow-lg shadow-sky-100/50 border border-sky-100">
          <div className="z-10">
            <span className="text-sky-600 font-extrabold text-xs sm:text-sm tracking-wide bg-white/70 px-3 py-1 rounded-full">
              11:00 AM
            </span>
            <p className="text-gray-600 text-xs sm:text-sm font-medium mt-2">
              Don't forget to drink!
            </p>
          </div>  

          <img 
            src={logo} 
            alt="Water Character" 
            className="absolute right-0 bottom-0 w-40 h-40 sm:w-52 sm:h-52 object-contain z-0 opacity-90 sm:opacity-100" 
          />

          <button className="z-10 w-fit bg-white text-sky-500 font-bold px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl shadow-md shadow-sky-200/50 hover:bg-sky-50 active:scale-95 transition-all text-xs sm:text-sm">
            Add Your Goal
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickAddOptions.map((item, index) => (
            <button
              key={index}
              onClick={() => onAddWater && onAddWater(item.value)}
              className="bg-white border-2 border-sky-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:border-sky-300 hover:shadow-md active:scale-95 transition-all group"
            >
              <Droplet className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400 fill-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-sky-500 font-bold text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-sky-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm w-full">
        <div>
          <h3 className="text-xl font-bold text-sky-400 mb-6">Today's Progress</h3>
          
          <div className="flex flex-col items-center justify-center my-6">
            <div className="w-36 h-36 rounded-full border-8 border-sky-100 border-t-sky-400 flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-slate-700">{totalWater}ml</span>
              <span className="text-[10px] text-gray-400 text-center">Water Completed</span>
            </div>
          </div>
        </div>

        <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
          <span className="text-xs text-gray-400 font-medium">Water Completed</span>
          <p className="text-lg font-extrabold text-sky-400 flex items-center justify-center gap-1 mt-0.5">
            <Droplet className="w-5 h-5 fill-sky-400" /> {totalWater}ml
          </p>
        </div>
      </div>

    </div>
  );
}