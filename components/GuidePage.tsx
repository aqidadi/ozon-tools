"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Store, TrendingUp, Package, Truck, Star, ExternalLink } from "lucide-react";

const GUIDES = [
  {
    id: "open-store",
    icon: <Store size={20} />,
    title: "如何在 Ozon 开店",
    color: "blue",
    sections: [
      {
        title: "注册前准备",
        content: [
          "需要一个俄罗斯法人实体（ООО）或个体工商户（ИП），或以外国法人身份入驻",
          "国内卖家通常以「境外法人」身份注册，需要提供公司营业执照（中英文）",
          "准备好银行账户（支持人民币结算，Ozon 会用 SWIFT 打款）",
          "建议先注册速卖通账号熟悉流程，再开 Ozon",
        ],
      },
      {
        title: "注册步骤",
        content: [
          "1. 访问 seller.ozon.ru，点击「Стать продавцом」（成为卖家）",
          "2. 填写公司基本信息、法人代表信息",
          "3. 上传营业执照、法人身份证（需公证翻译件）",
          "4. 等待审核（通常 1-3 个工作日）",
          "5. 审核通过后设置仓储方式（FBO/FBS/RFBS）",
          "6. 充值广告预算，上架第一批商品",
        ],
      },
      {
        title: "仓储模式选择",
        content: [
          "FBO（Ozon仓储）：发货到 Ozon 俄罗斯仓，Ozon 负责配送，适合爆款大批量",
          "FBS（卖家仓储）：商品放自己或第三方仓，Ozon 下单后你发货，适合新品测款",
          "RFBS（跨境直发）：从中国直接发货到买家，时效 7-30 天，适合初期",
          "建议新手先用 RFBS 跨境直发，测试市场后再备货到俄仓",
        ],
      },
      {
        title: "平台费用",
        content: [
          "佣金：按类目收取，一般 4%-15%，玩具类约 8-12%",
          "配送费：FBO 模式下 Ozon 收取物流费，按重量计费",
          "仓储费：FBO 模式超期仓储会额外收费",
          "广告费：竞价广告，建议预算不低于销售额的 10%",
        ],
      },
    ],
    links: [
      { text: "Ozon 卖家注册入口", url: "https://seller.ozon.ru" },
      { text: "Ozon 费用计算器", url: "https://seller.ozon.ru/app/calculators" },
    ],
  },
  {
    id: "product-selection",
    icon: <TrendingUp size={20} />,
    title: "如何选品",
    color: "green",
    sections: [
      {
        title: "选品核心原则",
        content: [
          "体积小、重量轻（跨境运费按重量，500g 以内最优）",
          "客单价 500-2000 卢布（约 35-150 元），利润空间大",
          "非易碎、非危险品（避免液体、电池、气雾剂）",
          "有独特性，不要和大卖家拼价格",
          "俄罗斯本地不容易买到的中国特色商品",
        ],
      },
      {
        title: "找爆品的方法",
        content: [
          "看 Ozon 热销榜：ozon.ru/bestsellers 按类目查看销量榜",
          "分析竞品：找到热销商品，看他们的月销量、评价数、价格",
          "用本工具：从 Ozon 热销页抓商品 → 翻译成中文 → 在 1688 找货源",
          "参考速卖通爆款：速卖通上卖得好的商品，在 Ozon 大概率也有需求",
          "看搜索热词：Ozon 搜索框下拉联想词就是用户真实需求",
          "关注中国节日/动漫新番时机：新番上映前备周边货",
        ],
      },
      {
        title: "利润计算公式",
        content: [
          "最低利润售价（卢布）= （进价 + 运费 + 包装费）× 汇率 ÷ （1 - 平台佣金率）",
          "例：进价 ¥5，重量 300g，运费 ¥0.025/g = ¥7.5，包装 ¥2，汇率 1:10",
          "成本合计 = 5 + 7.5 + 2 = ¥14.5",
          "最低售价 = 14.5 × 10 ÷ 0.88 ≈ 165 卢布（佣金12%）",
          "建议售价至少是最低售价的 1.5 倍，留出广告和退货空间",
        ],
      },
      {
        title: "哪些类目好做",
        content: [
          "✅ 动漫周边（手办、公仔、亚克力摆件）— 俄罗斯年轻人热爱动漫",
          "✅ 儿童玩具（毛绒、积木、盲盒）— 需求稳定，客单价适中",
          "✅ 生活小物（收纳、厨具）— 复购率高",
          "✅ 美妆工具（化妆刷、美容仪）— 女性市场大",
          "❌ 电子产品 — 认证复杂，售后麻烦",
          "❌ 食品 — 海关检验严格",
          "❌ 纺织服装 — 尺码问题，退货率高",
        ],
      },
    ],
    links: [
      { text: "Ozon 热销榜", url: "https://www.ozon.ru/bestsellers/" },
    ],
  },
  {
    id: "listing",
    icon: <Package size={20} />,
    title: "如何上架爆品",
    color: "purple",
    sections: [
      {
        title: "标题优化",
        content: [
          "标题格式：[类目关键词] + [核心卖点] + [规格/材质] + [适用人群]",
          "例：Фигурка Наруто — аниме статуэтка ПВХ 20см коллекционная（火影鸣人手办20cm）",
          "前60个字符最重要（搜索结果显示的长度）",
          "包含俄语买家常搜的词汇，可以借助 Google 翻译验证",
          "不要堆砌关键词，Ozon 会降权",
        ],
      },
      {
        title: "主图要求",
        content: [
          "尺寸：至少 1000×1000 像素，建议 1500×1500",
          "白底或浅色背景，商品占图片面积 75% 以上",
          "不能有文字水印（Ozon 规定）",
          "多图：主图 + 细节图 + 场景图 + 尺寸图，至少 5 张",
          "用 1688 商家提供的图即可，但要去掉中文水印",
        ],
      },
      {
        title: "定价策略",
        content: [
          "参考竞品价格，定在中间偏高位置（不要最便宜）",
          "新品期可以定低价冲销量，积累评价后再涨价",
          "设置促销价格（比原价低 10-20%），显示划线价，吸引点击",
          "参与 Ozon 官方活动（双11等），需提前报名",
        ],
      },
      {
        title: "商品描述",
        content: [
          "用俄语写，可用 DeepL 或本工具翻译后人工校对",
          "重点：材质、尺寸、包装内容物、适用年龄（玩具必填）",
          "加入买家常见问题的回答",
          "避免夸大宣传（Ozon 有打假机制）",
        ],
      },
    ],
    links: [
      { text: "Ozon 商品上架规范", url: "https://seller.ozon.ru/docs/" },
    ],
  },
  {
    id: "operations",
    icon: <Star size={20} />,
    title: "运营技巧",
    color: "orange",
    sections: [
      {
        title: "新品期策略",
        content: [
          "上架后前7天是新品期，Ozon 会给流量扶持",
          "新品期内要快速积累评价（可请朋友购买后留评）",
          "开启「Трафаретная реклама」（展示广告）提升曝光",
          "价格设低一点，冲销量排名",
          "每天关注数据：点击率、转化率、加购率",
        ],
      },
      {
        title: "广告投放",
        content: [
          "Ozon 主要广告类型：搜索广告、展示广告、品牌广告",
          "新手建议先开「搜索广告」，按点击付费，预算 100-300 卢布/天起",
          "设置目标关键词：商品名、类目词、竞品名",
          "广告 ACoS（广告费/销售额）建议控制在 15-25%",
          "每周分析广告数据，关掉不出单的关键词",
        ],
      },
      {
        title: "评价管理",
        content: [
          "及时回复差评，态度诚恳，说明解决方案",
          "差评太多会影响搜索排名，差评率超过 10% 需重视",
          "可以在包裹里放小卡片，引导买家留好评（不违规）",
          "好评率 4.5 分以上为良好，低于 4.0 需要整改",
        ],
      },
      {
        title: "参与平台活动",
        content: [
          "Ozon 有大量官方促销活动，参与可获得额外流量",
          "主要活动：双11（11月）、新年（12月/1月）、情人节、妇女节（3月8日）",
          "提前 2-4 周报名，需要设置活动价格",
          "俄罗斯妇女节（3月8日）是全年最大购物节之一，比双11还重要",
        ],
      },
    ],
    links: [],
  },
  {
    id: "logistics",
    icon: <Truck size={20} />,
    title: "物流与发货",
    color: "teal",
    sections: [
      {
        title: "跨境直发（RFBS）",
        content: [
          "适合新手测品，无需提前备货",
          "下单后从中国发货，时效 15-35 天",
          "常用物流渠道：云途、燕文、广东联邑等小包渠道",
          "追踪号必须上传到 Ozon 系统，否则视为未发货",
          "运费约 0.02-0.04 元/克，500g 以内约 10-20 元",
        ],
      },
      {
        title: "备货到俄仓（FBS/FBO）",
        content: [
          "适合已验证的爆款，降低时效影响买家体验",
          "可走海运（30-45天，便宜）或空运（7-15天，贵）",
          "头程物流公司：菜鸟国际、递四方、出口易等",
          "俄罗斯清关：需要提供商品价值申报，低报有风险",
          "备货到 Ozon 仓后由 Ozon 负责最后一公里配送",
        ],
      },
      {
        title: "打包要求",
        content: [
          "每件商品需要贴 Ozon 条形码标签（在卖家后台生成）",
          "易碎品需要加气泡膜保护",
          "包装尺寸影响 Ozon 仓储费，尽量紧凑",
          "跨境直发建议用气泡袋或硬纸盒，防止运输途中损坏",
        ],
      },
      {
        title: "退货处理",
        content: [
          "Ozon 允许买家在收货后 30 天内无理由退货",
          "退货率高的商品会被降权，需要注意商品质量和描述准确性",
          "退回的商品 Ozon 会检验，合格的可以重新入库销售",
          "跨境直发的退货费用由卖家承担，成本较高",
        ],
      },
    ],
    links: [],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", badge: "bg-green-100 text-green-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", icon: "text-teal-600", badge: "bg-teal-100 text-teal-700" },
};

export function GuidePage() {
  const [openGuide, setOpenGuide] = useState<string | null>("open-store");
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Ozon 新手入门指南</h2>
        </div>
        <p className="text-sm text-gray-500">从零开始做 Ozon 跨境电商，系统学习开店、选品、运营全流程</p>
      </div>

      <div className="space-y-3">
        {GUIDES.map((guide) => {
          const colors = COLOR_MAP[guide.color];
          const isOpen = openGuide === guide.id;

          return (
            <div key={guide.id} className={`border rounded-xl overflow-hidden ${isOpen ? colors.border : "border-gray-200"}`}>
              {/* Guide header */}
              <button
                onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${isOpen ? colors.bg : "bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={colors.icon}>{guide.icon}</span>
                  <span className="font-semibold text-gray-900">{guide.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {guide.sections.length} 个模块
                  </span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              </button>

              {/* Guide content */}
              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {guide.sections.map((section) => {
                    const sectionKey = `${guide.id}-${section.title}`;
                    const sectionOpen = openSection === sectionKey;
                    return (
                      <div key={section.title}>
                        <button
                          onClick={() => setOpenSection(sectionOpen ? null : sectionKey)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-800">{section.title}</span>
                          {sectionOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                        </button>
                        {sectionOpen && (
                          <ul className="px-4 pb-4 space-y-2">
                            {section.content.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-gray-300 mt-0.5 flex-shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  {/* Links */}
                  {guide.links.length > 0 && (
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {guide.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${colors.badge} hover:opacity-80 transition-opacity`}
                        >
                          <ExternalLink size={11} />
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-indigo-800 mb-1">🚀 快速开始</p>
        <p className="text-sm text-indigo-700">
          建议流程：注册账号 → 用「选品参考」找到热销类目 → 在 1688 找货源 → 用本工具计算利润 → 上架第一批商品 → 积累评价后开广告
        </p>
      </div>
    </div>
  );
}
