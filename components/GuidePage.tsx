"use client";

import { useState } from "react";
import { AdBanner } from "@/components/AdBanner";
import {
  ChevronDown, ChevronRight, BookOpen, Store, TrendingUp,
  Package, Truck, Star, ExternalLink, Wrench, Globe, BarChart2, ShoppingCart,
  MessageCircle, Loader2, Send
} from "lucide-react";

// ── FAQ 智能问答组件 ──────────────────────────────────────────
function FAQBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const QUICK_QUESTIONS = [
    "怎么设置运费？",
    "新手卖什么最好？",
    "Ozon怎么注册开店？",
    "怎么定价不亏钱？",
    "图片怎么处理？",
    "货代怎么选？",
  ];

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAnswer(data.answer || "暂时无法回答，请查看下方指南。");
    } catch {
      setAnswer("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center gap-2">
        <MessageCircle size={16} className="text-white" />
        <span className="text-white font-semibold text-sm">AI 智能答疑</span>
        <span className="text-white/60 text-xs ml-1">· 有任何问题直接问</span>
      </div>

      {/* 快捷问题 */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => { setQuestion(q); ask(q); }}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors border border-indigo-100">
            {q}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && ask(question)}
            placeholder="输入你的问题，比如：Ozon佣金怎么算？"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={() => ask(question)} disabled={loading || !question.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* 回答 */}
      {(loading || answer) && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              AI正在思考...
            </div>
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</div>
          )}
        </div>
      )}
    </div>
  );
}

const GUIDES = [
  {
    id: "platforms",
    icon: <Globe size={20} />,
    title: "主流跨境平台对比选择",
    color: "blue",
    sections: [
      {
        title: "各平台核心特点",
        content: [
          "🛒 Ozon（俄罗斯）：月活5000万+，竞争小，中国卖家少，溢价高，新手首选",
          "📦 亚马逊：全球最大，流量大但竞争极激烈，入门门槛高，需要品牌备案",
          "🎵 TikTok Shop：视频带货新风口，东南亚+美国市场，内容驱动，爆单快但不稳定",
          "🌟 Shopee（虾皮）：东南亚+台湾，中小卖家友好，物流便宜，竞争日趋激烈",
          "🛍️ Lazada：东南亚，阿里旗下，和Shopee互补，马来西亚/泰国市场强",
          "⚡ 速卖通（AliExpress）：全球覆盖，适合库存清货，单价低竞争大",
          "🇧🇷 Mercado Libre：拉美第一电商，巴西/墨西哥市场，增长快，竞争少",
        ],
      },
      {
        title: "新手最推荐的平台路线",
        content: [
          "路线A（稳健）：Ozon起步 → 站稳后扩Shopee → 再考虑亚马逊",
          "路线B（内容型）：TikTok Shop起步（会拍视频的人）→ 再开独立站",
          "路线C（大众）：速卖通起步（门槛最低）→ 积累经验后迁移Ozon/Shopee",
          "❌ 不建议：一开始就多平台同时做，精力分散，哪个都做不好",
          "✅ 建议：先把一个平台跑通，月销100单以上再考虑第二个平台",
        ],
      },
      {
        title: "平台费用对比",
        content: [
          "Ozon：佣金4-15%，无月租，跨境直发无仓储费",
          "亚马逊：月租$39.99（专业版），佣金8-15%，FBA仓储费另计",
          "TikTok Shop：佣金2-8%（新手期优惠），无月租",
          "Shopee：佣金2-6%，无月租，部分市场有交易服务费",
          "Lazada：佣金2-4%，无月租，但物流费由平台控制",
          "速卖通：佣金5-8%，无月租，旺季流量费另计",
        ],
      },
      {
        title: "目标市场消费习惯",
        content: [
          "俄罗斯：喜欢动漫/二次元，节日购物力强（妇女节3月8日最大），价格敏感但认质量",
          "东南亚：价格极敏感，喜欢凑满减，直播带货渗透率高，退货率低",
          "美国（亚马逊/TikTok）：品质要求高，售后严格，一旦信任建立复购率高",
          "拉美（Mercado）：价格敏感，物流期望低，市场增长快，竞争最少",
          "欧洲（速卖通欧洲站）：环保意识强，认证要求多（CE/RoHS），利润高",
        ],
      },
    ],
    links: [
      { text: "Ozon 卖家入口", url: "https://seller.ozon.ru" },
      { text: "亚马逊卖家中心", url: "https://sellercentral.amazon.com" },
      { text: "TikTok Shop 卖家", url: "https://seller.tiktok.com" },
      { text: "Shopee 卖家中心", url: "https://seller.shopee.cn" },
      { text: "Lazada 卖家中心", url: "https://sellercenter.lazada.com" },
      { text: "速卖通卖家中心", url: "https://sell.aliexpress.com" },
    ],
  },
  {
    id: "open-store",
    icon: <Store size={20} />,
    title: "开店流程（各平台）",
    color: "green",
    sections: [
      {
        title: "Ozon 开店步骤",
        content: [
          "1. 访问 seller.ozon.ru，选「境外法人」身份注册",
          "2. 上传营业执照（需英文翻译）+ 法人身份证",
          "3. 填写银行账户（支持中国外币账户SWIFT收款）",
          "4. 审核1-5个工作日，通过后选仓储模式",
          "5. 新手选 RFBS（跨境直发），不需要提前备货",
          "6. 上架商品（外语标题必须），开搜索广告，开始跑单",
          "推荐收款：PingPong、连连支付（Ozon官方推荐）",
        ],
      },
      {
        title: "亚马逊开店步骤",
        content: [
          "1. 注册亚马逊卖家账号（需要信用卡+银行账户+身份证）",
          "2. 选择站点：美国站/欧洲站/日本站（新手推荐美国站）",
          "3. 品牌备案（Brand Registry）：有商标可以做，无商标先卖跟卖",
          "4. 发货方式：FBA（亚马逊仓储）或 FBM（自发货）",
          "5. 新手建议先FBM测款，爆款再转FBA",
          "注意：亚马逊对账号关联极敏感，一台电脑只登一个账号",
          "推荐收款：Payoneer、WorldFirst万里汇",
        ],
      },
      {
        title: "TikTok Shop 开店步骤",
        content: [
          "1. 访问 seller.tiktok.com，用手机号注册",
          "2. 选择销售地区（美国/英国/东南亚各国）",
          "3. 上传营业执照 + 法人身份证",
          "4. 审核通过后，连接TikTok账号（必须有TikTok账号）",
          "5. 上传商品，可以自己拍视频带货，或找达人合作",
          "6. 参与「联盟计划」：让达人帮你带货，按销售分佣",
          "关键：内容质量决定成败，产品要上镜，视觉要好",
        ],
      },
      {
        title: "Shopee 开店步骤",
        content: [
          "1. 访问 seller.shopee.cn（中国卖家专属入口）",
          "2. 用手机号注册，填写基本信息",
          "3. 选择销售市场（新手推荐马来西亚/泰国/菲律宾）",
          "4. 上传商品，图片和描述可以用中文，系统自动翻译",
          "5. 选择物流：虾皮官方物流（SLS）最方便，新手必选",
          "6. 开店初期参与「新手礼包」活动，获取平台流量扶持",
          "推荐收款：连连支付、PingPong",
        ],
      },
    ],
    links: [
      { text: "Ozon 费用计算器", url: "https://seller.ozon.ru/app/calculators" },
      { text: "亚马逊FBA费用计算", url: "https://sellercentral.amazon.com/hz/fba/profitabilitycalculator" },
      { text: "Shopee 新手指南", url: "https://seller.shopee.cn/edu/home" },
    ],
  },
  {
    id: "product-selection",
    icon: <TrendingUp size={20} />,
    title: "选品策略（全平台通用）",
    color: "purple",
    sections: [
      {
        title: "选品黄金标准",
        content: [
          "重量 ≤ 500g（跨境运费最经济，超重利润大幅压缩）",
          "体积小，最好不超过 30×20×10cm",
          "进价 ¥3-50，售价是进价的3-8倍（毛利率目标≥50%）",
          "非易碎、非液体、非危险品（避免破损和海关麻烦）",
          "目标市场不容易买到，或比本地便宜50%以上",
          "有复购需求或可延伸品类（做成系列，提升客单价）",
          "无强烈季节性（或提前1-2个月布局季节性商品）",
        ],
      },
      {
        title: "各平台爆品特点",
        content: [
          "Ozon爆品：动漫周边/棉花娃娃/儿童玩具/家居小物",
          "亚马逊爆品：创意家居/户外用品/宠物用品/美妆工具（单价$15-50）",
          "TikTok爆品：视觉冲击强的商品，美妆/家居/厨具/新奇小物（爆品无规律）",
          "Shopee爆品：价格极低的日用品/时尚配件/手机配件（单价$2-15）",
          "通用规律：在一个平台卖得好的商品，其他平台也值得试",
        ],
      },
      {
        title: "找爆品的方法",
        content: [
          "方法1：看平台热销榜 — Ozon/亚马逊/Shopee都有Best Sellers榜",
          "方法2：速卖通反推 — 速卖通月销1000+商品，其他平台大概率也有需求",
          "方法3：TikTok选品 — 刷TikTok/抖音，看什么商品视频点赞10万+",
          "方法4：1688销量榜 — 月销>10000的商品，研究能否跨境",
          "方法5：竞品店铺分析 — 找到爆款卖家，看他的其他商品",
          "方法6：Google Trends — 查搜索趋势，提前布局上升品类",
          "方法7：用本工具 — 从Ozon抓热销→中文翻译→1688找货",
        ],
      },
      {
        title: "俄罗斯选品节日日历",
        content: [
          "🎄 1月1日：新年 — 12月备货，装饰/礼盒/玩具",
          "💙 2月14日：情人节 — 毛绒/首饰/香薰",
          "🪖 2月23日：祖国保卫者日（男人节）— 男性礼品",
          "🌺 3月8日：妇女节 ⭐全年最重要 — 2月备货，美妆/鲜花/首饰",
          "🐣 4月：复活节 — 装饰/礼篮",
          "🌟 6月1日：儿童节 — 玩具/文具",
          "🎁 12月：圣诞+新年 — 全年销量最高，12月是平时2-3倍",
        ],
      },
      {
        title: "东南亚选品节日日历",
        content: [
          "🧧 1-2月：春节 — 东南亚华人多，红包袋/年货/装饰",
          "❤️ 2月14日：情人节 — 全平台大促",
          "🌙 3-4月：斋月（Ramadan）— 马来/印尼必备，礼品/服饰",
          "👧 5月：母亲节 — 美妆/首饰/家居礼品",
          "🛒 6月18日：618 — Shopee/Lazada跟进做大促",
          "🎉 9月9日/10月10日/11月11日：连续大促季",
          "🎄 12月：圣诞 — 东南亚基督徒多，装饰/礼品",
        ],
      },
    ],
    links: [
      { text: "Ozon 热销榜", url: "https://www.ozon.ru/bestsellers/" },
      { text: "亚马逊 Best Sellers", url: "https://www.amazon.com/Best-Sellers/zgbs" },
      { text: "Google Trends", url: "https://trends.google.com" },
      { text: "1688 热销排行", url: "https://www.1688.com" },
    ],
  },
  {
    id: "listing",
    icon: <Package size={20} />,
    title: "商品上架与标题优化",
    color: "orange",
    sections: [
      {
        title: "标题写法（各平台）",
        content: [
          "通用格式：[品类关键词] + [核心卖点] + [规格/材质] + [适用人群]",
          "Ozon（俄语标题示例）：Мягкая игрушка кот 40см антистресс подушка — 猫咪抱枕40cm",
          "亚马逊（英语）：Anime Figure Naruto PVC 15cm Collectible Action Figure Toy",
          "TikTok/Shopee：简短直白，突出价格优势和卖点，「超可爱」「爆款」「限时」",
          "翻译工具：DeepL（欧洲/俄语最准）、ChatGPT（优化表达）、本工具（批量翻译）",
          "关键词来源：在目标平台搜索框输入品类，看下拉联想词就是真实搜索词",
        ],
      },
      {
        title: "主图要求",
        content: [
          "Ozon：白底图，商品占75%以上，最低1000×1000px，不能有中文水印",
          "亚马逊：纯白背景，主图无文字，最低1000px（建议2000px），JPEG格式",
          "TikTok Shop：可以有场景图，视频封面图更重要，要视觉冲击感",
          "Shopee/Lazada：可以有产品文字说明，场景图+白底图各1-2张",
          "通用：至少5张图（主图+细节+尺寸+场景+包装），提升转化率30%+",
          "工具：Canva做设计，Remove.bg抠图，Watermarkremover去水印",
        ],
      },
      {
        title: "定价策略",
        content: [
          "成本计算：进价 + 运费（克数×运费率）+ 包装费 = 总成本",
          "最低售价：总成本(元) × 汇率 ÷ (1 - 佣金率)",
          "建议售价：最低售价 × 1.5倍（留广告和退货空间）",
          "新品期：定低价冲销量，积累评价后逐步涨价",
          "尾数定价：999/199/49.9比整数转化率高",
          "亚马逊：参考竞品定价，比头部竞品低5-10%，比尾部高10%",
          "Shopee：价格战激烈，建议薄利多销+凑单满减策略",
        ],
      },
    ],
    links: [
      { text: "DeepL 翻译", url: "https://www.deepl.com" },
      { text: "Canva 设计工具", url: "https://www.canva.com" },
      { text: "Remove.bg 抠图", url: "https://www.remove.bg" },
      { text: "Watermarkremover 去水印", url: "https://watermarkremover.io" },
    ],
  },
  {
    id: "operations",
    icon: <Star size={20} />,
    title: "运营技巧（各平台）",
    color: "teal",
    sections: [
      {
        title: "Ozon 运营要点",
        content: [
          "新品期14天：开搜索广告（100-200外币/天），快速积累评价",
          "广告ACoS目标15-25%：超过说明选词或定价有问题",
          "评分必须4.5+：差评率超10%会被限流",
          "参与平台活动：妇女节/新年大促，提前2周报名",
          "RFBS模式：下单后5天内发货，超时取消订单扣分",
          "包裹放好评卡片：不违规，可引导留评",
        ],
      },
      {
        title: "亚马逊 运营要点",
        content: [
          "A9算法核心：销量、评价、转化率、关键词相关性",
          "新品Vine计划：花钱换真实评价，新品必做（前30天）",
          "PPC广告：自动广告跑2周找关键词，手动广告精准投放",
          "避免跟卖：注册品牌，防止别人抢你的Buy Box",
          "FBA库存：保持60天库存，断货会损失排名",
          "A+内容：用品牌注册后可以做，转化率提升10-15%",
        ],
      },
      {
        title: "TikTok Shop 运营要点",
        content: [
          "内容为王：产品展示视频要真实，展示使用过程和效果",
          "达人合作：联盟计划给达人10-30%佣金，让达人帮带货",
          "直播带货：东南亚用户爱看直播，每天1-2小时直播转化率高",
          "爆款逻辑：一个视频火了要立刻备货，机会窗口只有1-2周",
          "账号矩阵：主账号+多个达人号，分散风险提升覆盖",
          "选品标准：上镜感强、演示效果好、有话题性",
        ],
      },
      {
        title: "Shopee 运营要点",
        content: [
          "新手礼包：开店初期有平台流量补贴，新品免费推广",
          "参与大促：9.9/10.10/11.11/12.12是Shopee最大促销节",
          "免运费活动：设置满额免运，提升客单价",
          "直播带货：Shopee Live功能，东南亚用户活跃度高",
          "粉丝营销：积累店铺粉丝，发优惠券给粉丝，复购率高",
          "关键词排名：商品标题包含热门搜索词，每天刷新商品",
        ],
      },
    ],
    links: [
      { text: "Ozon 广告后台", url: "https://seller.ozon.ru" },
      { text: "亚马逊广告平台", url: "https://advertising.amazon.com" },
      { text: "TikTok Shop 联盟", url: "https://affiliate.tiktok.com" },
    ],
  },
  {
    id: "logistics",
    icon: <Truck size={20} />,
    title: "物流方案（各平台）",
    color: "cyan",
    sections: [
      {
        title: "跨境直发小包（通用）",
        content: [
          "云途物流（YunExpress）：俄罗斯/东南亚专线，追踪稳定 ⭐推荐",
          "燕文物流：老牌，覆盖俄罗斯/东南亚，价格适中",
          "广东联邑：俄罗斯专线，时效快",
          "递四方4PX：全球覆盖，东南亚有本地配送",
          "菜鸟国际：和1688/速卖通联动，1688发货最方便",
          "运费参考：500g以内到俄罗斯约¥15-25，到东南亚约¥10-20",
          "时效：普通15-35天，特快7-15天（贵3-5倍）",
        ],
      },
      {
        title: "亚马逊FBA头程",
        content: [
          "海运：30-45天，¥5-15/kg，适合大批量，成本最低",
          "空运：7-15天，¥25-45/kg，适合新品测款和紧急补货",
          "FBA货件标准：每件必须贴FNSKU条码，外箱贴FBA标签",
          "推荐头程：递四方、4PX、出口易（有亚马逊仓库直送服务）",
          "注意：美国站FBA收取存储费，超过180天收长期存储费",
          "库存周转：保持60天库存，过多库存积压成本",
        ],
      },
      {
        title: "Shopee官方物流（SLS）",
        content: [
          "Shopee Logistics Service：平台官方物流，新手必选",
          "从中国直发到东南亚各国，无需自己找物流公司",
          "时效：7-15天，运费系统自动计算，买家承担",
          "限重：大部分订单限重2kg，超重联系平台",
          "Shopee国内仓：可以把货发到Shopee中国仓，加速出单",
          "COD（货到付款）：东南亚用户偏爱，必须开通",
        ],
      },
      {
        title: "TikTok Shop物流",
        content: [
          "美国TikTok Shop：支持FBT（TikTok仓储）和自发货",
          "东南亚TikTok Shop：使用各国当地物流+J&T/Ninja Van等",
          "自发货：下单后3天内发货，追踪号上传平台",
          "建议：初期用自发货测品，爆款后考虑备货到当地仓",
          "退货：美国退货率高（10-30%），东南亚低，选品要考虑退货成本",
        ],
      },
    ],
    links: [
      { text: "云途物流", url: "https://www.yunexpress.cn" },
      { text: "递四方4PX", url: "https://www.4px.com" },
      { text: "燕文物流", url: "https://www.yanwen.com" },
      { text: "17Track 物流追踪", url: "https://www.17track.net" },
    ],
  },
  {
    id: "tools",
    icon: <Wrench size={20} />,
    title: "必备工具软件大全",
    color: "rose",
    sections: [
      {
        title: "🛒 选品数据工具",
        content: [
          "本工具（Crossly）：1688→多平台一键导入，利润计算，批量翻译 ⭐免费",
          "选品大师：Ozon专属数据分析，月销量/趋势/竞品，约¥199/月",
          "Jungle Scout：亚马逊选品神器，月销量估算超准，约$49/月",
          "Helium 10：亚马逊运营全套工具，关键词/竞品/广告，约$99/月",
          "Seller Assistant App：Ozon数据分析，有免费版",
          "Kalodata：TikTok Shop数据分析，爆品追踪，约¥299/月",
          "魔方格：国内跨境数据工具，支持多平台，有免费版",
        ],
      },
      {
        title: "🌐 翻译工具",
        content: [
          "DeepL：俄语/欧洲语言翻译最准，强烈推荐 deepl.com ⭐",
          "ChatGPT/Claude：优化俄语/英语标题和描述，效果最好",
          "本工具翻译：批量翻译商品标题，支持8种语言 ⭐",
          "Google翻译：备用，免费，东南亚语言准确率还不错",
          "Yandex翻译：俄语最准（俄罗斯市场用），translate.yandex.com",
          "百度翻译APP：手机端扫图翻译，很方便",
        ],
      },
      {
        title: "🎨 图片处理",
        content: [
          "Canva：设计详情图/场景图，模板丰富，免费版够用 canva.com ⭐",
          "Remove.bg：一键抠图做白底图，免费 remove.bg ⭐",
          "Watermarkremover.io：去除1688商品图水印，免费",
          "Photoshop：专业修图，¥88/月",
          "美图秀秀：手机端修图，批量处理方便",
          "Squoosh：图片压缩，保质量缩体积，在线免费 squoosh.app",
          "CapCut（剪映）：TikTok短视频剪辑，免费且功能强大",
        ],
      },
      {
        title: "📦 ERP多平台管理",
        content: [
          "店小秘（ECCANG）：支持Ozon/亚马逊/Shopee，多平台订单管理，¥99起/月",
          "马帮ERP：老牌跨境ERP，功能全，适合有规模的卖家",
          "万里牛：国内主流ERP，支持主流跨境平台",
          "Linnworks：亚马逊/eBay/Shopify多平台管理，$449/月（大卖家）",
          "新手阶段：各平台自带后台够用，月销100单以内不需要ERP",
        ],
      },
      {
        title: "💰 收款与汇率工具",
        content: [
          "PingPong：支持Ozon/亚马逊/TikTok，手续费1%，到账快 pingpongx.com ⭐",
          "连连支付：Ozon官方推荐，支持多平台，lianlianpay.com ⭐",
          "Payoneer：亚马逊必备，国际收款老牌，payoneer.com",
          "WorldFirst万里汇：汇率好，适合大额收款，worldfirst.com",
          "实时汇率参考：xe.com（多币种）",
          "建议：收款后及时换汇，别囤外币（汇率有波动）",
        ],
      },
      {
        title: "📊 广告与数据分析",
        content: [
          "Google Analytics：网站/落地页流量分析，免费",
          "Facebook Ads Manager：面向海外买家投广告，适合独立站",
          "亚马逊广告后台：PPC广告，自带数据分析",
          "TikTok Ads Manager：TikTok广告投放，东南亚/美国",
          "Ozon Performance：Ozon广告后台，搜索/展示广告",
          "SimilarWeb：竞品网站流量分析，免费版够用",
        ],
      },
      {
        title: "💬 学习与社群",
        content: [
          "Ozon中文卖家Telegram群：搜「Ozon卖家中文群」，资源最多",
          "知无不言：跨境电商论坛，各平台都有版块 zhiwubuyan.com",
          "雨果网：跨境媒体，有Ozon/亚马逊/TikTok专题 cifnews.com",
          "跨境知道：B站有大量免费教程视频",
          "Seller's Place（Facebook群）：英语亚马逊卖家社区",
          "跨境电商圈（微信公众号）：每日行业资讯",
        ],
      },
    ],
    links: [
      { text: "DeepL", url: "https://www.deepl.com" },
      { text: "Canva", url: "https://www.canva.com" },
      { text: "Remove.bg", url: "https://www.remove.bg" },
      { text: "PingPong收款", url: "https://www.pingpongx.com" },
      { text: "17Track物流追踪", url: "https://www.17track.net" },
      { text: "知无不言论坛", url: "https://www.zhiwubuyan.com" },
      { text: "Jungle Scout", url: "https://www.junglescout.com" },
      { text: "Kalodata TikTok数据", url: "https://www.kalodata.com" },
    ],
  },
  {
    id: "advanced",
    icon: <BarChart2 size={20} />,
    title: "进阶：独立站与品牌出海",
    color: "indigo",
    sections: [
      {
        title: "什么时候考虑独立站",
        content: [
          "月销超过50万，平台抽成太多，值得建自己的品牌站",
          "有稳定货源和复购品类，希望沉淀自己的用户资产",
          "有内容运营能力（社交媒体/YouTube/TikTok有粉丝）",
          "不推荐新手直接做独立站（流量贵，转化难，退款多）",
          "正确姿势：平台验证爆款 → 有稳定货源 → 再开独立站",
        ],
      },
      {
        title: "独立站建站工具",
        content: [
          "Shopify：全球最主流独立站平台，$29/月起，新手首选",
          "WooCommerce：WordPress插件，免费，需要自己维护",
          "Shoplazza（店匠）：中国团队做的，对接国内支付方便",
          "SHOPLINE：支持多语言多货币，适合多市场卖家",
          "建议主题：免费主题中「Dawn」（Shopify）最干净专业",
        ],
      },
      {
        title: "品牌注册",
        content: [
          "亚马逊品牌备案（Brand Registry）：需要有注册商标",
          "商标注册：在目标市场（美国USPTO/欧盟EUIPO）注册",
          "国内商标：可以用于Shopee/Lazada品牌备案",
          "商标注册费：美国约$250/类，国内约¥300/类",
          "时间：美国6-12个月，国内8-12个月",
          "推荐找专业商标代理，避免因格式问题被驳回",
        ],
      },
      {
        title: "选品数据分析进阶",
        content: [
          "Ozon竞品分析：MPStats.ru、Moneyplace.io",
          "亚马逊市场研究：Jungle Scout/Helium 10",
          "TikTok选品：Kalodata、FastMoss（看爆款视频数据）",
          "通用：Google Trends（全球趋势）、SimilarWeb（竞品流量）",
          "海关数据：查竞品的进出口记录，了解货源和销量",
        ],
      },
    ],
    links: [
      { text: "Shopify 建站", url: "https://www.shopify.com" },
      { text: "Google Trends", url: "https://trends.google.com" },
      { text: "Jungle Scout", url: "https://www.junglescout.com" },
      { text: "FastMoss TikTok数据", url: "https://www.fastmoss.com" },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-600",   badge: "bg-blue-100 text-blue-700" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  icon: "text-green-600",  badge: "bg-green-100 text-green-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  teal:   { bg: "bg-teal-50",   border: "border-teal-200",   icon: "text-teal-600",   badge: "bg-teal-100 text-teal-700" },
  cyan:   { bg: "bg-cyan-50",   border: "border-cyan-200",   icon: "text-cyan-600",   badge: "bg-cyan-100 text-cyan-700" },
  rose:   { bg: "bg-rose-50",   border: "border-rose-200",   icon: "text-rose-600",   badge: "bg-rose-100 text-rose-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
};


// ── 手把手教程数据 ─────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "ozon-register",
    emoji: "📱",
    title: "第一步：注册Ozon卖家账号",
    badge: "必看·最重要",
    badgeColor: "bg-red-500",
    desc: "从零开始，手机就能完成，约3-7天审核",
    steps: [
      {
        title: "准备材料（提前搞定，省得卡住）",
        tip: "⏱️ 准备时间：1-2天",
        items: [
          { icon: "🏢", text: "营业执照", detail: "个体工商户就够！去当地政务大厅或用「一网通办」APP申请，约3-5个工作日，费用免费（部分地区）或极低" },
          { icon: "🪪", text: "法人身份证", detail: "正反面拍清楚，光线好，四角完整不截断，不反光" },
          { icon: "🏦", text: "银行卡", detail: "绑定营业执照的对公账户最好；个人储蓄卡也行，但部分功能受限" },
          { icon: "📱", text: "手机号", detail: "用能正常收短信的号码，Ozon会发验证码" },
          { icon: "📧", text: "邮箱", detail: "推荐Gmail或QQ邮箱，用于接收审核结果和订单通知" },
        ],
      },
      {
        title: "开始注册（网页版，手机电脑都行）",
        tip: "🌐 访问：seller.ozon.ru",
        items: [
          { icon: "1️⃣", text: "打开 seller.ozon.ru", detail: "⚠️ 注意：国内直接访问可能需要科学上网。推荐用手机开热点+全局模式，或者用电脑挂VPN" },
          { icon: "2️⃣", text: "点右上角「Зарегистрироваться」（注册）", detail: "俄语别怕！浏览器右键翻译成中文就行，Chrome自带翻译" },
          { icon: "3️⃣", text: "选择「Китайский продавец」（中国卖家）", detail: "专门为中国卖家开的通道，流程比普通注册简单" },
          { icon: "4️⃣", text: "填写公司信息", detail: "公司名填营业执照上的名称，地址填注册地址，法人填身份证上的名字（拼音）" },
          { icon: "5️⃣", text: "上传证件照片", detail: "用手机拍照上传最方便，注意：证件四边都要在画面里，不能被遮挡，不能有阴影" },
          { icon: "6️⃣", text: "等待审核邮件", detail: "通常1-3个工作日，有时会要求补充材料，按邮件提示操作就行" },
        ],
      },
      {
        title: "审核通过后（3步完成开店）",
        tip: "✅ 审核通过后收到邮件通知",
        items: [
          { icon: "📝", text: "签署电子合同", detail: "在卖家后台签，不用打印，点击确认就行" },
          { icon: "💰", text: "交保证金", detail: "约¥1000-3000（视品类），玩具类通常¥1500，这是可退的押金" },
          { icon: "🎉", text: "店铺开通！开始上传商品", detail: "用Crossly插件一键导入，比手动填写快10倍" },
        ],
      },
      {
        title: "新手常见卡点（别踩坑）",
        tip: "❗ 这些问题99%的新手都遇到过",
        items: [
          { icon: "🔴", text: "网站打不开怎么办？", detail: "seller.ozon.ru 需要科学上网。推荐：手机用Shadowrocket全局模式；电脑用Clash配置全局代理。不会的话搜「Ozon卖家后台打不开」有教程" },
          { icon: "🔴", text: "验证码收不到？", detail: "① 检查手机号是否国际格式（+86开头）；② 换QQ邮箱试试；③ 检查垃圾邮件箱；④ 等5分钟再试，Ozon发件有延迟" },
          { icon: "🔴", text: "营业执照被拒怎么办？", detail: "常见原因：①照片模糊→重拍；②执照过期→先续期；③信息不匹配→确认填的公司名和执照完全一致" },
          { icon: "🔴", text: "个体户还是公司？", detail: "强烈推荐个体工商户！注册简单、费用低、税收优惠，完全够用。去「国家企业信用信息公示系统」可以查个体户状态" },
        ],
      },
    ],
  },
  {
    id: "find-products",
    emoji: "🔍",
    title: "第二步：怎么找到爆卖的商品",
    badge: "选品是核心",
    badgeColor: "bg-orange-500",
    desc: "选对了事半功倍，选错了白忙活",
    steps: [
      {
        title: "黄金选品5条标准（背下来！）",
        tip: "✅ 5条都符合，基本稳了",
        items: [
          { icon: "💵", text: "1688拿货价 < 30元", detail: "控制成本，利润空间才大。超过50元的商品，运费+佣金一算就没利润了" },
          { icon: "⚖️", text: "重量 < 500克", detail: "运费按重量算，500克以内头程运费约14-25元，超过1公斤可能亏本" },
          { icon: "📊", text: "1688月销量 > 1000件", detail: "说明这个款有市场验证，不是自己觉得好看就买。去1688商品页看「成交量」" },
          { icon: "🚫", text: "不液体、不易碎、不带电池", detail: "液体=海关查；易碎=路上碎；锂电池=航空禁运。这三类新手别碰，麻烦多" },
          { icon: "🌊", text: "目标平台竞争对手 < 100个", detail: "去Ozon搜这个商品，看「товаров」数量。越少越好，说明是蓝海，你进去有机会" },
        ],
      },
      {
        title: "在哪里找爆款（3个免费方法）",
        tip: "💡 不花钱就能找到好货",
        items: [
          { icon: "🔥", text: "方法1：看Ozon畅销榜", detail: "去ozon.ru搜索你感兴趣的品类，按「по популярности」（销量）排序，排名前20的就是爆款。记下商品名，去1688搜同款" },
          { icon: "📱", text: "方法2：刷抖音/小红书", detail: "搜「Ozon爆款」「俄罗斯热卖」，博主测评的商品就是验证过的爆款。直接抄作业，不用动脑" },
          { icon: "🛒", text: "方法3：用Crossly爆品榜", detail: "我们每天更新精选爆品，点「爆品榜单」标签，看到喜欢的直接点「我要卖这个」一键导入，连1688都帮你找好了" },
        ],
      },
      {
        title: "2024最容易卖的品类",
        tip: "🏆 经过验证，新手首选",
        items: [
          { icon: "🧸", text: "毛绒玩具 / 抱枕", detail: "俄罗斯人特别爱！尤其是动漫角色、猫咪造型。拿货价5-25元，Ozon能卖200-800卢布（约16-64元），利润超高" },
          { icon: "💄", text: "美妆小工具", detail: "睫毛夹、卷发棒、美容仪，女性消费力强。注意：口红等有色产品海关可能查，工具类最安全" },
          { icon: "🏠", text: "家居收纳小物", detail: "硅胶收纳盒、挂钩、防滑垫，客单价低但走量大，复购率高" },
          { icon: "🎮", text: "手机配件", detail: "数据线、手机支架、保护壳，永远有需求。注意别做苹果品牌联名款，有侵权风险" },
          { icon: "🎁", text: "节日礼品", detail: "俄罗斯妇女节（3月8日）超级大节，提前1个月开始备货，销量能翻5-10倍" },
        ],
      },
      {
        title: "一定要避开的坑（血泪教训）",
        tip: "⚠️ 前人踩过的，你别再踩",
        items: [
          { icon: "❌", text: "别做服装鞋帽（尺码地狱）", detail: "俄罗斯尺码标准不同，退货率极高。新手搞这个10单里可能退8单，别碰" },
          { icon: "❌", text: "别做名牌山寨（侵权封号）", detail: "印着Nike、Supreme的货，Ozon查到直接封店，保证金也不退。不值得" },
          { icon: "❌", text: "别一次备太多货", detail: "新品先发5-10件测试，卖完再补。很多人第一次就备了200件，滞销了哭都来不及" },
          { icon: "❌", text: "别看到便宜就买", detail: "1688价格越低质量越差，质量差→差评多→搜索降权→彻底卖不动。宁愿贵2元，要质量稳定的" },
        ],
      },
    ],
  },
  {
    id: "use-crossly",
    emoji: "⚡",
    title: "第三步：用Crossly一键上架（全自动）",
    badge: "核心功能",
    badgeColor: "bg-purple-500",
    desc: "30秒完成一件商品，AI全自动处理",
    steps: [
      {
        title: "安装Crossly插件（2分钟搞定）",
        tip: "🔌 只支持Chrome浏览器",
        items: [
          { icon: "1️⃣", text: "下载插件压缩包", detail: "在Crossly网站首页点「下载插件」，得到一个.zip文件" },
          { icon: "2️⃣", text: "解压到任意文件夹", detail: "右键zip文件→解压到当前位置，记住解压后的文件夹在哪" },
          { icon: "3️⃣", text: "Chrome打开扩展管理", detail: "浏览器地址栏输入 chrome://extensions/ 回车" },
          { icon: "4️⃣", text: "开启「开发者模式」", detail: "右上角有个开关，打开它（变蓝就对了）" },
          { icon: "5️⃣", text: "加载插件文件夹", detail: "点「加载已解压的扩展程序」，选择刚才解压的文件夹，不是选zip文件！" },
          { icon: "6️⃣", text: "右上角出现Crossly图标 = 成功", detail: "如果看不到图标，点浏览器右上角拼图图标，把Crossly固定到工具栏" },
        ],
      },
      {
        title: "在1688抓取商品（超简单）",
        tip: "📦 在1688商品详情页操作",
        items: [
          { icon: "🔍", text: "打开任意1688商品页面", detail: "比如搜「毛绒玩具猫咪」，点进一个商品" },
          { icon: "🖱️", text: "点击右上角Crossly图标", detail: "插件弹出面板，自动开始识别页面商品信息" },
          { icon: "📸", text: "等待图片加载完成", detail: "滚动页面到底部，让所有图片都加载出来，插件才能抓全" },
          { icon: "✅", text: "点「导入商品」", detail: "标题、图片、规格、价格全部自动抓取，同步到Crossly后台" },
          { icon: "✏️", text: "填写你的拿货价", detail: "在Crossly商品卡片里填「1688拿货价」，系统自动计算卢布售价" },
        ],
      },
      {
        title: "AI自动翻译+定价（不用你动手）",
        tip: "🤖 AI帮你搞定外语",
        items: [
          { icon: "🈯", text: "标题自动翻译成外语", detail: "点「发布到Ozon」，AI自动把中文标题翻译成俄语标题，包含关键词优化，不是直接机翻" },
          { icon: "📝", text: "描述自动生成", detail: "AI根据商品类目生成俄语商品描述，符合Ozon算法偏好，新手完全不用写" },
          { icon: "💰", text: "价格自动换算", detail: "你填人民币成本，系统按实时汇率+运费+佣金算出卢布建议售价，不会亏本" },
          { icon: "🖼️", text: "图片自动上传", detail: "系统把1688图片缓存到服务器，绕过1688防盗链，确保Ozon能正常显示" },
        ],
      },
      {
        title: "一键发布到Ozon",
        tip: "🚀 点一下，30秒上架",
        items: [
          { icon: "🔑", text: "先填入Ozon API密钥", detail: "去Ozon后台「设置→API密钥」复制，粘贴到Crossly「参数设置」里保存一次就够" },
          { icon: "📋", text: "在商品卡片点「发布到Ozon」", detail: "系统自动提交商品信息，等待约30秒" },
          { icon: "🎯", text: "看到「发布成功」提示", detail: "商品已进入Ozon审核，通常2-24小时出现在搜索结果里" },
          { icon: "🔍", text: "去Ozon后台确认", detail: "登录seller.ozon.ru，点「товары」→「все товары」，找到你的商品，状态是「активный」就上架成功了" },
        ],
      },
    ],
  },
  {
    id: "logistics",
    emoji: "✈️",
    title: "第四步：物流怎么做（保姆级）",
    badge: "不懂物流会亏钱",
    badgeColor: "bg-blue-500",
    desc: "搞清楚物流，才能真正赚钱",
    steps: [
      {
        title: "各平台物流费用对比（选最便宜的！）",
        tip: "💡 东南亚最便宜，俄罗斯稍贵，提前算好成本",
        items: [
          { icon: "🌏", text: "Shopee/Lazada（东南亚）：2-8元/件", detail: "东南亚距离近，物流最便宜！500g以内约2-8元，用Shopee官方物流SLS或J&T，7-14天到达。这是所有跨境里运费最低的！" },
          { icon: "🎵", text: "TikTok Shop（东南亚）：3-10元/件", detail: "和Shopee差不多，用TikTok官方合作物流。500g以内约3-10元，时效10-15天" },
          { icon: "🇷🇺", text: "Ozon（俄罗斯）RETS快线：25-50元/件", detail: "路程远所以贵一些，但利润也高（30-50%）。500g以内约25-50元，5-10个工作日到达" },
          { icon: "🇧🇷", text: "Mercado Libre（拉美）：35-80元/件", detail: "最贵的线路，巴西路途遥远，物流约35-80元/500g。利润要够高才划算，建议高客单价商品" },
          { icon: "📦", text: "亚马逊FBA：另算", detail: "FBA需要提前备货进亚马逊仓库，费用复杂，新手不建议" },
        ],
      },
      {
        title: "东南亚最便宜的发货方式",
        tip: "✅ Shopee/Lazada/TikTok新手首选",
        items: [
          { icon: "🚀", text: "Shopee官方物流SLS（最推荐）", detail: "Shopee官方合作，在Shopee卖家后台直接下单，自动上门取货，免操作麻烦。500g约3-6元，稳定不丢件" },
          { icon: "📦", text: "J&T Express（极兔）", detail: "东南亚覆盖广，价格便宜，500g约2-5元。在义乌货代下单即可，是东南亚跨境最常用的物流之一" },
          { icon: "⚡", text: "懒人方案：用货代打包发", detail: "在1688下单→发到义乌货代仓→货代帮你挑最便宜的物流发货。你只用报备订单信息，货代搞定一切" },
          { icon: "💡", text: "为什么要用货代，不能直接寄？", detail: "直接在1688走快递发到东南亚，价格反而贵，还没有贴平台标签。货代会帮你打包+贴标+走最优惠价格的线路" },
        ],
      },
      {
        title: "Ozon（俄罗斯）怎么发货",
        tip: "🇷🇺 路途远但利润高，RETS快线最稳",
        items: [
          { icon: "⏱️", text: "RETS快线：5-10个工作日", detail: "Ozon官方合作的跨境快线，稳定、不丢件、客户满意度高。500g以内约25-50元" },
          { icon: "🏷️", text: "Ozon后台设置", detail: "卖家后台→仓库→配送方案→选「RETS跨境快线」，备货时间设5天，退货方式选「销毁」（省得退货运费）" },
          { icon: "📦", text: "操作流程", detail: "在1688下单→货发义乌货代仓→货代贴Ozon标签→RETS取货发往俄罗斯→你在Ozon后台填追踪单号" },
        ],
      },
      {
        title: "怎么找货代（通用）",
        tip: "🏭 所有平台都推荐走货代，省钱省事",
        items: [
          { icon: "🔍", text: "搜「义乌跨境货代」+平台名", detail: "微信/抖音搜「义乌Ozon货代」「义乌Shopee货代」，找评价好的加微信询价。一定要问：有没有贴标服务？时效多久？" },
          { icon: "📋", text: "要问货代的三个问题", detail: "①每公斤多少钱？②帮不帮贴平台标签？③超出多少克开始计费？这三个问清楚再合作" },
          { icon: "📍", text: "在1688下单填货代地址", detail: "收货人：货代公司名+你的客户编号；地址：货代给你的义乌仓库地址。每次下单都用这个地址" },
          { icon: "💬", text: "第一次合作先发5件测试", detail: "确认货代靠谱（货物完好、时效准确、贴标正确），再批量合作" },
        ],
      },
      {
        title: "收款流程（外币怎么到手）",
        tip: "💰 外币→人民币，几个工作日到账",
        items: [
          { icon: "🏦", text: "各平台结算周期", detail: "Ozon：每2周；Shopee：订单完成后7天；TikTok Shop：订单完成后3-7天；Lazada：每周一结" },
          { icon: "💱", text: "外币换成人民币", detail: "用连连支付、万里汇、PingPong等收款工具，把卢布/马币/泰铢等换成人民币，打到国内银行卡" },
          { icon: "⏰", text: "到账时间：3-7个工作日", detail: "建议凑满一定金额再提，单次手续费固定，金额越大平均成本越低" },
          { icon: "📊", text: "记账建议", detail: "每笔收入记好：平台、订单号、外币金额、换汇率、到手人民币。方便年底报税和核算利润" },
        ],
      },
    ],
  },
  {
    id: "pricing",
    emoji: "💰",
    title: "第五步：怎么定价不亏钱",
    badge: "定价决定生死",
    badgeColor: "bg-green-500",
    desc: "价格定错了，卖越多亏越多",
    steps: [
      {
        title: "保本价公式（必须背会）",
        tip: "📐 这个公式救过无数新手",
        items: [
          { icon: "📝", text: "公式：保本价(卢布) = (拿货价+头程运费+包材) ÷ (1-佣金率) × 汇率", detail: "例：拿货¥17 + 运费¥25 + 包材¥2 = ¥44。÷(1-15%)=¥52。×13汇率 = ₽676。建议售价定₽800以上（约¥62），利润约¥10" },
          { icon: "💡", text: "Crossly自动帮你算", detail: "在商品卡片填入「拿货价」和「头程运费」，系统自动算出保本价和建议售价，不用你手算" },
          { icon: "📊", text: "佣金率按15%算（保守）", detail: "Ozon玩具类佣金约12-15%，按最高的算，不会亏" },
          { icon: "💱", text: "汇率按12-13算", detail: "实时汇率有波动，偏低估算，留缓冲空间" },
        ],
      },
      {
        title: "定价策略（怎么定才有竞争力）",
        tip: "🎯 定价是门艺术",
        items: [
          { icon: "🔍", text: "先看竞争对手价格", detail: "去Ozon搜同款商品，看排名前5的价格区间，定在中位数偏低10%，既有竞争力又有利润" },
          { icon: "🆕", text: "新品期定低10%吸引第一批买家", detail: "新上架的商品没有评价，买家不信任。暂时定低一点，换来前10个评价，然后慢慢提价" },
          { icon: "📈", text: "有了评价后提价", detail: "积累10个以上好评后，价格可以提高10-20%，买家会信任有评价的商品，销量不会明显下降" },
          { icon: "🎪", text: "节日活动要参加", detail: "Ozon妇女节（3月）、黑色星期五（11月）活动期间可以临时打折，活动结束恢复原价，这段时间销量暴增" },
        ],
      },
      {
        title: "利润计算实例（毛绒玩具）",
        tip: "🧸 用真实数字告诉你能赚多少",
        items: [
          { icon: "💵", text: "1688拿货价：¥17.5/个", detail: "选一款猫咪抱枕，月销5000件，质量稳定，价格17.5元" },
          { icon: "✈️", text: "头程运费（RETS）：¥25/个", detail: "重量约300g，RETS快线约25元一件" },
          { icon: "📦", text: "包材费：¥2/个", detail: "气泡袋+纸箱分摊，约2元" },
          { icon: "💰", text: "总成本：¥44.5/个", detail: "17.5+25+2=44.5元" },
          { icon: "🏷️", text: "Ozon售价定：₽899（约¥69）", detail: "竞争对手卖₽700-1200，定₽899有竞争力" },
          { icon: "📊", text: "Ozon扣佣金15%：₽135 = ¥10.4", detail: "平台收你15%佣金" },
          { icon: "✅", text: "每件利润：¥69-¥44.5-¥10.4 = ¥14.1", detail: "每件赚约14元，卖100件=赚1410元。月销100件不难！" },
        ],
      },
    ],
  },
  {
    id: "first-order",
    emoji: "🎉",
    title: "第六步：来了第一个订单怎么办",
    badge: "别慌，看这里",
    badgeColor: "bg-pink-500",
    desc: "第一单最紧张，但其实很简单",
    steps: [
      {
        title: "收到订单通知（会发邮件）",
        tip: "📧 订单来了Ozon会发邮件通知",
        items: [
          { icon: "📱", text: "邮件里有订单详情", detail: "包括：商品名、数量、买家地址（俄文，不用看懂）、发货截止时间" },
          { icon: "⏰", text: "注意发货截止时间！", detail: "Ozon规定你必须在X天内把货交给货代，超时会扣分，影响店铺权重" },
          { icon: "📲", text: "在Ozon后台确认订单", detail: "seller.ozon.ru → Заказы（订单），点击订单查看详情" },
        ],
      },
      {
        title: "马上去1688补货下单",
        tip: "🛒 订单来了才去下单（无库存模式）",
        items: [
          { icon: "🖥️", text: "去1688找之前的供应商", detail: "直接拍商品，填货代的仓库地址，备注「Crossly发货，请包好」" },
          { icon: "📞", text: "联系货代告知发货计划", detail: "微信告诉货代：「我有1件XXX商品要到你仓库，Ozon订单，请帮我贴标处理」" },
          { icon: "⚡", text: "1688下单后通知货代追踪单号", detail: "下单后把1688快递单号发给货代，他们收到货后帮你处理" },
        ],
      },
      {
        title: "货代操作（你不用管）",
        tip: "🏭 交给货代就行",
        items: [
          { icon: "✅", text: "货代收到货→验货→贴Ozon标签", detail: "靠谱货代会拍照给你确认，确保货没问题" },
          { icon: "✈️", text: "货代打包发货→给你国际快递单号", detail: "单号发给你，可以在RETS官网查轨迹" },
          { icon: "📋", text: "在Ozon后台填写快递单号", detail: "seller.ozon.ru→订单→填入「Трек-номер」（追踪号），完成！" },
        ],
      },
      {
        title: "买家收货后（最后一步）",
        tip: "⭐ 争取好评是重点",
        items: [
          { icon: "📊", text: "14天确认收货，Ozon结款给你", detail: "买家收货后14天，如果没申请退款，Ozon自动把钱算到你账户" },
          { icon: "💬", text: "怎么要好评？", detail: "暂时Ozon不支持直接催评，但可以在商品图片里放一张小卡片（用Crossly图片俄化功能），俄文写「请给我们好评！謝謝」" },
          { icon: "🔄", text: "有了第一单经验，后面都一样", detail: "第一单是最难的，做完一次就熟了。100单和1单流程完全一样，就是量变" },
        ],
      },
    ],
  },
  {
    id: "shopee-register",
    emoji: "🌏",
    title: "Shopee（虾皮）开店全攻略",
    badge: "东南亚首选",
    badgeColor: "bg-amber-500",
    desc: "东南亚最大电商，走量快，新手友好",
    steps: [
      {
        title: "Shopee 是什么？适合谁做？",
        tip: "📊 覆盖：马来西亚·泰国·越南·菲律宾·印尼·台湾·巴西",
        items: [
          { icon: "🛒", text: "Shopee 简介", detail: "东南亚+台湾最大电商平台，月活超3亿，中国卖家很多，入驻门槛低。适合走量型商品，单价低但订单多" },
          { icon: "✅", text: "适合做Shopee的人", detail: "有1688货源、想稳定走量的卖家；或者已经在做Ozon、想多开一个平台增加收入的" },
          { icon: "⚠️", text: "不适合的情况", detail: "只想赚高利润的：Shopee价格战激烈，利润通常比Ozon低10-20%。喜欢小众蓝海的也建议先做Ozon" },
        ],
      },
      {
        title: "注册Shopee卖家账号",
        tip: "🌐 访问：seller.shopee.cn（中国卖家专区）",
        items: [
          { icon: "1️⃣", text: "访问 seller.shopee.cn", detail: "这是Shopee专门给中国跨境卖家开的入口，国内可以直接访问，不需要科学上网！" },
          { icon: "2️⃣", text: "选择入驻市场", detail: "可以同时入驻多个国家：马来西亚、泰国、越南、菲律宾、印尼、台湾，推荐新手先选马来+泰国" },
          { icon: "3️⃣", text: "准备材料", detail: "营业执照（个体户就行）+ 法人身份证 + 手机号 + 银行卡。比Ozon简单，通常1-3个工作日审核" },
          { icon: "4️⃣", text: "填写店铺信息", detail: "店铺名随便取，建议用英文或当地语言，后期可以修改。类目选你主要卖的商品种类" },
          { icon: "5️⃣", text: "等待审核通过", detail: "审核比Ozon快，通常1-2个工作日。通过后即可上传商品" },
        ],
      },
      {
        title: "Shopee上架商品要点",
        tip: "📦 和1688联动，无货源模式同样适用",
        items: [
          { icon: "🖼️", text: "主图要求", detail: "白底图最好，尺寸至少500×500，商品占80%以上画面。不能有水印，不能有促销文字叠加" },
          { icon: "📝", text: "标题要求", detail: "用当地语言写关键词，比如马来西亚用马来语或英语。用Crossly AI可以自动翻译，省时省力" },
          { icon: "💰", text: "定价策略", detail: "参考同款竞品，定在中低位。Shopee买家特别喜欢「优惠券」和「免运费」，开启这两个可以大幅提升转化" },
          { icon: "🚚", text: "Shopee物流", detail: "跨境直发：用Shopee官方物流（SLS），7-14天到达。比Ozon RETS便宜一些，约15-35元/500g" },
          { icon: "💡", text: "新手小技巧", detail: "上架前10件商品建议开「新手优惠」低价测款，积累评价后提价。有5个以上好评之后，销量会明显提升" },
        ],
      },
      {
        title: "Shopee赚钱核心：走量不走利",
        tip: "💰 Shopee的玩法和Ozon不一样",
        items: [
          { icon: "📊", text: "Shopee佣金", detail: "约2-6%（各市场不同），比Ozon低。但价格战激烈，净利润通常15-25%，低于Ozon的30-50%" },
          { icon: "🔄", text: "适合做复购品", detail: "家居收纳、厨房小物、美妆工具，买家会反复购买。一个老客带来的利润比拉10个新客还多" },
          { icon: "📅", text: "活动很重要", detail: "Shopee每月都有大促：每月1号、15号的品类日，双11、双12，购物节期间流量暴增5-10倍，提前备货！" },
          { icon: "⭐", text: "评价是命根", detail: "Shopee算法极度看重评价数量和评分。新品期主动私信买家要好评，回复所有评论（用翻译软件）" },
        ],
      },
    ],
  },
  {
    id: "tiktok-register",
    emoji: "🎵",
    title: "TikTok Shop 开店全攻略",
    badge: "内容变现",
    badgeColor: "bg-pink-500",
    desc: "会拍视频就能爆单，东南亚+欧美双市场",
    steps: [
      {
        title: "TikTok Shop 是什么？",
        tip: "🎬 内容驱动电商，爆单快但需要视频能力",
        items: [
          { icon: "🎯", text: "什么是TikTok Shop", detail: "TikTok在电商App里内置的购物功能。用户刷视频时直接点击购买，不用跳转到其他App。冲动消费为主，爆单快" },
          { icon: "🌍", text: "覆盖市场", detail: "东南亚（马来西亚、泰国、越南、菲律宾、印尼）、英国、美国。其中东南亚和英国开放给中国卖家" },
          { icon: "✅", text: "适合做TikTok Shop的人", detail: "会拍简单短视频（哪怕用手机拍），或者有内容创作能力的；年轻用户喜欢的商品（潮品/美妆/趣味小物）" },
          { icon: "⚠️", text: "不适合的情况", detail: "不会拍视频、不想做内容的，建议先做Ozon或Shopee。TikTok Shop纯靠搜索很难出单，视频才是核心流量" },
        ],
      },
      {
        title: "注册TikTok Shop卖家账号",
        tip: "🌐 访问：seller-id.tiktok.com（按国家不同）",
        items: [
          { icon: "1️⃣", text: "选择目标市场", detail: "东南亚：seller.tiktok.com/region/SE；英国：seller.tiktok.com/en/UK。国内访问需要科学上网" },
          { icon: "2️⃣", text: "准备材料", detail: "营业执照（英国市场需要英文版/翻译件）+ 法人护照或身份证 + 银行卡（支持国内卡绑定）" },
          { icon: "3️⃣", text: "创建TikTok账号", detail: "需要先有TikTok账号，建议用新账号专门做店铺，避免个人内容和店铺内容混在一起" },
          { icon: "4️⃣", text: "申请卖家资质", detail: "填写公司信息→上传证件→等待审核（1-3个工作日）→开通店铺" },
          { icon: "5️⃣", text: "设置支付方式", detail: "国内卖家可以用连连支付或万里汇接收款项，换成人民币提到国内银行" },
        ],
      },
      {
        title: "TikTok Shop 出单方法",
        tip: "🎬 视频是核心，没有视频几乎没有订单",
        items: [
          { icon: "📱", text: "方法1：自己拍开箱视频", detail: "最简单：收到1688样品→用手机拍开箱→加个背景音乐→发到TikTok账号。素人开箱反而比广告感强" },
          { icon: "🤝", text: "方法2：找当地网红带货", detail: "在TikTok Creator Marketplace找东南亚网红合作，给他们寄样品，让他们拍视频推荐。小网红（1-10万粉）效果往往比大V好" },
          { icon: "🏪", text: "方法3：店铺广告投流", detail: "TikTok Ads投「商品页点击广告」，按点击付费。新手建议每天预算100-200元测试，找到ROI>2的广告再放量" },
          { icon: "💡", text: "不会拍视频怎么办？", detail: "用Crossly的图片拼接功能，把商品图自动生成幻灯片视频，加上TikTok热门BGM，简单但有效" },
        ],
      },
      {
        title: "TikTok Shop 定价和物流",
        tip: "💰 佣金低，但要注意退货率",
        items: [
          { icon: "💰", text: "佣金约2-8%（新手期更低）", detail: "比Ozon和Shopee都低！新手期前3个月通常只收2%，之后恢复正常费率" },
          { icon: "🚚", text: "物流：TikTok官方物流或第三方", detail: "推荐用TikTok官方合作物流（J&T、虾皮物流），稳定且买家信任度高。约10-25天到达" },
          { icon: "🔄", text: "退货率较高", detail: "TikTok冲动消费多，退货率比Ozon高。建议商品图片和视频真实准确，减少「货不对板」退货" },
          { icon: "🎯", text: "爆款品类", detail: "美妆工具、居家创意小物、服装配件（东南亚尺码接近中国）、零食（部分品类可做）" },
        ],
      },
    ],
  },
  {
    id: "lazada-register",
    emoji: "🌟",
    title: "Lazada 开店全攻略",
    badge: "阿里系·稳",
    badgeColor: "bg-emerald-500",
    desc: "阿里巴巴旗下，马来西亚/泰国市场强",
    steps: [
      {
        title: "Lazada 基本介绍",
        tip: "🏪 阿里系电商，东南亚补充战场",
        items: [
          { icon: "🌍", text: "覆盖市场", detail: "马来西亚、泰国、印尼、越南、菲律宾、新加坡。其中马来西亚和泰国最强，流量比Shopee略低" },
          { icon: "✅", text: "最大优势", detail: "阿里系物流稳定，中国卖家操作习惯和1688/速卖通相似，上手快。大促活动（双11/双12）有阿里资源加持" },
          { icon: "💡", text: "和Shopee怎么选？", detail: "建议两个都做！商品发布一次，Shopee和Lazada同步上架，用Crossly批量导入，多一个平台多一份收入" },
        ],
      },
      {
        title: "注册Lazada卖家",
        tip: "🌐 访问：sellercenter.lazada.com",
        items: [
          { icon: "1️⃣", text: "访问 sellercenter.lazada.com", detail: "选择「中国卖家入驻（LazMall/跨境）」，有中文界面，操作比Ozon友好很多" },
          { icon: "2️⃣", text: "材料和Shopee一样", detail: "营业执照 + 身份证 + 银行卡。如果已经有Shopee账号，很多信息可以直接复用" },
          { icon: "3️⃣", text: "选择店铺类型", detail: "「跨境卖家」：无需在当地有仓库，直接从中国发货。这是新手最推荐的方式" },
          { icon: "4️⃣", text: "审核约1-3个工作日", detail: "通过率很高，材料齐全几乎100%通过。比亚马逊宽松太多" },
        ],
      },
      {
        title: "Lazada 运营技巧",
        tip: "💡 和Shopee思路类似，但有独特玩法",
        items: [
          { icon: "🎯", text: "LazMall vs 普通店铺", detail: "新手开普通店铺即可，LazMall要求品牌授权。普通店铺没有流量限制，完全够用" },
          { icon: "💰", text: "佣金约2-4%", detail: "比Shopee还低！但流量也相对少一些，需要靠广告或参加活动获取流量" },
          { icon: "📅", text: "必须参加大促", detail: "Lazada的流量主要集中在大促期间（双11/双12/各国购物节），平时流量相对平稳，大促要提前报名参加" },
          { icon: "⭐", text: "物流选Lazada官方", detail: "用Lazada自有物流（LEX）最稳，买家信任度最高，也有利于搜索排名" },
        ],
      },
    ],
  },
  {
    id: "faq-detail",
    emoji: "🙋",
    title: "高频问题大全（随时查）",
    badge: "99%人都问过",
    badgeColor: "bg-gray-600",
    desc: "遇到问题先来这里找答案",
    steps: [
      {
        title: "关于注册和账号",
        tip: "🔐 账号问题最让人焦虑",
        items: [
          { icon: "❓", text: "没有营业执照能不能做？", detail: "不行。Ozon要求卖家有合法主体。但个体工商户很容易办，很多地方网上就能申请，别怕麻烦" },
          { icon: "❓", text: "一个人能开几个Ozon账号？", detail: "一个营业执照只能开一个。用家人的营业执照可以再开一个，但风险自担" },
          { icon: "❓", text: "账号审核了10天还没过怎么办？", detail: "发邮件给support@ozon.ru，说明审核时间，要求加速审核。或者找Ozon官方服务商帮忙" },
        ],
      },
      {
        title: "关于商品上架",
        tip: "📦 上架遇到的问题",
        items: [
          { icon: "❓", text: "商品审核不通过怎么办？", detail: "看拒绝原因：①图片问题→换白底图；②标题问题→按Ozon要求格式改；③类目问题→选更准确的类目" },
          { icon: "❓", text: "图片必须白底吗？", detail: "主图强烈建议白底，成功率高很多。副图可以是场景图。Crossly有「白底处理」功能（开发中）" },
          { icon: "❓", text: "上架了但搜不到？", detail: "新品需要1-3天被索引。等1天再搜，或者直接访问商品链接看是否显示" },
          { icon: "❓", text: "在Ozon上能卖哪些东西？", detail: "大部分商品都可以。禁止的：武器、毒品、仿牌、成人用品。其余的先试试，被拒再说" },
        ],
      },
      {
        title: "关于运费和物流",
        tip: "✈️ 物流是最多问题的地方",
        items: [
          { icon: "❓", text: "头程运费到底多少？", detail: "RETS快线：约25-50元/500g以内。超重另算。具体找货代报价，不同货代价格不同" },
          { icon: "❓", text: "货发丢了怎么办？", detail: "RETS有保险，联系货代索赔。一般7个工作日内处理。发货前拍好照片留证据" },
          { icon: "❓", text: "买家申请退货怎么办？", detail: "设置了「销毁退货」的话，退货商品在俄罗斯当地销毁，不用运回来，省运费。在Ozon后台→退货设置里选" },
          { icon: "❓", text: "能发到俄罗斯以外的国家吗？", detail: "Ozon目前主要是俄罗斯，Ozon Kazakhstan(哈萨克斯坦)正在扩展。其他国家要去其他平台（Shopee/Lazada/TikTok）" },
        ],
      },
      {
        title: "关于收款和税务",
        tip: "💰 钱的问题最重要",
        items: [
          { icon: "❓", text: "收款手续费多少？", detail: "结汇服务商一般收1-2%的换汇手续费+约50元/次提现手续费。金额大的话按比例更划算" },
          { icon: "❓", text: "需要报税吗？", detail: "需要！跨境电商收入属于个体工商户收入，应该申报。建议找专业财务处理，避免税务风险" },
          { icon: "❓", text: "汇率什么时候换最合适？", detail: "没有完美时机。建议收到钱就换，别囤卢布，卢布波动大，囤着有风险" },
        ],
      },
    ],
  },
];

export function GuidePage() {
  const [openId, setOpenId] = useState<string | null>("ozon-register");
  const [openStepId, setOpenStepId] = useState<string | null>(null);

  return (
    <div className="space-y-4">

      {/* 🎁 领取手册入口 */}
      <a href="/crossly-handbook.pdf" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors group">
        <span className="text-2xl animate-pulse">🎁</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-indigo-800">
            领《跨境小白生存手册 1.0》PDF
          </p>
          <p className="text-xs text-indigo-500 mt-0.5">点击打开 · 手机长按可保存 · 电脑右键另存为</p>
        </div>
        <span className="text-indigo-400 text-sm flex-shrink-0 font-bold">打开 →</span>
      </a>

      {/* 置顶：0基础新手卡（全幅） */}
      <div className="-mx-6 -mt-6 relative overflow-hidden text-center"
        style={{ background: "linear-gradient(135deg, #1e2d5a 0%, #2d1b69 60%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 75% 30%, #a855f7 0%, transparent 50%)" }} />
        <div className="relative z-10 px-6 py-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-white/20">
            🎯 完全免费 · 0门槛入门
          </div>
          <h2 className="text-2xl font-black text-white mb-2">跨境不难，真的。</h2>
          <p className="text-white/60 text-sm mb-5 leading-relaxed">
            很多人觉得跨境很复杂、很神秘，其实核心只有3件事。<br />
            我们手把手教你，不卖课，不收费，看完就会。
          </p>
          <div className="grid grid-cols-3 gap-3 text-left mb-5">
            {[
              { n: "1", title: "在1688找一个卖得好的商品", detail: "月销>1000，价格<30元，重量<500g" },
              { n: "2", title: "用Crossly一键导入，AI自动翻译定价", detail: "30秒搞定，无需外语无需PS" },
              { n: "3", title: "点发布，等收钱", detail: "货代全程代办，你只管在1688下单" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-2 bg-white/8 rounded-xl p-3 border border-white/10">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black bg-purple-500">
                  {s.n}
                </div>
                <div>
                  <p className="text-white font-semibold text-xs leading-snug">{s.title}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 快速跳转 */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-white/30 text-xs self-center">跳转到：</span>
            {CHAPTERS.map(c => (
              <button key={c.id}
                onClick={() => { setOpenId(c.id); setTimeout(() => document.getElementById(`chapter-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
                className="text-xs bg-white/10 hover:bg-white/20 text-white/70 px-3 py-1.5 rounded-full transition-colors border border-white/10">
                {c.emoji} {c.title.replace(/第.步：/, "").slice(0, 10)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ 智能问答 */}
      <FAQBox />

      {/* 章节目录 */}
      <div>
        <p className="text-xs text-gray-400 mb-3 font-medium">📖 给宝妈的0成本跨境创业白皮书 · 共{CHAPTERS.length}章 · 全程大白话</p>
        <div className="space-y-3">
          {CHAPTERS.map((chapter) => {
            const isOpen = openId === chapter.id;
            return (
              <div key={chapter.id} id={`chapter-${chapter.id}`}
                className={`border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-indigo-200 shadow-md shadow-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>

                {/* 章节标题 */}
                <button onClick={() => setOpenId(isOpen ? null : chapter.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${isOpen ? "bg-indigo-50" : "bg-white hover:bg-gray-50"}`}>
                  <span className="text-2xl flex-shrink-0">{chapter.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{chapter.title}</h3>
                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0 ${chapter.badgeColor}`}>
                        {chapter.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{chapter.desc}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* 章节内容 */}
                {isOpen && (
                  <div className="bg-white border-t border-gray-100 divide-y divide-gray-50">
                    {chapter.steps.map((step, si) => {
                      const stepKey = `${chapter.id}-${si}`;
                      const isStepOpen = openStepId === stepKey;
                      return (
                        <div key={si}>
                          <button onClick={() => setOpenStepId(isStepOpen ? null : stepKey)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0">
                              {si + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{step.tip}</p>
                            </div>
                            <ChevronRight size={14} className={`text-gray-300 flex-shrink-0 transition-transform ${isStepOpen ? "rotate-90" : ""}`} />
                          </button>

                          {isStepOpen && (
                            <div className="px-5 pb-4 space-y-3 bg-gray-50/50">
                              {step.items.map((item, ii) => (
                                <div key={ii} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">{item.text}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部鼓励 */}
      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-sm font-bold text-gray-800 mb-1">你已经比99%的人更了解跨境了</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          知道不等于会做，迈出第一步才是关键。<br />
          注册Ozon，上传第一件商品，Crossly全程陪着你。
        </p>
      </div>

    </div>
  );
}
