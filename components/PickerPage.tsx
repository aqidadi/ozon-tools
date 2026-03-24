"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "棉花娃娃",
    icon: "🧸",
    color: "pink",
    keywords: [
      { label: "棉花娃娃素体", kw: "棉花娃娃 素体 20cm", hot: true },
      { label: "娃衣套装", kw: "棉花娃娃 娃衣 套装", hot: true },
      { label: "娃娃配件", kw: "棉花娃娃 配件 背包", hot: false },
      { label: "中华娘娃衣", kw: "棉花娃娃 汉服 娃衣", hot: true },
      { label: "娃娃展示盒", kw: "棉花娃娃 展示盒 亚克力", hot: false },
      { label: "娃娃包包", kw: "棉花娃娃 手提包 收纳", hot: false },
    ],
  },
  {
    name: "盲盒玩具",
    icon: "🎁",
    color: "blue",
    keywords: [
      { label: "泡泡玛特同款", kw: "盲盒 手办 潮玩 摆件", hot: true },
      { label: "卡片盲盒", kw: "盲盒 卡片 收藏", hot: false },
      { label: "迷你公仔盲盒", kw: "迷你 公仔 盲盒 5cm", hot: true },
      { label: "海洋动物盲盒", kw: "海洋 动物 盲盒 模型", hot: false },
    ],
  },
  {
    name: "毛绒玩具",
    icon: "🐻",
    color: "yellow",
    keywords: [
      { label: "猫咪毛绒公仔", kw: "猫咪 毛绒 公仔 抱枕", hot: true },
      { label: "熊猫公仔", kw: "熊猫 毛绒 玩具", hot: true },
      { label: "草莓熊同款", kw: "草莓熊 毛绒 抱枕", hot: true },
      { label: "长条枕鳄鱼", kw: "鳄鱼 长条枕 毛绒", hot: true },
      { label: "可爱兔子公仔", kw: "兔子 毛绒 公仔 玩具", hot: false },
      { label: "大号抱抱熊", kw: "抱抱熊 大号 毛绒 1米", hot: false },
      { label: "小恐龙玩偶", kw: "恐龙 毛绒 玩偶", hot: false },
      { label: "火龙果抱枕", kw: "火龙果 毛绒 抱枕", hot: true },
    ],
  },
  {
    name: "儿童玩具",
    icon: "🚀",
    color: "orange",
    keywords: [
      { label: "积木玩具", kw: "儿童 积木 益智 玩具", hot: true },
      { label: "遥控车", kw: "儿童 遥控车 玩具", hot: true },
      { label: "芭比娃娃同款", kw: "换装 娃娃 女孩 玩具", hot: true },
      { label: "水枪玩具", kw: "儿童 水枪 夏天 玩具", hot: false },
      { label: "磁力片拼图", kw: "磁力片 儿童 益智 拼图", hot: true },
      { label: "过家家厨房", kw: "儿童 过家家 厨房 玩具", hot: false },
      { label: "手工DIY套装", kw: "儿童 手工 DIY 材料包", hot: false },
      { label: "泡泡枪", kw: "儿童 泡泡枪 玩具", hot: true },
      { label: "陀螺玩具", kw: "儿童 陀螺 战斗 玩具", hot: false },
    ],
  },
  {
    name: "美妆工具",
    icon: "💄",
    color: "rose",
    keywords: [
      { label: "化妆刷套装", kw: "化妆刷 套装 全套", hot: true },
      { label: "美容仪", kw: "美容仪 脸部 按摩", hot: true },
      { label: "假睫毛", kw: "假睫毛 自然 浓密", hot: true },
      { label: "睫毛夹", kw: "睫毛夹 卷翘 持久", hot: false },
      { label: "粉扑美妆蛋", kw: "美妆蛋 粉扑 不吃粉", hot: true },
      { label: "眉笔眉粉", kw: "眉笔 防水 持久", hot: false },
      { label: "卸妆油巾", kw: "卸妆 湿巾 温和", hot: false },
      { label: "美甲贴纸", kw: "美甲 贴纸 指甲贴", hot: true },
      { label: "香薰蜡烛", kw: "香薰 蜡烛 礼盒", hot: true },
    ],
  },
  {
    name: "家居生活",
    icon: "🏠",
    color: "teal",
    keywords: [
      { label: "硅藻泥地垫", kw: "硅藻泥 地垫 吸水", hot: true },
      { label: "收纳盒套装", kw: "收纳盒 抽屉 整理", hot: true },
      { label: "氛围灯夜灯", kw: "LED 氛围灯 夜灯 小夜灯", hot: true },
      { label: "创意厨房小物", kw: "厨房 创意 小工具 切菜", hot: false },
      { label: "保温杯", kw: "保温杯 不锈钢 大容量", hot: true },
      { label: "香薰扩香器", kw: "香薰 扩香 精油 无水", hot: false },
      { label: "挂钩无痕贴", kw: "无痕 挂钩 强力 粘贴", hot: false },
      { label: "桌面收纳架", kw: "桌面 收纳架 文具 整理", hot: false },
      { label: "手提购物袋", kw: "环保 购物袋 折叠 手提", hot: false },
      { label: "多功能剪刀", kw: "多功能 剪刀 厨房", hot: false },
    ],
  },
  {
    name: "手机配件",
    icon: "📱",
    color: "slate",
    keywords: [
      { label: "磁吸手机支架", kw: "磁吸 手机支架 MagSafe", hot: true },
      { label: "手机壳", kw: "手机壳 透明 防摔", hot: true },
      { label: "数据线快充", kw: "数据线 快充 多功能 三合一", hot: true },
      { label: "无线充电器", kw: "无线充电器 磁吸 快充", hot: true },
      { label: "耳机收纳盒", kw: "AirPods 保护壳 硅胶", hot: false },
      { label: "手机屏幕保护膜", kw: "钢化膜 全屏 防指纹", hot: false },
      { label: "移动电源", kw: "充电宝 大容量 轻薄", hot: true },
      { label: "手机支架懒人", kw: "手机 懒人支架 桌面", hot: false },
    ],
  },
  {
    name: "文创文具",
    icon: "✏️",
    color: "indigo",
    keywords: [
      { label: "手账本套装", kw: "手账本 套装 贴纸", hot: true },
      { label: "贴纸套装", kw: "贴纸 手账 装饰 DIY", hot: true },
      { label: "钢笔墨水", kw: "钢笔 彩色墨水 书写", hot: false },
      { label: "胶带和纸", kw: "和纸胶带 装饰 手账", hot: true },
      { label: "印章套装", kw: "印章 复古 装饰 手账", hot: false },
      { label: "荧光笔套装", kw: "荧光笔 学生 多色套装", hot: false },
      { label: "画册速写本", kw: "速写本 画册 素描", hot: false },
    ],
  },
  {
    name: "饰品首饰",
    icon: "💍",
    color: "amber",
    keywords: [
      { label: "Y2K辣妹项链", kw: "Y2K 项链 辣妹 夸张", hot: true },
      { label: "耳环套装", kw: "耳环 套装 小众 设计", hot: true },
      { label: "发夹发饰", kw: "发夹 鲨鱼夹 头饰 发饰", hot: true },
      { label: "戒指套装", kw: "戒指 套装 小众 叠戴", hot: false },
      { label: "手链串珠", kw: "手链 串珠 DIY 天然石", hot: true },
      { label: "发带发箍", kw: "发箍 发带 宽边 时尚", hot: false },
      { label: "包包挂件", kw: "包包 挂件 钥匙扣 装饰", hot: true },
    ],
  },
  {
    name: "宠物用品",
    icon: "🐾",
    color: "green",
    keywords: [
      { label: "猫咪玩具", kw: "猫咪 逗猫棒 玩具 羽毛", hot: true },
      { label: "狗狗玩具", kw: "狗狗 玩具 磨牙 耐咬", hot: true },
      { label: "宠物项圈", kw: "宠物 项圈 猫咪 小狗", hot: false },
      { label: "猫粮零食", kw: "猫咪 零食 冻干 营养", hot: true },
      { label: "宠物衣服", kw: "猫咪 狗狗 衣服 可爱", hot: false },
      { label: "宠物外出包", kw: "宠物 外出包 猫包 透气", hot: true },
      { label: "自动饮水机", kw: "宠物 自动饮水机 循环过滤", hot: true },
      { label: "猫咪抓板", kw: "猫咪 抓板 剑麻 纸板", hot: false },
    ],
  },
  {
    name: "运动户外",
    icon: "⚽",
    color: "lime",
    keywords: [
      { label: "瑜伽垫", kw: "瑜伽垫 防滑 加厚", hot: true },
      { label: "跳绳计数", kw: "跳绳 计数 智能", hot: false },
      { label: "健身手套", kw: "健身 手套 防滑 男女", hot: false },
      { label: "户外折叠椅", kw: "户外 折叠椅 露营 便携", hot: true },
      { label: "运动水壶", kw: "运动 水壶 大容量 便携", hot: false },
      { label: "骑行手套", kw: "骑行 手套 自行车 防风", hot: false },
      { label: "登山包", kw: "登山包 户外 大容量 防水", hot: false },
      { label: "钓鱼配件", kw: "钓鱼 配件 鱼钩 浮漂", hot: false },
    ],
  },
  {
    name: "节日礼品",
    icon: "🎄",
    color: "red",
    keywords: [
      { label: "新年礼盒", kw: "新年 礼盒 节日 送礼", hot: true },
      { label: "妇女节礼品", kw: "妇女节 礼品 女神节", hot: true },
      { label: "生日礼物", kw: "生日 礼物 创意 实用", hot: false },
      { label: "圣诞装饰", kw: "圣诞 装饰 挂件 摆件", hot: true },
      { label: "情人节礼品", kw: "情人节 礼品 浪漫", hot: true },
      { label: "儿童节玩具礼", kw: "儿童节 礼物 玩具 套装", hot: false },
      { label: "婚庆伴手礼", kw: "婚庆 伴手礼 小礼品", hot: false },
    ],
  },
  {
    name: "数码周边",
    icon: "💻",
    color: "cyan",
    keywords: [
      { label: "键盘腕托", kw: "键盘 腕托 硅胶 护腕", hot: false },
      { label: "游戏手柄", kw: "游戏 手柄 手机 连接", hot: true },
      { label: "LED桌面灯", kw: "LED 桌面灯 护眼 阅读", hot: true },
      { label: "摄像头支架", kw: "摄像头 支架 电脑 桌面", hot: false },
      { label: "鼠标垫大号", kw: "鼠标垫 超大 防滑 游戏", hot: true },
      { label: "手机散热器", kw: "手机 散热器 游戏 降温", hot: true },
      { label: "Type-C集线器", kw: "Type-C 集线器 扩展坞 多口", hot: true },
    ],
  },
  {
    name: "汽车用品",
    icon: "🚗",
    color: "stone",
    keywords: [
      { label: "车载手机支架", kw: "车载 手机支架 磁吸 出风口", hot: true },
      { label: "车载香薰", kw: "车载 香薰 出风口 持久", hot: true },
      { label: "方向盘套", kw: "方向盘套 防滑 四季通用", hot: false },
      { label: "座椅靠垫", kw: "汽车 座椅靠垫 腰靠 护颈", hot: false },
      { label: "车内遮阳板", kw: "汽车 遮阳 前挡 遮阳板", hot: false },
      { label: "行车记录仪", kw: "行车记录仪 高清 夜视", hot: true },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; badge: string; btn: string; search: string }> = {
  purple: { bg: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700", btn: "hover:bg-purple-100 hover:text-purple-700", search: "bg-purple-600 hover:bg-purple-700" },
  pink:   { bg: "bg-pink-50 border-pink-200",     badge: "bg-pink-100 text-pink-700",     btn: "hover:bg-pink-100 hover:text-pink-700",     search: "bg-pink-600 hover:bg-pink-700" },
  blue:   { bg: "bg-blue-50 border-blue-200",     badge: "bg-blue-100 text-blue-700",     btn: "hover:bg-blue-100 hover:text-blue-700",     search: "bg-blue-600 hover:bg-blue-700" },
  yellow: { bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-800", btn: "hover:bg-yellow-100 hover:text-yellow-800", search: "bg-yellow-600 hover:bg-yellow-700" },
  orange: { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", btn: "hover:bg-orange-100 hover:text-orange-700", search: "bg-orange-600 hover:bg-orange-700" },
  rose:   { bg: "bg-rose-50 border-rose-200",     badge: "bg-rose-100 text-rose-700",     btn: "hover:bg-rose-100 hover:text-rose-700",     search: "bg-rose-600 hover:bg-rose-700" },
  teal:   { bg: "bg-teal-50 border-teal-200",     badge: "bg-teal-100 text-teal-700",     btn: "hover:bg-teal-100 hover:text-teal-700",     search: "bg-teal-600 hover:bg-teal-700" },
  slate:  { bg: "bg-slate-50 border-slate-200",   badge: "bg-slate-100 text-slate-700",   btn: "hover:bg-slate-100 hover:text-slate-700",   search: "bg-slate-600 hover:bg-slate-700" },
  indigo: { bg: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700", btn: "hover:bg-indigo-100 hover:text-indigo-700", search: "bg-indigo-600 hover:bg-indigo-700" },
  amber:  { bg: "bg-amber-50 border-amber-200",   badge: "bg-amber-100 text-amber-800",   btn: "hover:bg-amber-100 hover:text-amber-800",   search: "bg-amber-600 hover:bg-amber-700" },
  green:  { bg: "bg-green-50 border-green-200",   badge: "bg-green-100 text-green-700",   btn: "hover:bg-green-100 hover:text-green-700",   search: "bg-green-600 hover:bg-green-700" },
  lime:   { bg: "bg-lime-50 border-lime-200",     badge: "bg-lime-100 text-lime-800",     btn: "hover:bg-lime-100 hover:text-lime-800",     search: "bg-lime-600 hover:bg-lime-700" },
  red:    { bg: "bg-red-50 border-red-200",       badge: "bg-red-100 text-red-700",       btn: "hover:bg-red-100 hover:text-red-700",       search: "bg-red-600 hover:bg-red-700" },
  cyan:   { bg: "bg-cyan-50 border-cyan-200",     badge: "bg-cyan-100 text-cyan-700",     btn: "hover:bg-cyan-100 hover:text-cyan-700",     search: "bg-cyan-600 hover:bg-cyan-700" },
  stone:  { bg: "bg-stone-50 border-stone-200",   badge: "bg-stone-100 text-stone-700",   btn: "hover:bg-stone-100 hover:text-stone-700",   search: "bg-stone-600 hover:bg-stone-700" },
};

export function PickerPage() {
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState<string | null>("棉花娃娃");

  const copyKw = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  const searchOn1688 = (kw: string) => {
    window.open(`https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`, "_blank");
  };

  const filtered = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        keywords: cat.keywords.filter(k => k.label.includes(search) || k.kw.includes(search)),
      })).filter(cat => cat.keywords.length > 0)
    : CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">选品参考</h2>
        <p className="text-sm text-gray-500 mb-3">15个品类，100+关键词，点「复制」或「搜」直达1688</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); if(e.target.value) setOpenCat(null); }}
          placeholder="搜索品类或关键词..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => {
          const colors = COLOR_MAP[cat.color] || COLOR_MAP.blue;
          const isOpen = openCat === cat.name || !!search.trim();
          return (
            <div key={cat.name} className={`border rounded-xl overflow-hidden ${isOpen ? colors.bg : "border-gray-200 bg-white"}`}>
              {/* Header */}
              <button
                onClick={() => setOpenCat(isOpen && !search ? null : cat.name)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
              >
                <span className="text-base">{cat.icon}</span>
                <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${colors.badge}`}>{cat.keywords.length}个词</span>
                <span className="ml-auto text-gray-400">{isOpen && !search ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span>
              </button>
              {/* Keywords */}
              {isOpen && (
                <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex flex-wrap gap-1.5">
                  {cat.keywords.map(({ label, kw, hot }) => (
                    <div key={kw} className="flex items-center gap-0.5">
                      <button onClick={() => copyKw(kw)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-l-lg border border-gray-200 bg-white transition-colors ${colors.btn}`}>
                        {hot && <span className="text-[10px]">🔥</span>}
                        {copiedKw === kw ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300" />}
                        {label}
                      </button>
                      <button onClick={() => searchOn1688(kw)} title="在1688搜索"
                        className={`text-xs px-2 py-1.5 rounded-r-lg text-white transition-colors ${colors.search}`}>
                        搜
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {copiedKw && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <Check size={14} className="text-green-400" />
          已复制「{copiedKw}」
          <a href="https://www.1688.com" target="_blank" rel="noopener noreferrer"
            className="ml-2 text-blue-300 underline text-xs flex items-center gap-1">
            打开1688 <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
