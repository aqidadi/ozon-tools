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
      { rank: 9, name: "迷你美甲灯 UV固化", category: "美甲工具", trend: "up", growth: "+83%", reason: "居家美甲热潮，短视频展示效果惊艳" },
      { rank: 10, name: "折叠宠物外出包", category: "宠物用品", trend: "up", growth: "+76%", reason: "宠物出行刚需，视频里猫猫露头超萌" },
      { rank: 11, name: "双面珠绒洗脸毛巾", category: "个人护理", trend: "up", growth: "+59%", reason: "护肤博主推荐，柔软亲肤视觉质感好" },
      { rank: 12, name: "磁吸无线充电器 多合一", category: "手机配件", trend: "up", growth: "+64%", reason: "多设备同充，展示桌面整洁感强" },
      { rank: 13, name: "可拆洗懒人沙发", category: "家居家具", trend: "up", growth: "+47%", reason: "宿舍/小户型神器，拆洗方便口碑好" },
      { rank: 14, name: "发光溜冰鞋 儿童款", category: "儿童玩具", trend: "up", growth: "+91%", reason: "夜间溜冰视频超火，孩子主动要求买" },
      { rank: 15, name: "自动打泡器 奶泡机", category: "厨房用品", trend: "up", growth: "+55%", reason: "在家做咖啡系列视频爆火，带货直接" },
      { rank: 16, name: "迷你电风扇 颈戴式", category: "个人电器", trend: "up", growth: "+88%", reason: "夏日必备，出街佩戴视觉感强" },
      { rank: 17, name: "收纳分隔抽屉整理盒", category: "家居收纳", trend: "stable", growth: "+31%", reason: "整理控喜爱，before/after对比视频热" },
      { rank: 18, name: "艺术涂色填色书 成人款", category: "文创文具", trend: "up", growth: "+42%", reason: "解压内容受欢迎，过程展示吸睛" },
      { rank: 19, name: "美颜补光环形灯", category: "直播设备", trend: "up", growth: "+69%", reason: "创作者必备，带货逻辑自带传播" },
      { rank: 20, name: "智能感应垃圾桶", category: "家居生活", trend: "up", growth: "+38%", reason: "科技感家居演示视频高点赞" },
      { rank: 21, name: "冰淇淋机 家用小型", category: "厨房电器", trend: "up", growth: "+72%", reason: "夏日甜品DIY内容大热，食物展示诱人" },
      { rank: 22, name: "便携式榨汁杯 USB充电", category: "厨房电器", trend: "up", growth: "+65%", reason: "健康生活方式，随时随地榨汁视频流行" },
      { rank: 23, name: "弹力阻力带训练套装", category: "运动健身", trend: "up", growth: "+44%", reason: "健身挑战视频盛行，居家运动道具" },
      { rank: 24, name: "多功能气垫粉底液", category: "彩妆护肤", trend: "up", growth: "+57%", reason: "化妆变身视频必出，带货转化极快" },
      { rank: 25, name: "趣味创意马克杯", category: "餐饮用品", trend: "stable", growth: "+26%", reason: "变色杯/3D图案，展示效果惊喜感强" },
      { rank: 26, name: "网红泡泡浴弹 礼盒", category: "个人护理", trend: "up", growth: "+79%", reason: "入水变色炸弹，开箱体验内容超火" },
      { rank: 27, name: "悬浮地球仪 磁悬浮", category: "桌面摆件", trend: "up", growth: "+52%", reason: "科技感强，办公桌展示评论区热议" },
      { rank: 28, name: "防水运动手环 睡眠监测", category: "智能穿戴", trend: "up", growth: "+48%", reason: "健康追踪需求，数据对比内容吸引点击" },
      { rank: 29, name: "3D打印笔 创意绘画", category: "创意玩具", trend: "up", growth: "+61%", reason: "创作展示内容独特，适合亲子视频" },
      { rank: 30, name: "猫爪杯 玻璃款", category: "餐饮用品", trend: "up", growth: "+85%", reason: "颜值极高，萌系博主必出道具" },
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
      { rank: 9, name: "电动牙刷 声波款", category: "个人护理", trend: "up", growth: "+42%", reason: "俄罗斯口腔护理意识提升，礼品热选" },
      { rank: 10, name: "儿童益智拼图 100片", category: "儿童玩具", trend: "up", growth: "+36%", reason: "家长注重儿童早教，益智品类持续热销" },
      { rank: 11, name: "乳清蛋白粉 香草味", category: "运动营养", trend: "up", growth: "+51%", reason: "俄罗斯健身文化盛行，蛋白粉复购高" },
      { rank: 12, name: "折叠购物袋 可收纳", category: "生活用品", trend: "stable", growth: "+19%", reason: "环保意识提升，日常携带方便" },
      { rank: 13, name: "颈椎按摩仪 热敷款", category: "健康器械", trend: "up", growth: "+58%", reason: "久坐办公族增多，肩颈健康需求强" },
      { rank: 14, name: "家用空气加湿器", category: "家用电器", trend: "up", growth: "+44%", reason: "俄罗斯冬季室内干燥，加湿是刚需" },
      { rank: 15, name: "女士保暖羊毛袜", category: "服装配件", trend: "up", growth: "+39%", reason: "严寒气候下保暖配件全年需求稳定" },
      { rank: 16, name: "无线蓝牙音箱 防水", category: "数码配件", trend: "up", growth: "+33%", reason: "户外野餐聚会场景多，音质口碑好" },
      { rank: 17, name: "锅具套装 不粘涂层", category: "厨房用品", trend: "up", growth: "+28%", reason: "家庭烹饪频繁，品质锅具礼品需求大" },
      { rank: 18, name: "美白牙贴 快效型", category: "口腔护理", trend: "up", growth: "+47%", reason: "颜值经济带动，年轻人口腔美白需求高" },
      { rank: 19, name: "智能门锁 密码指纹", category: "家居安防", trend: "up", growth: "+55%", reason: "智能家居升级趋势，安全需求驱动" },
      { rank: 20, name: "车用吸尘器 无线", category: "汽车用品", trend: "up", growth: "+31%", reason: "俄罗斯汽车保有量高，车内清洁刚需" },
      { rank: 21, name: "婴儿安抚奶嘴 硅胶", category: "母婴用品", trend: "stable", growth: "+17%", reason: "俄罗斯出生率政策刺激，母婴品类稳定" },
      { rank: 22, name: "压缩收纳袋 旅行装", category: "旅行用品", trend: "up", growth: "+29%", reason: "节假日出行增多，行李压缩神器热销" },
      { rank: 23, name: "USB台灯 护眼款", category: "学习用品", trend: "up", growth: "+24%", reason: "学生居家学习增多，护眼灯需求持续" },
      { rank: 24, name: "电动剃须刀 便携款", category: "男士护理", trend: "up", growth: "+37%", reason: "男性个人护理意识增强，商务礼品热" },
      { rank: 25, name: "儿童书包 减负款", category: "儿童用品", trend: "up", growth: "+32%", reason: "家长重视儿童脊椎健康，开学季爆发" },
      { rank: 26, name: "厨房电子秤 精准型", category: "厨房用品", trend: "stable", growth: "+21%", reason: "烘焙爱好者增多，精准计量刚需" },
      { rank: 27, name: "美妆镜 带灯折叠", category: "美妆工具", trend: "up", growth: "+43%", reason: "旅行化妆场景需求，折叠便携受欢迎" },
      { rank: 28, name: "猫砂盆 封闭式防飞溅", category: "宠物用品", trend: "up", growth: "+38%", reason: "俄罗斯养猫家庭多，封闭款解决气味问题" },
      { rank: 29, name: "运动耳机 防汗骨传导", category: "数码配件", trend: "up", growth: "+46%", reason: "户外运动场景增多，骨传导安全感强" },
      { rank: 30, name: "磁力拼图 儿童3D", category: "儿童玩具", trend: "up", growth: "+53%", reason: "创意益智玩具，口碑传播带动亲子购买" },
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
      { rank: 9, name: "女士雪地靴 防滑底", category: "鞋类", trend: "up", growth: "+61%", reason: "俄罗斯漫长冬季，防滑保暖鞋刚需" },
      { rank: 10, name: "儿童羽绒服 轻薄款", category: "童装", trend: "up", growth: "+54%", reason: "冬季防寒必备，父母重视儿童保暖" },
      { rank: 11, name: "健身运动文胸 高强度", category: "运动内衣", trend: "up", growth: "+48%", reason: "WB健身用品品类快速增长，女性需求强" },
      { rank: 12, name: "男士夹克外套 防风", category: "男装", trend: "up", growth: "+43%", reason: "春秋换季必备，俄罗斯气候变化大" },
      { rank: 13, name: "女士风衣 中长款", category: "女装", trend: "up", growth: "+57%", reason: "时尚外套需求强，WB服装主力品类" },
      { rank: 14, name: "儿童运动鞋 透气款", category: "童鞋", trend: "up", growth: "+39%", reason: "儿童运动需求，家长注重质量" },
      { rank: 15, name: "瑜伽裤 高腰提臀", category: "运动服饰", trend: "up", growth: "+66%", reason: "健身打卡文化，瑜伽裤全天候穿着" },
      { rank: 16, name: "围巾 羊毛混纺", category: "服饰配件", trend: "up", growth: "+35%", reason: "俄罗斯严寒，围巾保暖配件全年需求稳" },
      { rank: 17, name: "乳液 身体保湿 大容量", category: "护肤品", trend: "stable", growth: "+23%", reason: "干燥气候下身体保湿是日常刚需" },
      { rank: 18, name: "男士运动套装 跑步款", category: "运动服饰", trend: "up", growth: "+41%", reason: "健身运动流行，男性运动套装走量大" },
      { rank: 19, name: "女士真丝睡衣 性感款", category: "内衣睡衣", trend: "up", growth: "+49%", reason: "WB女性消费力强，轻奢睡衣受欢迎" },
      { rank: 20, name: "男孩套装 字母印花", category: "童装", trend: "stable", growth: "+26%", reason: "父母为儿童季节性购买，批量刚需" },
      { rank: 21, name: "厚底老爹鞋 女款", category: "鞋类", trend: "up", growth: "+72%", reason: "流行时尚趋势，年轻女性追捧" },
      { rank: 22, name: "护肤面膜 补水款", category: "护肤品", trend: "up", growth: "+31%", reason: "俄罗斯女性护肤意识强，面膜高频使用" },
      { rank: 23, name: "腰带 编织款女士", category: "服饰配件", trend: "stable", growth: "+18%", reason: "穿搭细节配件，复购频率稳定" },
      { rank: 24, name: "防臭运动袜 多双装", category: "袜类", trend: "up", growth: "+28%", reason: "运动人群消耗品，批量购买性价比高" },
      { rank: 25, name: "休闲针织开衫 女款", category: "女装", trend: "up", growth: "+44%", reason: "春秋过渡季热销，WB服装榜单常客" },
      { rank: 26, name: "沙滩拖鞋 软底防滑", category: "鞋类", trend: "up", growth: "+33%", reason: "夏季休闲必备，轻便舒适价格亲民" },
      { rank: 27, name: "发箍 珍珠蝴蝶结", category: "发饰配件", trend: "up", growth: "+55%", reason: "韩系美妆风潮，女性发饰细分热门" },
      { rank: 28, name: "男士商务皮带", category: "男士配件", trend: "stable", growth: "+20%", reason: "职场男性刚需，节日礼品常见选择" },
      { rank: 29, name: "儿童泳衣 防晒款", category: "童装", trend: "up", growth: "+47%", reason: "夏季儿童游泳需求，家长优先选防晒款" },
      { rank: 30, name: "女士皮革手提包", category: "包袋配件", trend: "up", growth: "+38%", reason: "WB包袋品类增速快，女性礼品首选" },
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
      { rank: 9, name: "美白身体乳 烟酰胺", category: "护肤品", trend: "up", growth: "+76%", reason: "东南亚全身美白刚需，身体乳比面霜更大众" },
      { rank: 10, name: "睡眠眼罩 遮光款", category: "个人用品", trend: "up", growth: "+43%", reason: "午休文化盛行，东南亚上班族刚需" },
      { rank: 11, name: "祛痘精华 水杨酸", category: "功效护肤", trend: "up", growth: "+69%", reason: "热带气候易出油长痘，祛痘产品需求旺" },
      { rank: 12, name: "防水手机壳 透明", category: "手机配件", trend: "up", growth: "+52%", reason: "多雨气候，防水保护刚需且价格敏感" },
      { rank: 13, name: "香茅驱蚊喷雾", category: "个人护理", trend: "up", growth: "+81%", reason: "热带蚊虫多，天然成分受妈妈群体追捧" },
      { rank: 14, name: "乳胶枕 泰国产", category: "寝具用品", trend: "up", growth: "+47%", reason: "泰国乳胶品牌信任度高，睡眠质量刚需" },
      { rank: 15, name: "多功能蒸汽拖把", category: "家用电器", trend: "up", growth: "+38%", reason: "东南亚家庭注重地板清洁，蒸汽杀菌受欢迎" },
      { rank: 16, name: "珍珠颈链 韩系", category: "时尚饰品", trend: "up", growth: "+59%", reason: "K-Beauty风靡东南亚，韩系饰品跟风消费" },
      { rank: 17, name: "即食燕窝饮品", category: "保健食品", trend: "up", growth: "+64%", reason: "东南亚女性美容滋补文化，即食燕窝热销" },
      { rank: 18, name: "便携宠物饮水器", category: "宠物用品", trend: "up", growth: "+35%", reason: "东南亚宠物经济崛起，外出遛宠物需求增" },
      { rank: 19, name: "泡沫洁面仪 硅胶刷头", category: "美容工具", trend: "up", growth: "+44%", reason: "护肤清洁步骤意识提升，入门价格友好" },
      { rank: 20, name: "缓震跑步鞋 轻量", category: "运动鞋服", trend: "up", growth: "+41%", reason: "东南亚马拉松跑步运动热，运动鞋需求大" },
      { rank: 21, name: "家用空气净化器 小型", category: "家用电器", trend: "up", growth: "+53%", reason: "东南亚季节性雾霾+灰尘，空气质量需求强" },
      { rank: 22, name: "调味料礼盒套装", category: "食品调料", trend: "stable", growth: "+22%", reason: "东南亚美食文化丰富，调味礼盒送礼节日热" },
      { rank: 23, name: "儿童防晒衣 UPF50+", category: "童装", trend: "up", growth: "+88%", reason: "家长防晒意识强，儿童户外活动多" },
      { rank: 24, name: "桌面小风扇 可充电", category: "家用电器", trend: "up", growth: "+71%", reason: "热带高温全年需求，办公室桌面小风扇刚需" },
      { rank: 25, name: "斑马纹发圈 韩系", category: "发饰配件", trend: "up", growth: "+49%", reason: "K-pop粉丝效仿风潮，低价高频更换" },
      { rank: 26, name: "益生菌 肠胃调节", category: "保健品", trend: "up", growth: "+37%", reason: "健康意识觉醒，肠胃调节需求东南亚新兴" },
      { rank: 27, name: "平价口红 持妆款", category: "彩妆", trend: "up", growth: "+62%", reason: "东南亚彩妆市场快速扩张，价格敏感带动量" },
      { rank: 28, name: "折叠雨伞 防晒防雨", category: "出行用品", trend: "up", growth: "+33%", reason: "热带多雨+烈日，晴雨两用刚需" },
      { rank: 29, name: "磁吸手机支架 桌面", category: "手机配件", trend: "stable", growth: "+24%", reason: "居家工作场景增多，手机立架刚需" },
      { rank: 30, name: "精华油 护发素 发尾油", category: "美发护理", trend: "up", growth: "+56%", reason: "东南亚高温潮湿损发，护发精油需求旺盛" },
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
      { rank: 9, name: "电动按摩枪 肌肉放松", category: "健康器械", trend: "up", growth: "+67%", reason: "运动恢复意识提升，家用按摩器需求旺" },
      { rank: 10, name: "水果保鲜盒 分格", category: "厨房用品", trend: "up", growth: "+44%", reason: "健康饮食习惯养成，保鲜收纳刚需" },
      { rank: 11, name: "儿童电动牙刷 计时款", category: "儿童护理", trend: "up", growth: "+56%", reason: "东南亚父母重视儿童口腔健康，电动刷受推崇" },
      { rank: 12, name: "无线耳机 主动降噪", category: "数码配件", trend: "up", growth: "+72%", reason: "通勤必备，价格亲民且音质媲美大品牌" },
      { rank: 13, name: "洗碗机 台式小型", category: "厨房电器", trend: "up", growth: "+88%", reason: "东南亚中产家庭生活升级，解放双手理念接受度高" },
      { rank: 14, name: "智能体重秤 体脂检测", category: "健康器械", trend: "up", growth: "+41%", reason: "健康管理意识强，蓝牙连APP数据化受欢迎" },
      { rank: 15, name: "便携式投影仪 1080P", category: "数码电子", trend: "up", growth: "+55%", reason: "家庭影院需求，比电视更灵活适合小户型" },
      { rank: 16, name: "婴儿辅食机 料理棒", category: "母婴用品", trend: "up", growth: "+48%", reason: "东南亚年轻父母增多，辅食精细化意识提升" },
      { rank: 17, name: "电动自行车 折叠款", category: "出行工具", trend: "up", growth: "+63%", reason: "城市通勤最后一公里，东南亚拥堵严重刚需" },
      { rank: 18, name: "家用豆浆机 多功能", category: "厨房电器", trend: "stable", growth: "+27%", reason: "东南亚豆制品饮食文化，健康早餐机需求稳" },
      { rank: 19, name: "护肤仪 射频提拉", category: "美容仪器", trend: "up", growth: "+59%", reason: "医美平替趋势，居家抗衰仪器快速增长" },
      { rank: 20, name: "多功能剃毛器 修眉刀", category: "个人护理", trend: "up", growth: "+38%", reason: "精致仪容需求，女性修眉剃毛场景多" },
      { rank: 21, name: "家用跑步机 静音款", category: "运动健身", trend: "up", growth: "+52%", reason: "公寓健身场景，静音款解决噪音投诉问题" },
      { rank: 22, name: "点读笔 儿童学习", category: "教育电子", trend: "up", growth: "+43%", reason: "东南亚教育投资意愿强，点读辅助学习热销" },
      { rank: 23, name: "厨师机 多功能揉面", category: "厨房电器", trend: "up", growth: "+35%", reason: "烘焙热潮持续，东南亚家庭厨房电器升级" },
      { rank: 24, name: "美容冰点脱毛仪", category: "美容仪器", trend: "up", growth: "+77%", reason: "去沙龙成本高，居家脱毛仪性价比突出" },
      { rank: 25, name: "扫地机器人 自动回充", category: "家用电器", trend: "up", growth: "+66%", reason: "生活升级刚需，东南亚中产家庭接受度快速提升" },
      { rank: 26, name: "USB集线器 多口扩展", category: "电脑配件", trend: "stable", growth: "+29%", reason: "居家办公标配，笔记本接口不足场景普遍" },
      { rank: 27, name: "猫粮 天然无谷配方", category: "宠物用品", trend: "up", growth: "+44%", reason: "宠物主人健康意识提升，优质猫粮复购率高" },
      { rank: 28, name: "电动开窗机 智能遥控", category: "智能家居", trend: "up", growth: "+39%", reason: "东南亚炎热通风需求，智能家居概念普及" },
      { rank: 29, name: "卷发棒 多温段自动", category: "美发工具", trend: "up", growth: "+51%", reason: "女性造型需求，自动卷发省时省力受欢迎" },
      { rank: 30, name: "家用净水器 直饮款", category: "家用电器", trend: "up", growth: "+57%", reason: "东南亚饮用水质量顾虑，净水器需求持续增长" },
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
      { rank: 9, name: "厨房精准秤 数字显示", category: "厨房用品", trend: "up", growth: "+37%", reason: "美国烘焙文化盛行，精准计量刚需" },
      { rank: 10, name: "汽车手机支架 出风口", category: "汽车用品", trend: "up", growth: "+44%", reason: "美国高驾车率，手机导航支架全民刚需" },
      { rank: 11, name: "降噪耳机 头戴式", category: "数码配件", trend: "up", growth: "+59%", reason: "远程工作会议标配，音质口碑口耳相传" },
      { rank: 12, name: "狗狗训练零食 低卡", category: "宠物用品", trend: "up", growth: "+48%", reason: "美国宠物主人投入极高，训练零食高频复购" },
      { rank: 13, name: "可折叠行李箱 20寸", category: "旅行用品", trend: "up", growth: "+41%", reason: "旅游复苏，轻量可折叠创新设计受欢迎" },
      { rank: 14, name: "瑜伽拉伸带 棉质", category: "运动健身", trend: "up", growth: "+32%", reason: "居家伸展锻炼，低价入门健身装备走量大" },
      { rank: 15, name: "桌面有线耳机 USB-C", category: "办公配件", trend: "stable", growth: "+24%", reason: "居家办公视频会议标配，高清音效刚需" },
      { rank: 16, name: "不锈钢餐盒 分格保温", category: "餐饮用品", trend: "up", growth: "+38%", reason: "外带午餐健康饮食趋势，环保无塑受推崇" },
      { rank: 17, name: "登山徒步背包 30L", category: "户外运动", trend: "up", growth: "+53%", reason: "美国户外运动文化根深，春夏备货旺" },
      { rank: 18, name: "婴儿监控摄像头 无线", category: "母婴用品", trend: "up", growth: "+45%", reason: "父母安全意识高，远程监控婴儿刚需" },
      { rank: 19, name: "电动螺丝刀套装", category: "工具五金", trend: "up", growth: "+31%", reason: "美国DIY文化强，家庭修缮工具高频需求" },
      { rank: 20, name: "益生菌胶囊 高效型", category: "保健品", trend: "up", growth: "+62%", reason: "美国保健品市场成熟，肠道健康意识强" },
      { rank: 21, name: "睡眠耳机 超薄蓝牙", category: "数码配件", trend: "up", growth: "+71%", reason: "失眠人群大，睡眠辅助产品创新受欢迎" },
      { rank: 22, name: "防晒口罩 UPF50+", category: "户外防护", trend: "up", growth: "+43%", reason: "户外运动防晒意识提升，功能型口罩兴起" },
      { rank: 23, name: "厨房垃圾桶 感应式", category: "家居生活", trend: "stable", growth: "+26%", reason: "厨房科技化趋势，感应翻盖方便卫生" },
      { rank: 24, name: "冰球狗粮喂食玩具", category: "宠物用品", trend: "up", growth: "+55%", reason: "益智喂食概念走红，狗主人愿意为互动买单" },
      { rank: 25, name: "USB充电多口插座", category: "家居电器", trend: "up", growth: "+39%", reason: "多设备家庭充电需求，多口设计实用刚需" },
      { rank: 26, name: "羊毛毡圆球挂饰", category: "家居装饰", trend: "up", growth: "+28%", reason: "Etsy溢出效应，亚马逊手工风装饰品热销" },
      { rank: 27, name: "办公室植物肥料 液体", category: "园艺绿植", trend: "stable", growth: "+19%", reason: "居家绿植热潮，配套养护产品复购高" },
      { rank: 28, name: "运动水壶 吸管杯盖款", category: "运动用品", trend: "up", growth: "+46%", reason: "日常健身用水追踪，水壶持续走量" },
      { rank: 29, name: "多功能厨房剪刀 可拆洗", category: "厨房用品", trend: "up", growth: "+34%", reason: "美国家庭厨房必备工具，礼品市场热门" },
      { rank: 30, name: "遛狗伸缩牵引绳 自动锁", category: "宠物用品", trend: "up", growth: "+41%", reason: "美国养狗家庭极多，优质牵引绳高评分畅销" },
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
      { rank: 9, name: "绝版香水 停产款", category: "香水", trend: "up", growth: "+79%", reason: "香水收藏热，eBay是绝版香水唯一出口" },
      { rank: 10, name: "老式黑胶唱片 70-90年代", category: "音乐收藏", trend: "up", growth: "+65%", reason: "复古音乐热潮，黑胶文艺圈持续扩大" },
      { rank: 11, name: "漫威限定版手办", category: "手办玩具", trend: "up", growth: "+58%", reason: "超英IP全球持续，限定版保值率高" },
      { rank: 12, name: "复古Polaroid相机", category: "摄影器材", trend: "up", growth: "+44%", reason: "胶片摄影回潮，年轻人追求复古质感" },
      { rank: 13, name: "限量版球鞋 AJ/Nike SB", category: "运动鞋", trend: "up", growth: "+93%", reason: "球鞋文化与投资属性并重，eBay主要转售平台" },
      { rank: 14, name: "古董瓷器 仿英国骨瓷", category: "古董收藏", trend: "stable", growth: "+27%", reason: "欧美古董文化根深，传家宝类产品稳定需求" },
      { rank: 15, name: "电脑主机 DIY配件", category: "电脑配件", trend: "up", growth: "+36%", reason: "DIY电脑文化盛行，二手显卡CPU交易活跃" },
      { rank: 16, name: "铁皮玩具 复古汽车", category: "复古玩具", trend: "up", growth: "+48%", reason: "收藏品市场，铁皮玩具升值预期强" },
      { rank: 17, name: "日本动漫周边 二手", category: "动漫周边", trend: "up", growth: "+71%", reason: "海外动漫粉丝通过eBay收购国内版二手品" },
      { rank: 18, name: "豪华钢笔 限定款", category: "文具收藏", trend: "up", growth: "+39%", reason: "书写工具复兴，高端钢笔收藏市场稳定" },
      { rank: 19, name: "任天堂Switch游戏卡", category: "游戏周边", trend: "up", growth: "+52%", reason: "实体游戏卡收藏热，稀有版本溢价高" },
      { rank: 20, name: "复古帆布板鞋 Converse", category: "复古鞋服", trend: "stable", growth: "+29%", reason: "经典款持续热销，eBay有特殊配色" },
      { rank: 21, name: "银币 纪念银章 收藏", category: "贵金属收藏", trend: "up", growth: "+44%", reason: "实物资产避险需求，银币收藏入门门槛低" },
      { rank: 22, name: "旧版苹果产品 Mac SE", category: "复古数码", trend: "up", growth: "+61%", reason: "苹果复古收藏热，老版Mac有装置艺术价值" },
      { rank: 23, name: "战锤模型 未涂装", category: "模型收藏", trend: "up", growth: "+55%", reason: "欧美桌游文化盛行，战锤模型玩家基数大" },
      { rank: 24, name: "奥特曼怪兽卡牌 日本原版", category: "卡牌收藏", trend: "up", growth: "+67%", reason: "亚洲IP在欧美走红，eBay是海外购渠道" },
      { rank: 25, name: "复古徽章 军事纪念章", category: "军事收藏", trend: "stable", growth: "+21%", reason: "欧美军事收藏文化悠久，军迷群体稳定" },
      { rank: 26, name: "赛车模型 1:18比例", category: "模型收藏", trend: "up", growth: "+38%", reason: "F1热度持续攀升，车模收藏需求快速增长" },
      { rank: 27, name: "宝可梦卡牌 日版闪卡", category: "卡牌收藏", trend: "up", growth: "+82%", reason: "宝可梦IP持续全球热，日版闪卡投资价值高" },
      { rank: 28, name: "二手相机镜头 胶片时代", category: "摄影收藏", trend: "up", growth: "+47%", reason: "胶片摄影复古风，老镜头成色优价格有吸引力" },
      { rank: 29, name: "摔角WWE摔跤手玩偶", category: "体育收藏", trend: "stable", growth: "+24%", reason: "WWE粉丝群体忠实，摔跤手玩偶长期稳定需求" },
      { rank: 30, name: "古着牛仔夹克 Levi's", category: "复古服饰", trend: "up", growth: "+57%", reason: "真实年代古着比新款有特殊质感，溢价合理" },
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
      { rank: 9, name: "手工皮革钱包 定制烫印", category: "皮具配件", trend: "up", growth: "+69%", reason: "个性礼品溢价高，真皮质感打动欧美买家" },
      { rank: 10, name: "星座主题首饰 手绘款", category: "个性化饰品", trend: "up", growth: "+55%", reason: "Z世代星座文化热，定制专属感强" },
      { rank: 11, name: "木质手工相框 婚礼款", category: "家居装饰", trend: "up", growth: "+42%", reason: "婚礼纪念场景需求，定制刻字服务溢价" },
      { rank: 12, name: "有机棉婴儿服 礼盒", category: "母婴用品", trend: "up", growth: "+73%", reason: "欧美新生儿礼品文化，有机棉环保概念吸引" },
      { rank: 13, name: "手绘水彩贺卡 定制", category: "文具礼品", trend: "up", growth: "+47%", reason: "真实手作感打动收件人，与印刷品差异化" },
      { rank: 14, name: "蜡封印章 套装", category: "文具工艺", trend: "up", growth: "+61%", reason: "复古书信风潮，拆信仪式感极强受追捧" },
      { rank: 15, name: "植物押花 相框装饰画", category: "手工装饰", trend: "up", growth: "+38%", reason: "自然系美学流行，植物工艺品独特质感强" },
      { rank: 16, name: "手工肥皂 精油香氛款", category: "个人护理", trend: "up", growth: "+54%", reason: "天然成分护肤需求，手工肥皂礼品化趋势强" },
      { rank: 17, name: "毛毡羊毛画 北欧风", category: "家居装饰", trend: "up", growth: "+33%", reason: "北欧极简风家居装饰需求，手作温度感强" },
      { rank: 18, name: "定制玻璃杯 激光雕刻", category: "餐饮礼品", trend: "up", growth: "+48%", reason: "婚礼伴手礼场景，定制刻字礼品需求大" },
      { rank: 19, name: "手工编绳壁挂 波西米亚", category: "家居装饰", trend: "up", growth: "+59%", reason: "波西米亚风家居流行，手编壁挂独特风格" },
      { rank: 20, name: "复古地图海报 城市主题", category: "家居装饰", trend: "stable", growth: "+26%", reason: "旅行纪念与家居融合，特定城市地图有情感价值" },
      { rank: 21, name: "树脂工艺摆件 定制星系", category: "桌面摆件", trend: "up", growth: "+67%", reason: "树脂艺术品独特视觉，定制星系概念新颖" },
      { rank: 22, name: "布艺玩偶 宝宝安抚玩具", category: "手工玩具", trend: "up", growth: "+41%", reason: "安全有机材料受家长信任，礼品场景需求旺" },
      { rank: 23, name: "黑板漆木质留言板", category: "家居装饰", trend: "stable", growth: "+22%", reason: "家庭留言场景，厨房客厅装饰功能结合" },
      { rank: 24, name: "手工粘土人偶 宠物肖像", category: "手工艺品", trend: "up", growth: "+85%", reason: "宠物主人情感需求，粘土肖像是高溢价礼品" },
      { rank: 25, name: "植物标本书签 套装", category: "文具礼品", trend: "up", growth: "+36%", reason: "自然美学与阅读文化结合，礼品书签受欢迎" },
      { rank: 26, name: "手工木质棋盘游戏", category: "桌游礼品", trend: "up", growth: "+44%", reason: "家庭桌游文化复兴，手工木质感增加礼品价值" },
      { rank: 27, name: "铜制金属书签 刻字款", category: "文具收藏", trend: "stable", growth: "+29%", reason: "精致小礼品，阅读爱好者节日互赠热门" },
      { rank: 28, name: "染色蜡染挂毯 手工", category: "家居纺织", trend: "up", growth: "+51%", reason: "艺术感家居装饰，独特配色不可复制" },
      { rank: 29, name: "定制字母首字母项链", category: "个性化饰品", trend: "up", growth: "+63%", reason: "姓名首字母饰品全球热，Etsy主力销售品" },
      { rank: 30, name: "石膏扩香瓶 手工彩绘", category: "家居香氛", trend: "up", growth: "+47%", reason: "手工彩绘唯一性强，香氛场景情感价值高" },
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
      { rank: 9, name: "儿童自行车 12-20寸", category: "儿童玩具", trend: "up", growth: "+43%", reason: "美国家庭户外运动文化，儿童节礼物热选" },
      { rank: 10, name: "洗衣液 大容量家庭装", category: "清洁用品", trend: "stable", growth: "+16%", reason: "家庭消耗品刚需，大包装性价比高" },
      { rank: 11, name: "免安装婴儿门栏 安全门", category: "母婴安全", trend: "up", growth: "+38%", reason: "新手父母安全意识强，免工具安装方便受欢迎" },
      { rank: 12, name: "狗粮 大品牌家庭装", category: "宠物食品", trend: "stable", growth: "+21%", reason: "美国宠物家庭多，Walmart价格优势明显" },
      { rank: 13, name: "汽车应急启动电源", category: "汽车用品", trend: "up", growth: "+47%", reason: "美国家庭人手一车，应急电源安全刚需" },
      { rank: 14, name: "储粮桶 密封粮食储存", category: "食品储存", trend: "up", growth: "+29%", reason: "大包装储粮习惯，Walmart大量家庭客群" },
      { rank: 15, name: "电热毯 双人款", category: "家居寝具", trend: "up", growth: "+52%", reason: "冬季保暖刚需，美国家庭面积大暖气不均" },
      { rank: 16, name: "运动鞋 男女通用款", category: "运动鞋服", trend: "up", growth: "+33%", reason: "Walmart价格亲民，运动鞋日常走量大" },
      { rank: 17, name: "手持蒸汽熨斗", category: "家用电器", trend: "up", growth: "+27%", reason: "快速熨烫衣物需求，不用熨板更便捷" },
      { rank: 18, name: "密封保鲜盒套装 玻璃", category: "厨房收纳", trend: "up", growth: "+31%", reason: "健康储食意识，玻璃材质无BPA受欢迎" },
      { rank: 19, name: "儿童水彩颜料套装", category: "儿童教育", trend: "stable", growth: "+24%", reason: "家长重视儿童艺术教育，开学季走量大" },
      { rank: 20, name: "吸尘器 无线立式", category: "家用电器", trend: "up", growth: "+45%", reason: "美国大房型家庭，无线吸尘器灵活使用" },
      { rank: 21, name: "男士剃须刀 电动", category: "个人护理", trend: "up", growth: "+28%", reason: "男士日常护理刚需，Walmart价格优势显著" },
      { rank: 22, name: "多功能充电站 无线", category: "家居电器", trend: "up", growth: "+56%", reason: "多设备家庭统一管理充电，桌面整洁需求" },
      { rank: 23, name: "冬季手套 触屏款", category: "服饰配件", trend: "up", growth: "+39%", reason: "冬季刚需，触屏不摘手套使用手机创新点" },
      { rank: 24, name: "学生双肩书包 减负", category: "学习用品", trend: "up", growth: "+34%", reason: "开学季采购，Walmart是美国大众家庭首选" },
      { rank: 25, name: "婴幼儿辅食套装 勺碗", category: "母婴用品", trend: "stable", growth: "+18%", reason: "新手父母必备，食品级硅胶安全材质受信赖" },
      { rank: 26, name: "草坪洒水喷头 旋转", category: "园艺工具", trend: "up", growth: "+41%", reason: "美国郊区独立屋庭院浇灌刚需" },
      { rank: 27, name: "多层厨房收纳架 可调", category: "厨房收纳", trend: "up", growth: "+25%", reason: "厨房整理热，Walmart客群注重实用性价比" },
      { rank: 28, name: "卫浴地垫套装 防滑", category: "卫浴用品", trend: "stable", growth: "+19%", reason: "家居装修刚需，套装购买性价比高" },
      { rank: 29, name: "网球拍 初学者套装", category: "运动健身", trend: "up", growth: "+37%", reason: "网球运动普及，Walmart提供入门性价比选择" },
      { rank: 30, name: "延长线插排 6位USB", category: "家居电器", trend: "up", growth: "+44%", reason: "多设备家庭电源需求，安全防过载设计受欢迎" },
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
      { rank: 9, name: "发热护膝 电热暖贴", category: "健康器械", trend: "up", growth: "+55%", reason: "中东老年群体关节痛，保暖护具刚需" },
      { rank: 10, name: "椰枣礼盒 精品装", category: "食品礼品", trend: "up", growth: "+47%", reason: "中东传统美食，斋月节日礼品高频需求" },
      { rank: 11, name: "家用监控摄像头 无线", category: "家居安防", trend: "up", growth: "+38%", reason: "中东家庭安防意识强，远程查看需求高" },
      { rank: 12, name: "摩洛哥风格装饰灯", category: "家居装饰", trend: "up", growth: "+62%", reason: "北非中东审美风格，镂空灯笼高人气" },
      { rank: 13, name: "男士皮革腰带", category: "男士配件", trend: "up", growth: "+33%", reason: "中东男性注重仪容，皮带是日常配件刚需" },
      { rank: 14, name: "电动剃须刀 往复式", category: "男士护理", trend: "up", growth: "+29%", reason: "中东男性胡须打理需求，速卖通性价比优势" },
      { rank: 15, name: "手机快充头 65W GaN", category: "手机配件", trend: "up", growth: "+58%", reason: "多设备快充需求，GaN技术性价比高" },
      { rank: 16, name: "蕾丝上衣 西班牙风", category: "女装", trend: "up", growth: "+44%", reason: "北非法语区欧洲时尚影响，蕾丝风格受欢迎" },
      { rank: 17, name: "儿童沙滩玩具 套装", category: "儿童玩具", trend: "up", growth: "+36%", reason: "中东沙漠+海滩旅游场景，儿童玩具节假日热" },
      { rank: 18, name: "美白牙粉 木炭款", category: "口腔护理", trend: "up", growth: "+49%", reason: "速卖通价格优势，口腔美白全球需求旺" },
      { rank: 19, name: "多肉植物 种植套装", category: "园艺绿植", trend: "stable", growth: "+21%", reason: "中东室内绿植需求，耐旱植物最适合" },
      { rank: 20, name: "渔网户外折叠椅", category: "户外家具", trend: "up", growth: "+33%", reason: "户外聚会文化，便携折叠椅价格亲民易走量" },
      { rank: 21, name: "健身手套 防滑护腕", category: "运动健身", trend: "up", growth: "+42%", reason: "中东年轻人健身房文化兴起，健身配件需求增" },
      { rank: 22, name: "电子血压计 臂式", category: "健康器械", trend: "up", growth: "+51%", reason: "中老年健康监测需求，非洲家庭保健意识提升" },
      { rank: 23, name: "骆驼皮革钱包 手工", category: "皮具礼品", trend: "stable", growth: "+25%", reason: "中东特色工艺品，旅游纪念品市场稳定" },
      { rank: 24, name: "食品保温袋 大容量", category: "餐饮用品", trend: "up", growth: "+37%", reason: "斋月送餐文化，保温外卖袋需求强烈" },
      { rank: 25, name: "LED路灯 太阳能充电", category: "户外照明", trend: "up", growth: "+66%", reason: "非洲农村电力不稳，太阳能路灯扶贫项目带动" },
      { rank: 26, name: "指甲油套装 持久款", category: "美妆用品", trend: "up", growth: "+39%", reason: "中东女性美甲文化，网购美妆品快速增长" },
      { rank: 27, name: "行车记录仪 前后双镜头", category: "汽车电子", trend: "up", growth: "+43%", reason: "中东交通事故多，行车记录仪保险索赔需求强" },
      { rank: 28, name: "面包机 家用全自动", category: "厨房电器", trend: "up", growth: "+31%", reason: "面包是非洲主食，家用烘焙省钱受欢迎" },
      { rank: 29, name: "隐形眼镜 彩色美瞳", category: "眼部护理", trend: "up", growth: "+72%", reason: "中东女性戴美瞳改变眼色风潮，需求爆发" },
      { rank: 30, name: "宠物自动喂食器 定时", category: "宠物用品", trend: "up", growth: "+28%", reason: "中东宠物主人生活节奏快，自动喂食解决不在家问题" },
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
      { rank: 9, name: "汽车脚垫 全包围", category: "汽车用品", trend: "up", growth: "+45%", reason: "拉美汽车保有量快增，车内装饰改装刚需" },
      { rank: 10, name: "巴西BBQ烤肉架 便携", category: "户外烧烤", trend: "up", growth: "+68%", reason: "巴西烤肉文化，家庭户外烧烤刚需" },
      { rank: 11, name: "足球装备套装 儿童", category: "运动器材", trend: "up", growth: "+73%", reason: "拉美足球文化根深，儿童足球从小培养" },
      { rank: 12, name: "防晒霜 高倍数SPF60+", category: "防晒护肤", trend: "up", growth: "+57%", reason: "拉美紫外线强，户外工作者防晒刚需旺盛" },
      { rank: 13, name: "面部精华 玻尿酸", category: "护肤品", trend: "up", growth: "+44%", reason: "拉美护肤意识提升，年轻女性成分党崛起" },
      { rank: 14, name: "电动摩托头盔 全盔", category: "出行安全", trend: "up", growth: "+39%", reason: "摩托车是拉美主要交通工具，安全头盔刚需" },
      { rank: 15, name: "气炸锅 多功能款", category: "厨房电器", trend: "up", growth: "+61%", reason: "拉美烹饪文化强，气炸代替油炸健康趋势" },
      { rank: 16, name: "USB充电宝 快充", category: "数码配件", trend: "up", growth: "+36%", reason: "拉美停电风险高，备用电源是日常刚需" },
      { rank: 17, name: "婴儿尿布 超薄透气", category: "母婴用品", trend: "stable", growth: "+22%", reason: "拉美出生率高，婴儿消耗品复购率极高" },
      { rank: 18, name: "无线游戏手柄 PC兼容", category: "游戏配件", trend: "up", growth: "+52%", reason: "拉美年轻游戏玩家快速增长，游戏文化盛行" },
      { rank: 19, name: "美甲工具套装 UV灯", category: "美甲工具", trend: "up", growth: "+49%", reason: "拉美女性爱美甲，居家美甲省去沙龙费用" },
      { rank: 20, name: "绿茶面膜 补水款", category: "护肤品", trend: "up", growth: "+33%", reason: "亚洲护肤品在拉美受欢迎，天然成分信赖度高" },
      { rank: 21, name: "保温午餐盒 不锈钢", category: "餐饮用品", trend: "up", growth: "+28%", reason: "带饭省钱习惯，拉美热食文化需要保温" },
      { rank: 22, name: "打印机 家用喷墨", category: "办公设备", trend: "up", growth: "+41%", reason: "学生打印需求，教育证件材料频繁需要打印" },
      { rank: 23, name: "碎纸机 家用桌面", category: "办公用品", trend: "stable", growth: "+19%", reason: "个人信息安全意识提升，家庭文件销毁需求" },
      { rank: 24, name: "除湿机 家用", category: "家用电器", trend: "up", growth: "+55%", reason: "拉美热带地区潮湿，防霉除湿需求强" },
      { rank: 25, name: "街舞服装 宽松嘻哈风", category: "运动服饰", trend: "up", growth: "+47%", reason: "拉美舞蹈文化盛行，街舞嘻哈服装年轻人追捧" },
      { rank: 26, name: "咖啡豆研磨机 手摇", category: "厨房用品", trend: "up", growth: "+38%", reason: "拉美咖啡生产大国，本地咖啡文化消费升级" },
      { rank: 27, name: "化妆镜 带灯台式", category: "美妆工具", trend: "up", growth: "+43%", reason: "拉美女性重视妆容，专业灯光补光需求强" },
      { rank: 28, name: "帆布袋 环保购物袋", category: "日常用品", trend: "stable", growth: "+24%", reason: "拉美环保限塑令推行，帆布袋日常化使用" },
      { rank: 29, name: "网球鞋 专业款", category: "运动鞋服", trend: "up", growth: "+37%", reason: "网球运动在拉美中产兴起，装备需求随之增长" },
      { rank: 30, name: "洗发水 无硅油修复款", category: "护发产品", trend: "up", growth: "+51%", reason: "拉美多卷发受损发，无硅油修护理念快速渗透" },
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
      { rank: 9, name: "斋月礼品篮 坚果精品", category: "食品礼品", trend: "up", growth: "+78%", reason: "斋月互赠礼品文化极盛，精品坚果礼盒高端市场" },
      { rank: 10, name: "阿拉伯大衣 女士黑袍", category: "传统服饰", trend: "stable", growth: "+24%", reason: "海湾女性日常着装需求，款式和质量是核心" },
      { rank: 11, name: "手持真空封口机", category: "厨房用品", trend: "up", growth: "+39%", reason: "中东家庭食物储存需求，延长保质期刚需" },
      { rank: 12, name: "阿拉伯男士头巾 白色", category: "传统服饰", trend: "stable", growth: "+21%", reason: "海湾国家男性传统头饰，宗教和文化刚需" },
      { rank: 13, name: "沙漠玫瑰精油 纯天然", category: "香氛美容", trend: "up", growth: "+58%", reason: "中东自然香氛文化，纯天然精油高端消费品" },
      { rank: 14, name: "乌德琴 阿拉伯弦乐", category: "乐器", trend: "up", growth: "+33%", reason: "阿拉伯音乐文化传承，乌德琴学习需求上涨" },
      { rank: 15, name: "羊绒毯子 轻奢礼品", category: "家居纺织", trend: "up", growth: "+46%", reason: "中东礼品文化注重品质，羊绒制品是高端礼品" },
      { rank: 16, name: "儿童阿拉伯传统服装", category: "童装", trend: "up", growth: "+52%", reason: "节日盛装需求，孩子穿传统服装拍照晒图风潮" },
      { rank: 17, name: "金色茶具套装 阿拉伯风", category: "餐饮用品", trend: "up", growth: "+41%", reason: "中东茶文化，金色装饰茶具送礼场景广泛" },
      { rank: 18, name: "跑步机 家用静音", category: "运动健身", trend: "up", growth: "+63%", reason: "沙漠高温户外不友好，居家跑步机是刚需" },
      { rank: 19, name: "摩洛哥皮革手袋 柏柏尔", category: "包袋", trend: "up", growth: "+37%", reason: "中东北非手工艺品需求，传统工艺受欢迎" },
      { rank: 20, name: "阿拉伯乌德香薰木片", category: "传统香氛", trend: "up", growth: "+66%", reason: "阿拉伯乌德木香文化独特，熏香是传统仪式" },
      { rank: 21, name: "椰枣苦味阿拉伯咖啡豆", category: "咖啡食品", trend: "stable", growth: "+28%", reason: "传统阿拉伯咖啡豆，搭配椰枣是待客之道" },
      { rank: 22, name: "智能门铃 摄像头款", category: "家居安防", trend: "up", growth: "+48%", reason: "中东安全意识，访客视频门铃快速普及" },
      { rank: 23, name: "游泳圈 儿童充气", category: "水上玩具", trend: "up", growth: "+55%", reason: "阿联酋沙特泳池文化，儿童水上安全用品热" },
      { rank: 24, name: "沙滩包 大容量防水", category: "出行用品", trend: "up", growth: "+42%", reason: "海湾国家海滩度假文化，大容量防水包刚需" },
      { rank: 25, name: "阿拉伯大壶 铜制装饰", category: "家居装饰", trend: "stable", growth: "+23%", reason: "传统装饰器物，中东家居装饰常见礼品" },
      { rank: 26, name: "防沙布 面部遮阳巾", category: "户外防护", trend: "up", growth: "+36%", reason: "沙漠地区沙尘防护刚需，户外必备装备" },
      { rank: 27, name: "花露水 驱蚊清凉款", category: "个人护理", trend: "up", growth: "+31%", reason: "中东埃及夏季蚊虫多，清凉花露水全家使用" },
      { rank: 28, name: "指环刀 厨房去皮刀", category: "厨房工具", trend: "up", growth: "+27%", reason: "中东家庭烹饪多蔬果处理，便捷厨房小工具走量" },
      { rank: 29, name: "祈祷时间闹钟 数字显示", category: "宗教用品", trend: "up", growth: "+61%", reason: "穆斯林五次礼拜时间提醒，宗教日常刚需" },
      { rank: 30, name: "家用净水滤芯 替换装", category: "家用耗材", trend: "stable", growth: "+25%", reason: "中东自来水水质问题，净水器滤芯高频复购" },
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
      { rank: 9, name: "防晒霜 SPF50+ 印度品牌", category: "防晒护肤", trend: "up", growth: "+66%", reason: "印度强紫外线，防晒意识快速提升" },
      { rank: 10, name: "棉质萨里 喜庆印花", category: "民族服饰", trend: "up", growth: "+54%", reason: "印度节日婚礼刚需，传统萨里文化长盛不衰" },
      { rank: 11, name: "耳机 TWS 入耳无线", category: "数码配件", trend: "up", growth: "+77%", reason: "印度年轻人音乐电影娱乐刚需，性价比驱动" },
      { rank: 12, name: "印度香料礼盒 家庭装", category: "食品调料", trend: "stable", growth: "+23%", reason: "印度烹饪文化，香料是厨房核心消耗品" },
      { rank: 13, name: "草本护发油 椰子油", category: "护发产品", trend: "up", growth: "+45%", reason: "印度传统椰子油护发文化，天然成分受信赖" },
      { rank: 14, name: "健身蛋白棒 零食款", category: "运动营养", trend: "up", growth: "+58%", reason: "健身文化兴起，印度年轻人蛋白质意识提升" },
      { rank: 15, name: "压力锅 哨子型 印度版", category: "厨房电器", trend: "stable", growth: "+19%", reason: "印度烹饪必需品，豆类菜肴常用压力烹饪" },
      { rank: 16, name: "门帘 彩色印花布艺", category: "家居装饰", trend: "up", growth: "+36%", reason: "印度家居装饰审美，彩色门帘传统风格" },
      { rank: 17, name: "婚礼对戒 黄铜镀金", category: "婚礼饰品", trend: "up", growth: "+62%", reason: "印度婚礼市场巨大，对戒礼品需求全年稳定" },
      { rank: 18, name: "血糖检测仪 家用", category: "健康器械", trend: "up", growth: "+51%", reason: "印度糖尿病发病率高，居家监测刚需强烈" },
      { rank: 19, name: "LED灯串 彩灯节日款", category: "节日装饰", trend: "up", growth: "+88%", reason: "印度排灯节彩灯装饰文化，节前爆发式增长" },
      { rank: 20, name: "竹制厨具套装 环保", category: "厨房用品", trend: "up", growth: "+33%", reason: "印度环保意识提升，竹制可持续产品认可度高" },
      { rank: 21, name: "瑜伽服 弹力高腰裤", category: "运动服饰", trend: "up", growth: "+59%", reason: "印度瑜伽发源地，年轻女性瑜伽热潮" },
      { rank: 22, name: "印度奶茶粉 马萨拉茶", category: "饮品食品", trend: "stable", growth: "+25%", reason: "印度茶文化刚需，线上购买方便价格实惠" },
      { rank: 23, name: "汽摩头盔 认证安全款", category: "出行安全", trend: "up", growth: "+42%", reason: "印度两轮车文化，交通安全法规推动头盔需求" },
      { rank: 24, name: "沐浴盐 玫瑰花瓣款", category: "沐浴护肤", trend: "up", growth: "+38%", reason: "印度沐浴仪式文化，芳香沐浴产品日常化" },
      { rank: 25, name: "校服定制 棉质套装", category: "童装", trend: "stable", growth: "+21%", reason: "印度学校众多，开学季校服批量采购刚需" },
      { rank: 26, name: "冰沙机 搅拌机 家用", category: "厨房电器", trend: "up", growth: "+44%", reason: "印度高温气候，冷饮奶昔制作家庭刚需" },
      { rank: 27, name: "嘿那膏 天然凉粉", category: "传统美容", trend: "up", growth: "+37%", reason: "印度传统美发护肤品，婚礼喜庆场合常用" },
      { rank: 28, name: "无线门铃 太阳能", category: "家居安防", trend: "up", growth: "+31%", reason: "印度家庭访客频繁，无线门铃安装便利" },
      { rank: 29, name: "羽毛球拍套装 碳素", category: "运动器材", trend: "up", growth: "+48%", reason: "羽毛球是印度国民运动，性价比套装走量大" },
      { rank: 30, name: "布兜拖鞋 室内防滑", category: "鞋类", trend: "stable", growth: "+17%", reason: "印度室内脱鞋文化，舒适家居拖鞋刚需稳定" },
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
