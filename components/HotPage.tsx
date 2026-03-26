"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

interface HotItem {
  rank: number;
  name: string;
  category: string;
  trend: "up" | "down" | "stable";
  growth: string;
  reason: string;
}

interface Platform {
  id: string;
  label: string;
  emoji: string;
  region: string;
  color: string;
  bgClass: string;
  ranklistUrl: string;
  ranklistLabel: string;
  description: string;
  items: HotItem[];
}

const PLATFORMS: Platform[] = [
  {
    id: "tiktok",
    label: "TikTok Shop",
    emoji: "🎵",
    region: "全球",
    color: "text-pink-600",
    bgClass: "bg-pink-600",
    ranklistUrl: "https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en",
    ranklistLabel: "TikTok Creative Center",
    description: "短视频带货 · 冲动消费 · 全球用户",
    items: [
      { rank: 1, name: "LED氛围灯 RGB多彩", category: "家居灯具", trend: "up", growth: "+91%", reason: "达人直播打光神器，视觉冲击强" },
      { rank: 2, name: "磁吸折叠手机支架", category: "手机配件", trend: "up", growth: "+74%", reason: "开车追剧刚需，展示效果好" },
      { rank: 3, name: "猫咪长条毛绒抱枕", category: "毛绒玩具", trend: "up", growth: "+68%", reason: "社媒病毒传播，外形萌引发复购" },
      { rank: 4, name: "电子宠物 复古手持", category: "电子玩具", trend: "up", growth: "+55%", reason: "Z世代怀旧风，TK种草极快" },
      { rank: 5, name: "迷你便携投影仪", category: "数码电子", trend: "up", growth: "+48%", reason: "户外露营热，场景化转化高" },
      { rank: 6, name: "宠物自动逗猫棒", category: "宠物用品", trend: "up", growth: "+61%", reason: "视频内容天然有趣，分享率高" },
      { rank: 7, name: "香薰蜡烛礼盒", category: "家居香氛", trend: "stable", growth: "+22%", reason: "精致包装出镜率高，礼品刚需" },
      { rank: 8, name: "Y2K辣妹夸张耳环", category: "时尚饰品", trend: "stable", growth: "+18%", reason: "穿搭博主标配，每季更新款" },
    ],
  },
  {
    id: "ozon",
    label: "Ozon",
    emoji: "🇷🇺",
    region: "俄罗斯",
    color: "text-blue-600",
    bgClass: "bg-blue-600",
    ranklistUrl: "https://www.ozon.ru/highlight/bestsellers-10985822/",
    ranklistLabel: "Ozon 官方热销榜",
    description: "俄罗斯电商龙头 · 本地化需求",
    items: [
      { rank: 1, name: "棉花娃娃素体 20cm", category: "棉花娃娃", trend: "up", growth: "+45%", reason: "俄罗斯女性高复购，节日礼品首选" },
      { rank: 2, name: "硅藻泥吸水地垫", category: "家居生活", trend: "up", growth: "+38%", reason: "浴室防滑刚需，口碑传播好" },
      { rank: 3, name: "宠物自动饮水机", category: "宠物用品", trend: "up", growth: "+35%", reason: "俄罗斯养宠比例高，市场快速增长" },
      { rank: 4, name: "便携挂耳咖啡", category: "食品饮料", trend: "up", growth: "+29%", reason: "咖啡文化崛起，低单价易冲动购买" },
      { rank: 5, name: "儿童泡泡枪玩具", category: "儿童玩具", trend: "up", growth: "+42%", reason: "儿童节前备货季，家长采购高峰" },
      { rank: 6, name: "美妆刷套装 16支", category: "美妆工具", trend: "up", growth: "+26%", reason: "俄罗斯女性消费力强，礼盒热门" },
      { rank: 7, name: "数据线 3合1 编织", category: "手机配件", trend: "stable", growth: "+11%", reason: "多设备兼容刚需，复购快" },
      { rank: 8, name: "手账贴纸套装", category: "文创文具", trend: "stable", growth: "+14%", reason: "学生群体稳定需求，全年平稳" },
    ],
  },
  {
    id: "wildberries",
    label: "Wildberries",
    emoji: "🫐",
    region: "俄罗斯",
    color: "text-purple-600",
    bgClass: "bg-purple-600",
    ranklistUrl: "https://www.wildberries.ru/promotions/top-products",
    ranklistLabel: "WB 热销榜",
    description: "俄罗斯最大电商 · 服装时尚为主",
    items: [
      { rank: 1, name: "女士卫衣宽松版型", category: "女装", trend: "up", growth: "+52%", reason: "WB服装品类第一，俄罗斯春季换装" },
      { rank: 2, name: "运动内衣无钢圈", category: "内衣", trend: "up", growth: "+44%", reason: "健身热潮带动，舒适需求持续" },
      { rank: 3, name: "儿童棉质睡衣套装", category: "童装", trend: "up", growth: "+38%", reason: "父母高度重视儿童穿着质量" },
      { rank: 4, name: "男士休闲运动裤", category: "男装", trend: "stable", growth: "+21%", reason: "居家+出行兼顾，全年刚需" },
      { rank: 5, name: "针织帽 毛线帽", category: "帽子配件", trend: "up", growth: "+35%", reason: "俄罗斯冬季漫长，保暖刚需" },
      { rank: 6, name: "硅胶洗脸刷 电动", category: "美容仪器", trend: "up", growth: "+29%", reason: "美容护肤意识提升，入门价格友好" },
      { rank: 7, name: "家居拖鞋 记忆棉", category: "鞋类", trend: "stable", growth: "+16%", reason: "家居舒适化趋势，高评分口碑好" },
      { rank: 8, name: "保温杯 大容量", category: "餐饮用品", trend: "up", growth: "+27%", reason: "户外出行刚需，双层保温热卖" },
    ],
  },
  {
    id: "shopee",
    label: "Shopee",
    emoji: "🛍️",
    region: "东南亚",
    color: "text-orange-600",
    bgClass: "bg-orange-500",
    ranklistUrl: "https://shopee.co.th/",
    ranklistLabel: "Shopee 热销榜",
    description: "东南亚最大电商 · 泰越印马菲",
    items: [
      { rank: 1, name: "防晒霜 SPF50+ 轻薄", category: "防晒护肤", trend: "up", growth: "+88%", reason: "东南亚热带气候，防晒全年刚需" },
      { rank: 2, name: "无线蓝牙耳机 入耳式", category: "数码配件", trend: "up", growth: "+65%", reason: "通勤刚需，价格敏感带动走量" },
      { rank: 3, name: "迷你USB风扇", category: "家用电器", trend: "up", growth: "+72%", reason: "高温天气刚需，轻巧便携好评多" },
      { rank: 4, name: "美白精华 烟酰胺", category: "美容护肤", trend: "up", growth: "+54%", reason: "东南亚美白需求极大，成分党兴起" },
      { rank: 5, name: "旅行防水收纳袋套装", category: "旅行用品", trend: "stable", growth: "+23%", reason: "东南亚旅游热，多尺寸套装受欢迎" },
      { rank: 6, name: "儿童学习文具套装", category: "文具教育", trend: "up", growth: "+31%", reason: "开学季需求旺，家长团购多" },
      { rank: 7, name: "网红零食礼包", category: "食品零食", trend: "stable", growth: "+19%", reason: "TikTok种草转化，节日送礼热门" },
      { rank: 8, name: "运动护膝护腕套", category: "运动健身", trend: "up", growth: "+28%", reason: "健身风潮兴起，年轻群体关注高" },
    ],
  },
  {
    id: "lazada",
    label: "Lazada",
    emoji: "🌺",
    region: "东南亚",
    color: "text-blue-500",
    bgClass: "bg-blue-500",
    ranklistUrl: "https://www.lazada.co.th/",
    ranklistLabel: "Lazada 热销榜",
    description: "阿里系东南亚 · 泰马印菲越",
    items: [
      { rank: 1, name: "空气炸锅 3.5L 家用", category: "厨房电器", trend: "up", growth: "+63%", reason: "健康饮食风，东南亚中产家庭标配" },
      { rank: 2, name: "无线充电板 15W", category: "手机配件", trend: "up", growth: "+47%", reason: "苹果安卓通用，礼品送礼热门" },
      { rank: 3, name: "儿童平板学习机", category: "教育电子", trend: "up", growth: "+39%", reason: "教育投资意愿强，父母高消费意愿" },
      { rank: 4, name: "跑步机 折叠小型", category: "运动健身", trend: "up", growth: "+44%", reason: "居家健身热，公寓空间小需折叠款" },
      { rank: 5, name: "美发卷发棒 陶瓷", category: "美发工具", trend: "stable", growth: "+22%", reason: "女性美发刚需，礼品季销量翻倍" },
      { rank: 6, name: "智能手表 血氧检测", category: "智能穿戴", trend: "up", growth: "+58%", reason: "健康监测意识提升，性价比高" },
      { rank: 7, name: "家用空气净化器", category: "家用电器", trend: "up", growth: "+33%", reason: "东南亚空气质量问题，需求持续" },
      { rank: 8, name: "瑜伽垫 防滑加厚", category: "运动健身", trend: "stable", growth: "+18%", reason: "瑜伽健身普及，女性用户基数大" },
    ],
  },
  {
    id: "amazon",
    label: "亚马逊",
    emoji: "🌎",
    region: "欧美",
    color: "text-yellow-700",
    bgClass: "bg-yellow-500",
    ranklistUrl: "https://www.amazon.com/gp/bestsellers",
    ranklistLabel: "Amazon Best Sellers",
    description: "欧美主流市场 · 品质要求高",
    items: [
      { rank: 1, name: "硅胶厨具套装 耐高温", category: "厨房用品", trend: "up", growth: "+33%", reason: "居家烹饪热潮，礼品采购稳定" },
      { rank: 2, name: "蓝牙追踪器 防丢失", category: "数码配件", trend: "up", growth: "+57%", reason: "旅行行李追踪刚需，AirTag热度带动" },
      { rank: 3, name: "保温杯 大容量 1L", category: "餐饮厨具", trend: "up", growth: "+35%", reason: "Stanley带动同类热销，实用口碑强" },
      { rank: 4, name: "宠物磨爪板 瓦楞纸", category: "宠物用品", trend: "up", growth: "+44%", reason: "美国养宠家庭多，消耗品高复购" },
      { rank: 5, name: "便携折叠露营桌椅", category: "户外运动", trend: "up", growth: "+39%", reason: "Glamping风潮，春夏旺季备货" },
      { rank: 6, name: "办公人体工学腰垫", category: "办公用品", trend: "stable", growth: "+21%", reason: "居家办公常态化，健康办公持续热" },
      { rank: 7, name: "儿童磁力贴画套装", category: "儿童玩具", trend: "up", growth: "+28%", reason: "益智教育类礼品，高评分口碑好" },
      { rank: 8, name: "电动洁面仪 硅胶", category: "美容仪器", trend: "stable", growth: "+18%", reason: "护肤科技感强，客单价高利润好" },
    ],
  },
  {
    id: "ebay",
    label: "eBay",
    emoji: "🔵",
    region: "欧美",
    color: "text-red-600",
    bgClass: "bg-red-500",
    ranklistUrl: "https://www.ebay.com/trending",
    ranklistLabel: "eBay Trending",
    description: "欧美二手+新品 · 小众收藏品强",
    items: [
      { rank: 1, name: "复古游戏卡带 GBA/FC", category: "收藏游戏", trend: "up", growth: "+72%", reason: "怀旧经济大热，收藏价值高溢价强" },
      { rank: 2, name: "运动球星卡 NBA", category: "球星卡", trend: "up", growth: "+88%", reason: "卡牌收藏主流，年轻藏家快速增长" },
      { rank: 3, name: "复古腕表 机械表", category: "手表", trend: "up", growth: "+41%", reason: "老款机械表升值，eBay是主要交易平台" },
      { rank: 4, name: "电子配件 翻新iPhone", category: "数码电子", trend: "stable", growth: "+25%", reason: "翻新机高性价比，欧美环保意识强" },
      { rank: 5, name: "汽车改装配件", category: "汽车用品", trend: "up", growth: "+33%", reason: "DIY改装文化盛行，专业买家多" },
      { rank: 6, name: "手办 盲盒 限定款", category: "手办玩具", trend: "up", growth: "+55%", reason: "日系IP全球热，eBay是海外买卖主平台" },
      { rank: 7, name: "乐高 绝版套装", category: "积木玩具", trend: "up", growth: "+47%", reason: "绝版溢价显著，收藏投资两用" },
      { rank: 8, name: "古着复古服装 Y2K", category: "复古服饰", trend: "up", growth: "+62%", reason: "Y2K风全球复兴，真实年代感受追捧" },
    ],
  },
  {
    id: "etsy",
    label: "Etsy",
    emoji: "🎨",
    region: "欧美",
    color: "text-orange-700",
    bgClass: "bg-orange-600",
    ranklistUrl: "https://www.etsy.com/trending",
    ranklistLabel: "Etsy Trending",
    description: "手工艺品&定制 · 溢价空间大",
    items: [
      { rank: 1, name: "定制姓名首饰 刻字", category: "个性化饰品", trend: "up", growth: "+78%", reason: "个性化礼品需求旺，节日送礼首选" },
      { rank: 2, name: "手工香薰蜡烛 定制", category: "家居香氛", trend: "up", growth: "+65%", reason: "手工质感溢价高，精致生活风格" },
      { rank: 3, name: "复古风装饰画 海报", category: "家居装饰", trend: "up", growth: "+43%", reason: "家居改造热，个性化布置需求强" },
      { rank: 4, name: "手工编织包 托特包", category: "手工包袋", trend: "up", growth: "+52%", reason: "可持续时尚，手工质感溢价3-5倍" },
      { rank: 5, name: "定制宠物画像", category: "宠物用品", trend: "up", growth: "+88%", reason: "宠物主人情感投入高，礼品爆款" },
      { rank: 6, name: "水晶石 原石摆件", category: "灵性收藏", trend: "up", growth: "+57%", reason: "欧美灵性风潮，Z世代热衷水晶能量" },
      { rank: 7, name: "手工陶瓷马克杯", category: "餐饮用品", trend: "stable", growth: "+29%", reason: "独特纹理溢价强，咖啡文化搭配" },
      { rank: 8, name: "DIY材料包 刺绣", category: "手工材料", trend: "up", growth: "+44%", reason: "居家手工艺热潮，解压+成就感" },
    ],
  },
  {
    id: "walmart",
    label: "Walmart",
    emoji: "🏪",
    region: "北美",
    color: "text-blue-700",
    bgClass: "bg-blue-700",
    ranklistUrl: "https://www.walmart.com/shop/trending",
    ranklistLabel: "Walmart Trending",
    description: "美国线上零售 · 大众性价比",
    items: [
      { rank: 1, name: "家用清洁套装 拖把", category: "清洁用品", trend: "up", growth: "+38%", reason: "大众刚需，超高性价比走量大" },
      { rank: 2, name: "空气炸锅 5L 家用", category: "厨房电器", trend: "up", growth: "+55%", reason: "美国家庭标配，Walmart客群价格敏感" },
      { rank: 3, name: "儿童玩具礼品套装", category: "儿童玩具", trend: "up", growth: "+42%", reason: "节假日礼品采购首选，走量惊人" },
      { rank: 4, name: "床上四件套 全棉", category: "家纺寝具", trend: "stable", growth: "+22%", reason: "家居必需品，大尺寸美规市场大" },
      { rank: 5, name: "运动水壶 大容量", category: "运动健身", trend: "up", growth: "+31%", reason: "健康意识提升，日常携带刚需" },
      { rank: 6, name: "LED节能灯泡套装", category: "家居照明", trend: "stable", growth: "+18%", reason: "节能替换刚需，多支套装走量好" },
      { rank: 7, name: "折叠储物箱 布艺", category: "家居收纳", trend: "up", growth: "+27%", reason: "整理收纳热，美国家庭空间大好卖" },
      { rank: 8, name: "蓝牙音箱 防水", category: "数码配件", trend: "up", growth: "+35%", reason: "户外聚会刚需，价格亲民走量快" },
    ],
  },
  {
    id: "aliexpress",
    label: "速卖通",
    emoji: "🌍",
    region: "中东/欧非",
    color: "text-red-600",
    bgClass: "bg-red-500",
    ranklistUrl: "https://www.aliexpress.com/gcp/300000512/OqTEjjpT",
    ranklistLabel: "速卖通热销榜",
    description: "中东欧非拉 · 高性价比优势",
    items: [
      { rank: 1, name: "车载手机支架 磁吸", category: "汽车用品", trend: "up", growth: "+52%", reason: "中东驾车率高，手机导航刚需" },
      { rank: 2, name: "假发 直发 长款", category: "美发用品", trend: "up", growth: "+68%", reason: "非洲/中东假发需求巨大，增长快" },
      { rank: 3, name: "太阳能充电板 折叠", category: "户外数码", trend: "up", growth: "+44%", reason: "非洲电力不稳，太阳能产品刚需" },
      { rank: 4, name: "仿真花束 永生花", category: "家居装饰", trend: "up", growth: "+36%", reason: "替代鲜花礼品，节日送礼热门" },
      { rank: 5, name: "男士手表 机械风格", category: "手表饰品", trend: "up", growth: "+31%", reason: "中东男性消费力强，送礼首选" },
      { rank: 6, name: "穆斯林礼拜毯", category: "宗教用品", trend: "stable", growth: "+20%", reason: "中东斋月前后需求大涨，季节性强" },
      { rank: 7, name: "无线鼠标键盘套装", category: "电脑配件", trend: "stable", growth: "+24%", reason: "居家办公刚需，性价比高竞争力强" },
      { rank: 8, name: "小白鞋 百搭休闲", category: "鞋类服饰", trend: "up", growth: "+41%", reason: "全球通款，高性价比走量大" },
    ],
  },
  {
    id: "mercadolibre",
    label: "Mercado Libre",
    emoji: "🌎",
    region: "拉丁美洲",
    color: "text-yellow-600",
    bgClass: "bg-yellow-500",
    ranklistUrl: "https://www.mercadolibre.com.mx/",
    ranklistLabel: "MercadoLibre 热销",
    description: "拉美最大电商 · 巴西墨西哥阿根廷",
    items: [
      { rank: 1, name: "手机钢化膜 iPhone", category: "手机配件", trend: "up", growth: "+48%", reason: "拉美智能手机普及快，保护配件刚需" },
      { rank: 2, name: "蓝牙耳机 无线入耳", category: "数码配件", trend: "up", growth: "+61%", reason: "年轻人消费主力，音乐娱乐刚需" },
      { rank: 3, name: "运动鞋 跑步休闲", category: "运动鞋服", trend: "up", growth: "+44%", reason: "拉美足球运动文化，运动品类强" },
      { rank: 4, name: "空气炸锅 家用", category: "厨房电器", trend: "up", growth: "+57%", reason: "拉美家庭烹饪文化强，厨电需求大" },
      { rank: 5, name: "儿童玩具 益智积木", category: "儿童玩具", trend: "up", growth: "+35%", reason: "拉美家庭儿童多，玩具礼品刚需" },
      { rank: 6, name: "美发工具 离子夹", category: "美发工具", trend: "up", growth: "+39%", reason: "拉美女性注重发型，美发工具热销" },
      { rank: 7, name: "手机充电宝 20000mAh", category: "数码配件", trend: "stable", growth: "+22%", reason: "电力基础设施不稳定地区刚需" },
      { rank: 8, name: "家用健身哑铃套装", category: "运动健身", trend: "up", growth: "+31%", reason: "居家健身风潮，拉美年轻人关注度高" },
    ],
  },
  {
    id: "noon",
    label: "Noon",
    emoji: "☀️",
    region: "中东",
    color: "text-yellow-600",
    bgClass: "bg-yellow-600",
    ranklistUrl: "https://www.noon.com/uae-en/",
    ranklistLabel: "Noon 热销榜",
    description: "中东本土电商 · 沙特阿联酋埃及",
    items: [
      { rank: 1, name: "香水 东方木质调", category: "香水美妆", trend: "up", growth: "+82%", reason: "中东香水文化极盛，高客单价市场" },
      { rank: 2, name: "斋月装饰灯 星月形", category: "节日装饰", trend: "up", growth: "+95%", reason: "斋月前爆发式增长，季节性极强" },
      { rank: 3, name: "祈祷毯 便携折叠", category: "宗教用品", trend: "up", growth: "+56%", reason: "穆斯林日常必需品，复购率极高" },
      { rank: 4, name: "阿拉伯咖啡壶 达拉", category: "餐饮用品", trend: "stable", growth: "+28%", reason: "阿拉伯传统咖啡文化，送礼高端品" },
      { rank: 5, name: "男士坎杜拉白袍", category: "传统服饰", trend: "stable", growth: "+22%", reason: "海湾地区男性日常服装，刚需" },
      { rank: 6, name: "黄金颜色首饰套装", category: "时尚饰品", trend: "up", growth: "+41%", reason: "中东女性对黄金饰品消费力极强" },
      { rank: 7, name: "车载香薰 木质香气", category: "汽车用品", trend: "up", growth: "+37%", reason: "中东驾车文化，香氛是车内必备" },
      { rank: 8, name: "空气净化器 家用", category: "家用电器", trend: "up", growth: "+44%", reason: "沙尘暴频发，空气净化需求强" },
    ],
  },
  {
    id: "flipkart",
    label: "Flipkart",
    emoji: "🇮🇳",
    region: "印度",
    color: "text-blue-600",
    bgClass: "bg-blue-600",
    ranklistUrl: "https://www.flipkart.com/",
    ranklistLabel: "Flipkart 热销榜",
    description: "印度最大电商 · 14亿人口市场",
    items: [
      { rank: 1, name: "智能手机 中低端", category: "手机数码", trend: "up", growth: "+71%", reason: "印度智能手机渗透率快速增长" },
      { rank: 2, name: "棉质库尔塔套装", category: "民族服饰", trend: "up", growth: "+48%", reason: "印度传统节日服装，婚礼季爆发" },
      { rank: 3, name: "电饭锅 压力锅", category: "厨房电器", trend: "stable", growth: "+26%", reason: "印度家庭煮饭刚需，米饭文化强" },
      { rank: 4, name: "瑜伽垫 防滑加厚", category: "运动健身", trend: "up", growth: "+55%", reason: "瑜伽发源地，年轻人健身意识强" },
      { rank: 5, name: "仿金首饰 婚礼款", category: "时尚饰品", trend: "up", growth: "+62%", reason: "婚礼市场巨大，仿金性价比高" },
      { rank: 6, name: "手机壳 印花图案", category: "手机配件", trend: "up", growth: "+39%", reason: "个性化需求强，换壳频率高" },
      { rank: 7, name: "吊扇 节能型", category: "家用电器", trend: "up", growth: "+44%", reason: "印度高温气候，吊扇是刚需" },
      { rank: 8, name: "香皂 草本天然", category: "个人护理", trend: "stable", growth: "+21%", reason: "阿育吠陀天然护理文化根深蒂固" },
    ],
  },
  {
    id: "temu",
    label: "Temu",
    emoji: "🟠",
    region: "欧美",
    color: "text-orange-600",
    bgClass: "bg-orange-500",
    ranklistUrl: "https://www.temu.com/",
    ranklistLabel: "Temu 热销榜",
    description: "拼多多出海 · 极致低价策略",
    items: [
      { rank: 1, name: "家居收纳盒套装", category: "家居收纳", trend: "up", growth: "+88%", reason: "极低定价吸引大众，走量惊人" },
      { rank: 2, name: "时尚饰品套装", category: "时尚饰品", trend: "up", growth: "+74%", reason: "低价快时尚，年轻女性冲动消费" },
      { rank: 3, name: "手机壳 透明防摔", category: "手机配件", trend: "up", growth: "+65%", reason: "超低价吸引用户，复购率高" },
      { rank: 4, name: "厨房小工具套装", category: "厨房用品", trend: "up", growth: "+57%", reason: "低价礼品，买来囤货送人两相宜" },
      { rank: 5, name: "园艺工具套装", category: "园艺户外", trend: "up", growth: "+44%", reason: "欧美庭院园艺热，价格优势明显" },
      { rank: 6, name: "宠物玩具套装", category: "宠物用品", trend: "up", growth: "+51%", reason: "宠物主人愿意低价尝试新玩具" },
      { rank: 7, name: "运动袜 多双装", category: "服饰配件", trend: "stable", growth: "+29%", reason: "高性价比日常消耗品，批量购买" },
      { rank: 8, name: "LED灯带 USB", category: "家居照明", trend: "up", growth: "+62%", reason: "布置氛围灯，低价让用户愿意尝试" },
    ],
  },
  {
    id: "wish",
    label: "Wish",
    emoji: "⭐",
    region: "欧美",
    color: "text-purple-600",
    bgClass: "bg-purple-600",
    ranklistUrl: "https://www.wish.com/",
    ranklistLabel: "Wish 热销榜",
    description: "欧美低价市场 · 冲动消费为主",
    items: [
      { rank: 1, name: "时尚印花T恤", category: "服装", trend: "stable", growth: "+18%", reason: "低价快时尚，Wish主要消费品类" },
      { rank: 2, name: "手机配件套装", category: "手机配件", trend: "up", growth: "+32%", reason: "低价多件，冲动购买率高" },
      { rank: 3, name: "创意家居小物", category: "家居生活", trend: "up", growth: "+27%", reason: "新奇特产品，低价让用户愿意尝试" },
      { rank: 4, name: "仿真植物盆栽", category: "家居装饰", trend: "up", growth: "+38%", reason: "免打理绿植，北美公寓装饰热门" },
      { rank: 5, name: "男士钱包 超薄", category: "皮具配件", trend: "stable", growth: "+15%", reason: "低价男性礼品，节日销量好" },
      { rank: 6, name: "彩色铅笔 专业套装", category: "艺术文具", trend: "up", growth: "+29%", reason: "成人涂色热，手绘艺术复兴" },
      { rank: 7, name: "LED文字灯 定制", category: "家居照明", trend: "up", growth: "+44%", reason: "网红氛围感装饰，TikTok带火" },
      { rank: 8, name: "健身弹力带套装", category: "运动健身", trend: "up", growth: "+35%", reason: "低价居家健身工具，入门门槛低" },
    ],
  },
];

// 平台分组（用于分类显示）
const REGION_GROUPS = [
  { label: "🌏 亚洲", ids: ["tiktok", "shopee", "lazada", "flipkart"] },
  { label: "🇷🇺 俄系", ids: ["ozon", "wildberries"] },
  { label: "🌎 欧美", ids: ["amazon", "ebay", "etsy", "walmart", "temu", "wish"] },
  { label: "🌍 中东/拉美", ids: ["aliexpress", "noon", "mercadolibre"] },
];

export function HotPage() {
  const [activePlatform, setActivePlatform] = useState("tiktok");
  const [copied, setCopied] = useState<string | null>(null);

  const platform = PLATFORMS.find(p => p.id === activePlatform)!;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const search1688 = (kw: string) => {
    window.open(`https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">全平台爆品榜单</h2>
        <p className="text-sm text-gray-500 mt-0.5">覆盖16个主流跨境平台 · 每周更新 · 点击商品直接搜1688货源</p>
      </div>

      {/* Platform Tabs by Region */}
      <div className="space-y-2 mb-4">
        {REGION_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs text-gray-400 font-medium mb-1.5">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.ids.map(id => {
                const p = PLATFORMS.find(pl => pl.id === id)!;
                return (
                  <button
                    key={id}
                    onClick={() => setActivePlatform(id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activePlatform === id
                        ? `${p.bgClass} text-white shadow-md`
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{p.emoji}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Platform Header */}
      <div className={`bg-white border-2 rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between`}
        style={{ borderColor: "transparent" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{platform.emoji}</span>
            <div>
              <span className={`text-base font-bold ${platform.color}`}>{platform.label}</span>
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{platform.region}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{platform.description}</p>
        </div>
        <a
          href={platform.ranklistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl ${platform.bgClass} text-white hover:opacity-90 transition-opacity flex-shrink-0 ml-3`}
        >
          <ExternalLink size={11} />
          查看完整榜单
        </a>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {platform.items.map(item => (
          <div key={item.rank} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gray-300 transition-colors">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              item.rank <= 3 ? `${platform.bgClass} text-white` : "bg-gray-100 text-gray-500"
            }`}>
              {item.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.reason}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-sm font-bold ${
                item.trend === "up" ? "text-green-600" : item.trend === "down" ? "text-red-500" : "text-gray-500"
              }`}>{item.growth}</span>
              {item.trend === "up" ? <TrendingUp size={13} className="text-green-500" /> :
               item.trend === "down" ? <TrendingDown size={13} className="text-red-400" /> :
               <Minus size={13} className="text-gray-400" />}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => copy(item.name)}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                {copied === item.name ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button onClick={() => search1688(item.name)}
                className="text-xs px-2.5 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap">
                搜1688
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 bg-gray-50 rounded-xl p-3 text-xs text-gray-400">
        📌 数据综合各平台公开热销趋势与行业分析，每周人工更新。点击「搜1688」直接找货源。
      </div>

      <AdBanner slot="hot-bottom" size="banner" className="mt-4" />
    </div>
  );
}
