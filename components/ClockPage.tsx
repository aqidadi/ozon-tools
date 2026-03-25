"use client";
import { useState, useEffect } from "react";

const ZONES = [
  { city: "北京", country: "中国", tz: "Asia/Shanghai", flag: "🇨🇳", color: "red" },
  { city: "莫斯科", country: "俄罗斯", tz: "Europe/Moscow", flag: "🇷🇺", color: "blue" },
  { city: "新加坡", country: "新加坡", tz: "Asia/Singapore", flag: "🇸🇬", color: "red" },
  { city: "曼谷", country: "泰国", tz: "Asia/Bangkok", flag: "🇹🇭", color: "blue" },
  { city: "雅加达", country: "印尼", tz: "Asia/Jakarta", flag: "🇮🇩", color: "red" },
  { city: "迪拜", country: "阿联酋", tz: "Asia/Dubai", flag: "🇦🇪", color: "green" },
  { city: "伦敦", country: "英国", tz: "Europe/London", flag: "🇬🇧", color: "blue" },
  { city: "纽约", country: "美国", tz: "America/New_York", flag: "🇺🇸", color: "blue" },
  { city: "洛杉矶", country: "美国西岸", tz: "America/Los_Angeles", flag: "🇺🇸", color: "purple" },
  { city: "圣保罗", country: "巴西", tz: "America/Sao_Paulo", flag: "🇧🇷", color: "green" },
];

function getTime(tz: string) {
  return new Date().toLocaleString("zh-CN", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getDate(tz: string) {
  return new Date().toLocaleString("zh-CN", {
    timeZone: tz,
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function isWorkHour(tz: string) {
  const hour = parseInt(new Date().toLocaleString("en-US", { timeZone: tz, hour: "2-digit", hour12: false }));
  return hour >= 9 && hour < 18;
}

export function ClockPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🌍</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">世界时间</h2>
          <p className="text-xs text-gray-400">跨境主要市场实时时间，绿点=工作时段</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {ZONES.map(z => {
          const time = getTime(z.tz);
          const date = getDate(z.tz);
          const working = isWorkHour(z.tz);
          const hour = parseInt(time.split(":")[0]);
          const isNight = hour < 6 || hour >= 22;

          return (
            <div key={z.tz} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isNight ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{z.flag}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-800">{z.city}</p>
                    <span className={`w-1.5 h-1.5 rounded-full ${working ? "bg-green-500" : isNight ? "bg-gray-300" : "bg-yellow-400"}`} />
                  </div>
                  <p className="text-[11px] text-gray-400">{z.country} · {date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-mono font-bold ${isNight ? "text-gray-400" : "text-gray-800"}`}>{time}</p>
                <p className="text-[10px] text-gray-400">{isNight ? "🌙 夜间" : working ? "💼 工作中" : "🌅 非工作"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
        <p className="font-semibold mb-1">📌 跨境沟通黄金时段</p>
        <p>与俄罗斯供应商：北京时间 <strong>13:00-20:00</strong>（莫斯科工作时间）</p>
        <p>与东南亚买家：北京时间 <strong>9:00-18:00</strong>（时差±1小时）</p>
        <p>与美国买家：北京时间 <strong>21:00-次日6:00</strong>（东部工作时间）</p>
      </div>
    </div>
  );
}
