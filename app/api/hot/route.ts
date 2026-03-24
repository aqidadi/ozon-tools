import { NextResponse } from "next/server";

// 模拟从多数据源汇总的热销商品数据
// 实际场景可接入: 1688热销API、Ozon bestsellers、Google Trends等
// 数据每周人工更新或接入真实数据源

const WEEKLY_HOT: { rank: number; name: string; category: string; trend: "up" | "down" | "stable"; growth: string; reason: string }[] = [
  { rank: 1, name: "棉花娃娃素体20cm", category: "棉花娃娃", trend: "up", growth: "+45%", reason: "俄罗斯妇女节礼品热销" },
  { rank: 2, name: "LED氛围小夜灯", category: "家居生活", trend: "up", growth: "+32%", reason: "宿舍装饰持续热门" },
  { rank: 3, name: "磁吸MagSafe手机支架", category: "手机配件", trend: "stable", growth: "+8%", reason: "iPhone用户刚需" },
  { rank: 4, name: "硅藻泥吸水地垫", category: "家居生活", trend: "up", growth: "+28%", reason: "浴室防滑需求持续" },
  { rank: 5, name: "猫咪毛绒长条抱枕", category: "毛绒玩具", trend: "up", growth: "+22%", reason: "社媒病毒式传播" },
  { rank: 6, name: "手账贴纸套装", category: "文创文具", trend: "stable", growth: "+12%", reason: "学生开学季需求" },
  { rank: 7, name: "宠物自动饮水机", category: "宠物用品", trend: "up", growth: "+35%", reason: "俄罗斯养宠比例增加" },
  { rank: 8, name: "Y2K辣妹夸张项链", category: "饰品首饰", trend: "down", growth: "-5%", reason: "季节性下滑，春季趋缓" },
  { rank: 9, name: "儿童泡泡枪玩具", category: "儿童玩具", trend: "up", growth: "+18%", reason: "儿童节前备货季" },
  { rank: 10, name: "便携挂耳咖啡", category: "食品饮料", trend: "up", growth: "+25%", reason: "俄罗斯咖啡消费快速增长" },
];

const MONTHLY_HOT: { rank: number; name: string; category: string; sales: string; avgPrice: string; tip: string }[] = [
  { rank: 1, name: "棉花娃娃系列", category: "棉花娃娃", sales: "月销30万+件", avgPrice: "¥12-35", tip: "复购率极高，做好素体+娃衣搭配销售" },
  { rank: 2, name: "家居收纳小物", category: "家居生活", sales: "月销80万+件", avgPrice: "¥5-25", tip: "需求稳定，选细分品类避开价格战" },
  { rank: 3, name: "手机配件套装", category: "手机配件", sales: "月销60万+件", avgPrice: "¥8-40", tip: "数据线/支架刚需，注重质量口碑" },
  { rank: 4, name: "宠物玩具&用品", category: "宠物用品", sales: "月销25万+件", avgPrice: "¥10-50", tip: "俄罗斯宠物渗透率高，市场增长快" },
  { rank: 5, name: "儿童玩具礼品", category: "儿童玩具", sales: "月销45万+件", avgPrice: "¥12-60", tip: "节日前1个月提前布局，节日期间翻倍" },
  { rank: 6, name: "美妆工具套装", category: "美妆工具", sales: "月销35万+件", avgPrice: "¥15-55", tip: "俄罗斯女性消费力强，品质要求高" },
  { rank: 7, name: "饰品首饰配件", category: "饰品首饰", sales: "月销20万+件", avgPrice: "¥8-30", tip: "更新快，紧跟潮流趋势选款" },
  { rank: 8, name: "毛绒玩具公仔", category: "毛绒玩具", sales: "月销18万+件", avgPrice: "¥10-45", tip: "IP联名款溢价高，选热门卡通形象" },
];

const TRENDING_KEYWORDS = [
  { kw: "棉花娃娃 换装", platform: "Ozon", hot: 88 },
  { kw: "宠物 自动喂食", platform: "速卖通", hot: 82 },
  { kw: "磁吸 无线充电", platform: "亚马逊", hot: 79 },
  { kw: "LED 氛围灯 RGB", platform: "TikTok", hot: 91 },
  { kw: "收纳盒 透明", platform: "Shopee", hot: 75 },
  { kw: "硅藻泥 浴室", platform: "Ozon", hot: 83 },
  { kw: "毛绒 长条抱枕", platform: "Ozon", hot: 80 },
  { kw: "儿童 益智玩具", platform: "Lazada", hot: 74 },
];

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    weekly: WEEKLY_HOT,
    monthly: MONTHLY_HOT,
    trending: TRENDING_KEYWORDS,
  });
}
