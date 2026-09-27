import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Bell, FileText, User } from 'lucide-react';
import logo from '../assets/logo.png'; 

export default function Menu({ activeTab, setActiveTab }) {
  const [userName, setUserName] = useState('Mayonggg');


  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Analysis', icon: BarChart3 },
    { name: 'Reminder', icon: Bell },
    { name: 'Notes', icon: FileText },
    { name: 'Profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 md:shrink-0 bg-white border-t md:border-t-0 md:border-r border-gray-100 flex md:flex-col justify-between p-4 md:p-6 h-auto md:h-screen fixed md:static bottom-0 left-0 z-50 shadow-lg md:shadow-none">
      <div className="hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <img 
            src={logo}
            alt="Logo Hydro Track" 
            className="w-12 h-12 rounded-full object-cover shadow-md shadow-sky-100 border border-sky-100"
          />
          <div>
            <h1 className="font-extrabold text-slate-900">HYDRATION TRACKER</h1>
            <p className="text-xs text-gray-400 font-medium">Healthy Life</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-400 text-white shadow-lg shadow-sky-200'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <nav className="flex md:hidden justify-around w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-500 font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px]">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden md:flex items-center gap-3 p-2 border border-gray-200 rounded-2xl bg-white">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mayonggg"
          alt="Profile"
          className="w-10 h-10 rounded-full bg-amber-100"
        />
        <div>
      
          <h4 className="text-sm font-bold text-sky-500 leading-tight">{userName}</h4>
          <p className="text-xs text-gray-400">Pro member</p>
        </div>
      </div>
    </aside>
  );
}