'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

export default function CooldownTracker() {
  const [stores, setStores] = useState([]);
  
  useEffect(() => {
    const savedStores = JSON.parse(localStorage.getItem('stores')) || [];
    setStores(savedStores);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store.endTime && new Date(store.endTime) > new Date()) {
            const remainingTime = Math.max(0, Math.floor((new Date(store.endTime) - new Date()) / 1000));
            return { ...store, remainingTime };
          } else {
            return { ...store, remainingTime: 0 };
          }
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addStore = () => {
    setStores([...stores, { id: uuidv4(), name: '', remainingTime: 0, recordedTime: '', endTime: '' }]);
  };

  const removeStore = (id) => {
    setStores(stores.filter((store) => store.id !== id));
  };

  const updateStore = (id, key, value) => {
    setStores(
      stores.map((store) => (store.id === id ? { ...store, [key]: value } : store))
    );
  };

  const startCooldown = (id, minutes, seconds) => {
    const now = new Date();
    const totalSeconds = minutes * 60 + seconds;
    const endTime = new Date(now.getTime() + totalSeconds * 1000);
    
    setStores(
      stores.map((store) =>
        store.id === id
          ? { ...store, recordedTime: now.toLocaleTimeString(), endTime: endTime.toISOString(), remainingTime: totalSeconds }
          : store
      )
    );
  };

  return (
    <motion.div 
      className="p-8 max-w-5xl mx-auto bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold mb-6 text-center text-purple-400">Cooldown Tracker</h1>
      <div className="flex justify-center mb-6">
        <button className="px-6 py-3 bg-green-500 text-lg font-bold rounded-lg hover:bg-green-600 transition" onClick={addStore}>+ Add Store</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-600 text-white text-lg">
              <th className="p-3">ชื่อร้าน</th>
              <th className="p-3 text-center">เวลาที่เหลือ</th>
              <th className="p-3 text-center">ครบเวลาตอน</th>
              <th className="p-3 text-center">เวลาที่สร้าง</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className={`transition duration-300 ${store.remainingTime === 0 ? 'bg-green-500 text-black' : 'bg-gray-800 text-white'}`}>
                <td className="p-3">
                  <input
                    type="text"
                    value={store.name}
                    onChange={(e) => updateStore(store.id, 'name', e.target.value)}
                    className="bg-gray-700 text-white p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </td>
                <td className="p-3 text-center text-xl font-semibold">
                  {Math.floor(store.remainingTime / 60)}m {store.remainingTime % 60}s
                </td>
                <td className="p-3 text-center text-lg font-bold">
                  {store.endTime ? new Date(store.endTime).toLocaleTimeString() : '-'}
                </td>
                <td className="p-3 text-center">{store.recordedTime}</td>
                <td className="p-3 flex gap-3 justify-center">
                  <button
                    className="px-4 py-2 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition"
                    onClick={() => {
                      const minutes = parseInt(prompt('Enter minutes:'), 10) || 0;
                      const seconds = parseInt(prompt('Enter seconds:'), 10) || 0;
                      startCooldown(store.id, minutes, seconds);
                    }}
                  >
                    เปลี่ยนเวลา
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 rounded-lg font-bold hover:bg-red-600 transition"
                    onClick={() => removeStore(store.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}