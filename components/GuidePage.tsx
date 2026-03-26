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
          "🛒 Ozon（俄罗斯）：月活5000万+，竞争小，中国卖家少，溢价高，强烈推荐新手",
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
          "6. 上架商品（俄语标题必须），开搜索广告，开始跑单",
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
          "Ozon爆品：动漫周边/棉花娃娃/儿童玩具/家居小物（单价300-2000卢布）",
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
          "Ozon（俄语）：Мягкая игрушка кот 40см антистресс подушка — 猫咪抱枕40cm",
          "亚马逊（英语）：Anime Figure Naruto PVC 15cm Collectible Action Figure Toy",
          "TikTok/Shopee：简短直白，突出价格优势和卖点，「超可爱」「爆款」「限时」",
          "翻译工具：DeepL（俄语最准）、ChatGPT（优化表达）、本工具（批量翻译）",
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
          "新品期14天：开搜索广告（100-200卢布/天），快速积累评价",
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
          "Yandex翻译：俄语最准（俄罗斯本土），translate.yandex.com",
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
          "实时汇率参考：xe.com（美元/卢布/泰铢等）",
          "建议：收款后及时换汇，别囤外币（尤其卢布波动大）",
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
          "Ozon竞品分析：MPStats.ru（俄语）、Moneyplace.io",
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

export function GuidePage() {
  const [openGuide, setOpenGuide] = useState<string | null>("platforms");
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* 置顶：0基础新手卡 */}
      <div className="rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e2d5a 0%, #2d1b69 60%, #0f172a 100%)" }}>
        <div className="p-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-white/20">
            🎯 完全免费 · 0门槛入门
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            跨境不难，真的。
          </h2>
          <p className="text-white/60 text-sm mb-5 leading-relaxed">
            很多人觉得跨境很复杂、很神秘，其实核心只有3件事。<br />
            我们手把手教你，不卖课，不收费，看完就会。
          </p>

          {/* 3步 */}
          <div className="space-y-3">
            {[
              { n: "1", title: "在1688找到一个卖得好的商品", detail: "看月销量>1000，价格<30元，体积小重量轻（省运费）", color: "#6366f1" },
              { n: "2", title: "用Crossly一键导入，自动翻译定价", detail: "插件抓图、AI翻译俄文、系统自动算卢布售价，30秒搞定", color: "#8b5cf6" },
              { n: "3", title: "点发布，等收钱", detail: "商品自动上架Ozon，货代收货发货，你只需要在1688下单", color: "#a855f7" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3 bg-white/5 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-black"
                  style={{ background: s.color }}>
                  {s.n}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{s.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部快速导航 */}
        <div className="border-t border-white/10 px-6 py-4 flex flex-wrap gap-2">
          <span className="text-white/40 text-xs self-center mr-2">快速跳转：</span>
          {[
            { label: "📦 我要做Ozon", id: "ozon-start" },
            { label: "🔍 怎么选品", id: "select" },
            { label: "✈️ 物流怎么做", id: "logistics" },
            { label: "💰 怎么定价", id: "pricing" },
          ].map(link => (
            <button key={link.id}
              onClick={() => setOpenGuide(link.id)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1.5 rounded-full transition-colors border border-white/10">
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ 智能问答 */}
      <FAQBox />

      {/* 页面标题 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">跨境电商完全免费指南</h2>
        </div>
        <p className="text-sm text-gray-400">覆盖 Ozon / 亚马逊 / TikTok Shop / Shopee，从0到第一单，全程免费教学</p>
      </div>

      <div className="space-y-3">
        {GUIDES.map((guide) => {
          const colors = COLOR_MAP[guide.color];
          const isOpen = openGuide === guide.id;

          return (
            <div key={guide.id} className={`border rounded-xl overflow-hidden ${isOpen ? colors.border : "border-gray-200"}`}>
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

                  {guide.links.length > 0 && (
                    <div className="px-4 py-3 flex flex-wrap gap-2 bg-gray-50">
                      <span className="text-xs text-gray-400 self-center mr-1">相关链接：</span>
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

      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5">
        <p className="text-sm font-semibold text-indigo-800 mb-2">🚀 新手推荐路线（Ozon起步）</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["注册Ozon账号", "→ 1688找3-5款", "→ 用Crossly算利润", "→ RFBS直发上架", "→ 开搜索广告", "→ 积累评价", "→ 爆款备货扩平台"].map((s, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-white border border-indigo-100 text-indigo-700">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 工具导航 ──────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  {
    id: "learn",
    emoji: "📚",
    title: "学习平台",
    color: "blue",
    tools: [
      { name: "AMZ123", desc: "东南亚卖家导航，整合卖家常用网站工具", url: "https://www.amz123.com" },
      { name: "雨果网", desc: "跨境综合资讯平台，集热门跨境平台资讯", url: "https://www.cifnews.com" },
      { name: "Shopee大学", desc: "Shopee官方学习平台，指引新手运营", url: "https://sellercenter.shopee.cn" },
      { name: "Lazada大学", desc: "Lazada官方学习平台，免费运营课程", url: "https://university.lazada.com" },
      { name: "得果果课堂", desc: "东南亚跨境电商学习平台，很多卖家在用", url: "https://www.deiguoguo.com" },
    ],
  },
  {
    id: "translate",
    emoji: "🌐",
    title: "语言翻译",
    color: "green",
    tools: [
      { name: "DeepL", desc: "翻译效果最自然，目前最佳付费翻译软件", url: "https://www.deepl.com", stars: 5 },
      { name: "微软翻译", desc: "支持多国语言文字/图片/截图翻译", url: "https://www.bing.com/translator", stars: 3 },
      { name: "有道翻译", desc: "基于搜索引擎，全文翻译、网页翻译", url: "https://fanyi.youdao.com", stars: 3 },
      { name: "沉浸式翻译", desc: "网页翻译插件，原译文对照，支持PDF/视频字幕", url: "https://immersivetranslate.com", stars: 5 },
      { name: "Google翻译", desc: "跨境卖家常用，在线翻译28门语言", url: "https://translate.google.com", stars: 4 },
    ],
  },
  {
    id: "data",
    emoji: "📊",
    title: "数据分析",
    color: "purple",
    tools: [
      { name: "知虾", desc: "Shopee/Lazada东南亚电商数据平台，监控竞店查关键词", url: "https://www.zhi-xia.com", stars: 4 },
      { name: "卖家精灵", desc: "亚马逊选品、市场分析、关键词优化、产品监控", url: "https://www.sellersprite.com", stars: 5 },
      { name: "PPSPY", desc: "Shopify店铺分析，快速了解竞争对手畅销产品", url: "https://ppspy.com", stars: 3 },
      { name: "Similarweb", desc: "网站流量分析，查排名、流量来源、社交属性", url: "https://www.similarweb.com", stars: 4 },
      { name: "EchoTik", desc: "TikTok Shop数据工具，看周销/月销/店铺排名/KOL", url: "https://echotik.live", stars: 3 },
      { name: "Tichoo", desc: "全球视频电商数据分析平台", url: "https://www.tichoo.com", stars: 3 },
    ],
  },
  {
    id: "image",
    emoji: "🎨",
    title: "图库 & 做图",
    color: "orange",
    tools: [
      { name: "创客贴", desc: "模板轻松设计产品海报、主图，可制作简单视频", url: "https://www.chuangkit.com", stars: 4 },
      { name: "稿定设计", desc: "在线做不同场景尺寸的产品图", url: "https://www.gaoding.com", stars: 4 },
      { name: "Removebg", desc: "一键抠图，虚化或替换背景", url: "https://www.remove.bg", stars: 4 },
      { name: "waifu2x", desc: "商品图模糊？无损放大及降噪处理", url: "http://waifu2x.udp.jp", stars: 5 },
      { name: "Pixabay", desc: "百万张免费图片素材，CC0协议可商用，支持中文搜索", url: "https://pixabay.com", stars: 4 },
      { name: "Pexels", desc: "高质量免费图片，CC0许可，风格简约素材丰富", url: "https://www.pexels.com", stars: 4 },
      { name: "Fotor懒设计", desc: "超2亿张免费图片，在线图片制作", url: "https://www.fotor.com/cn", stars: 4 },
    ],
  },
  {
    id: "erp",
    emoji: "⚙️",
    title: "ERP & 运营工具",
    color: "red",
    tools: [
      { name: "妙手ERP", desc: "Shopee/Lazada主流ERP，提供链接采集/全店采集/插件采集", url: "https://www.miaoshousoft.com", stars: 4 },
      { name: "店小秘", desc: "用户超10万，产品刊登/打单发货/数据采集/店铺搬家", url: "https://www.dianxiaomi.com", stars: 5 },
      { name: "芒果店长", desc: "网页版ERP，注册登录即可用，登量百度搜索芒果店长", url: "https://www.mangoerp.com", stars: 3 },
      { name: "通途Ton", desc: "采购/订单/发货/仓库/售后一站式智能自动化管理", url: "https://www.tongtool.com", stars: 3 },
      { name: "萌店长ERP", desc: "Shopee/Lazada上货ERP工具，限时免费", url: "https://www.mengdianz.com", stars: 3 },
    ],
  },
  {
    id: "file",
    emoji: "🔧",
    title: "效率工具",
    color: "gray",
    tools: [
      { name: "Filemail", desc: "大文件传输，直接发到email通过链接下载，跨境传输方便", url: "https://www.filemail.com" },
      { name: "AwesomeScreenshot", desc: "强大截图软件，截取整个页面，可做标注", url: "https://www.awesomescreenshot.com" },
      { name: "Linktree", desc: "多链接合成平台，中间页工具", url: "https://linktr.ee" },
      { name: "Bitly", desc: "短链生成平台", url: "https://bitly.com" },
      { name: "Namecheap", desc: "域名注册服务商，价格便宜", url: "https://www.namecheap.com" },
    ],
  },
  {
    id: "customs",
    emoji: "🚢",
    title: "海关数据",
    color: "indigo",
    tools: [
      { name: "ImportGenius", desc: "全球进出口数据查询平台", url: "https://www.importgenius.com" },
      { name: "ImportYeti", desc: "美国进口提单数据查询，免费", url: "https://www.importyeti.com" },
      { name: "Panjiva", desc: "全球贸易智能分析工具", url: "https://panjiva.com" },
      { name: "TradeAtlas", desc: "进出口商搜索引擎", url: "https://www.tradeatlas.com" },
      { name: "Trade Map", desc: "国际贸易地图，ITC出品免费", url: "https://www.trademap.org" },
      { name: "WITS", desc: "世界银行贸易数据库", url: "https://wits.worldbank.org" },
      { name: "UN Comtrade", desc: "联合国商品贸易统计数据库", url: "https://comtradeplus.un.org" },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  green: "bg-green-50 border-green-100 text-green-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  red: "bg-red-50 border-red-100 text-red-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
  indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  teal: "bg-teal-50 border-teal-100 text-teal-700",
  cyan: "bg-cyan-50 border-cyan-100 text-cyan-700",
  pink: "bg-pink-50 border-pink-100 text-pink-700",
  yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
  rose: "bg-rose-50 border-rose-100 text-rose-700",
};

export function ToolsPage() {
  const [openId, setOpenId] = useState<string | null>("learn");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧰</span>
        <div>
          <h2 className="text-base font-bold text-gray-800">实用工具导航</h2>
          <p className="text-xs text-gray-400">跨境电商必备工具整理，点击直达</p>
        </div>
      </div>

      {TOOL_CATEGORIES.map(cat => {
        const isOpen = openId === cat.id;
        const colorCls = colorMap[cat.color] || colorMap.gray;
        return (
          <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-sm font-semibold text-gray-800">{cat.title}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cat.tools.length}个工具</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-3 space-y-2">
                {cat.tools.map(tool => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start justify-between p-2.5 rounded-lg border ${colorCls} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{tool.name}</span>
                        {(tool as { stars?: number }).stars && (
                          <span className="text-yellow-400 text-[10px]">{"★".repeat((tool as { stars?: number }).stars!)}</span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-75 mt-0.5 leading-tight">{tool.desc}</p>
                    </div>
                    <ExternalLink size={11} className="flex-shrink-0 mt-0.5 ml-2 opacity-50" />
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <AdBanner slot="guide-tools" size="banner" />
    </div>
  );
}
