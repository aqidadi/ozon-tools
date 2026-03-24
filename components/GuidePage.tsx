"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Store, TrendingUp, Package, Truck, Star, ExternalLink, Wrench, Globe, BarChart2 } from "lucide-react";

const GUIDES = [
  {
    id: "open-store",
    icon: <Store size={20} />,
    title: "如何在 Ozon 开店",
    color: "blue",
    sections: [
      {
        title: "开店前必读",
        content: [
          "Ozon 是俄罗斯最大电商平台之一，月活用户超 5000 万，竞争比速卖通小很多",
          "国内卖家以「境外法人」身份入驻，不需要俄罗斯公司，用中国营业执照即可",
          "结算币种：卢布，Ozon 每月两次打款，通过 SWIFT 转到你的外币账户",
          "新手建议先用 RFBS（跨境直发模式）测品，不需要提前备货",
          "平台语言：俄语。商品标题、描述必须用俄语，不能用中文",
        ],
      },
      {
        title: "注册步骤详解",
        content: [
          "1. 访问 seller.ozon.ru，点击「Стать продавцом」（成为卖家）",
          "2. 选择「Иностранное юридическое лицо」（境外法人）",
          "3. 填写公司名称（拼音即可）、注册地址、法人代表姓名",
          "4. 上传营业执照扫描件（需要英文翻译，翻译宝/CNKI翻译均可）",
          "5. 上传法人护照或身份证（正反面，需英文翻译）",
          "6. 填写银行账户信息（支持中国银行外币账户）",
          "7. 等待审核 1-5 个工作日",
          "8. 审核通过后充值广告预算（最低 500 卢布），上架商品",
        ],
      },
      {
        title: "仓储模式对比",
        content: [
          "RFBS（跨境直发）：中国发货→买家，时效15-35天，适合新手测款，无备货压力",
          "FBS（本地第三方仓）：发到俄罗斯第三方仓，时效2-5天，需提前备货",
          "FBO（Ozon官方仓）：发到Ozon仓，Ozon负责配送，时效最快，需最低库存",
          "新手必选 RFBS，跑通后再考虑 FBS/FBO",
          "RFBS 下单后 5 天内必须发货并上传物流追踪号，否则取消订单扣分",
        ],
      },
      {
        title: "平台费用明细",
        content: [
          "佣金：按类目4%-15%，玩具/动漫周边约8-12%，数码类约4-8%",
          "配送费：FBO模式下按重量和体积收取，跨境直发不收",
          "仓储费：FBO超期收费，标准品30天内免费，超期按天计费",
          "退货处理费：买家退货后Ozon会收取检验费",
          "广告费：按点击付费，自行设置预算，不投广告也能出单但慢",
          "提现手续费：SWIFT 转账约 0.5-1%，加上银行手续费约 100-300 元/次",
        ],
      },
      {
        title: "开店常见问题",
        content: [
          "Q：没有俄罗斯公司能开吗？ A：可以，境外法人模式",
          "Q：需要VAT税号吗？ A：跨境直发不需要，FBO模式建议办理",
          "Q：人民币能直接结算吗？ A：不能，Ozon结算卢布，需要外币账户换汇",
          "Q：账号被封怎么办？ A：联系Ozon中文客服（有微信群），说明情况申诉",
          "Q：可以开几个账号？ A：一个主体只能开一个，多开会封号",
        ],
      },
    ],
    links: [
      { text: "Ozon 卖家注册入口", url: "https://seller.ozon.ru" },
      { text: "Ozon 卖家帮助中心", url: "https://seller-edu.ozon.ru" },
      { text: "Ozon 费用计算器", url: "https://seller.ozon.ru/app/calculators" },
      { text: "Ozon 中文卖家社区", url: "https://t.me/ozon_sellers_cn" },
    ],
  },
  {
    id: "product-selection",
    icon: <TrendingUp size={20} />,
    title: "选品策略与爆品方法",
    color: "green",
    sections: [
      {
        title: "选品黄金标准",
        content: [
          "重量 ≤ 500g（跨境运费最经济，超重利润大幅压缩）",
          "体积小，不超过 30×20×10cm（节省包装成本）",
          "进价 ¥3-50，Ozon 售价 300-2000 卢布（约 ¥20-140）",
          "毛利率目标 ≥ 50%（刨除运费、佣金、广告后还有得赚）",
          "非易碎、非液体、非危险品（避免破损和海关麻烦）",
          "俄罗斯本地不容易买到，或比本地便宜 50% 以上",
          "有复购需求或可延伸品类（做成系列，一个用户买多件）",
        ],
      },
      {
        title: "找爆品的具体方法",
        content: [
          "方法1：看 Ozon 热销榜 — ozon.ru/bestsellers，按类目筛选，记录月销>500的商品",
          "方法2：看竞品店铺 — 找到一个爆款，点击卖家主页，看他还卖什么",
          "方法3：速卖通反向推导 — 速卖通月销1000+的商品，Ozon上大概率也有需求",
          "方法4：看1688销量榜 — 1688月销>10000的商品，考虑能否上Ozon",
          "方法5：用本工具 — 从Ozon热销页抓商品→中文翻译→1688找货→计算利润",
          "方法6：关注动漫新番 — 新番开播前2-3周备周边货，踩准时机能爆单",
          "方法7：节日选品日历 — 提前1个月备节日商品（见下面的节日表）",
        ],
      },
      {
        title: "俄罗斯重要节日选品日历",
        content: [
          "🎄 1月1日：新年 — 12月开始备货，装饰/礼盒/玩具",
          "💙 2月14日：情人节 — 1月备货，毛绒/首饰/香薰",
          "🪖 2月23日：祖国保卫者日（男人节）— 男性礼品/运动/电子配件",
          "🌺 3月8日：妇女节 ⭐全年最重要节日 — 2月开始备货，美妆/鲜花/首饰/毛绒",
          "🐣 4月：复活节 — 装饰/巧克力/礼篮",
          "🌟 6月1日：儿童节 — 玩具/文具/童装",
          "🛒 11月11日：双11 — Ozon也做，全品类",
          "🎁 12月：圣诞+新年 — 全年最大购物季，12月销量是平时2-3倍",
        ],
      },
      {
        title: "利润计算公式",
        content: [
          "总成本 = 进价 + 运费(克数×运费率) + 包装费",
          "最低售价(卢布) = 总成本(元) × 汇率 ÷ (1 - 佣金率)",
          "建议售价 = 最低售价 × 1.5（留广告、退货、波动空间）",
          "实际利润 = 售价 × (1-佣金) ÷ 汇率 - 总成本",
          "示例：进价¥5，重300g，运费¥7.5，包装¥2，汇率10，佣金12%",
          "成本=¥14.5，最低售价≈165卢布，建议售价250卢布，利润约¥6.5",
        ],
      },
      {
        title: "适合做的类目",
        content: [
          "✅ 动漫周边（手办/公仔/亚克力/抱枕）— 俄罗斯动漫迷多，溢价高",
          "✅ 棉花娃娃/盲盒 — 女性消费者最爱，复购率极高",
          "✅ 儿童玩具（毛绒/积木）— 需求稳定，客单价适中",
          "✅ 家居小物（收纳/创意厨具）— 大众需求，不受季节影响",
          "✅ 美妆工具（化妆刷/美容仪）— 俄罗斯女性消费力强",
          "✅ 手机配件（支架/数据线/充电宝）— 竞争大但需求永远有",
          "✅ 宠物用品 — 俄罗斯养宠物比例极高，增长快",
          "❌ 服装鞋帽 — 尺码退货率超高，慎入",
          "❌ 电子产品 — 认证复杂，售后麻烦，资金压力大",
          "❌ 食品保健品 — 海关检验严，极易扣货",
        ],
      },
    ],
    links: [
      { text: "Ozon 热销榜", url: "https://www.ozon.ru/bestsellers/" },
      { text: "1688 热销排行", url: "https://www.1688.com/huo/--B6B4C2CCB7C9D0D0B0F7.html" },
      { text: "速卖通畅销商品", url: "https://www.aliexpress.com/wholesale" },
    ],
  },
  {
    id: "listing",
    icon: <Package size={20} />,
    title: "商品上架与优化",
    color: "purple",
    sections: [
      {
        title: "俄语标题写法",
        content: [
          "格式：[品类关键词] [核心卖点] [规格/材质] [适用人群/场景]",
          "好标题示例：Мягкая игрушка кот Батон подушка антистресс 40см — 猫咪抱枕40cm",
          "好标题示例：Фигурка аниме Наруто ПВХ 15см коллекционная — 鸣人手办15cm",
          "前60字符最重要（搜索结果显示的长度）",
          "必须包含俄罗斯买家真实搜索词，用 Ozon 搜索联想验证",
          "不要堆砌关键词，会被算法降权",
          "可用 DeepL/本工具翻译后，再用 ChatGPT 优化俄语表达",
        ],
      },
      {
        title: "主图与详情图要求",
        content: [
          "主图：白底或浅色背景，商品占 75% 以上，最低 1000×1000px",
          "主图不能有文字水印、平台LOGO（Ozon严格审核）",
          "最少5张图：主图+4角度细节图+1尺寸对比图",
          "建议加生活场景图（商品使用中的样子，转化率提升30%+）",
          "尺寸图必须标注，俄罗斯买家很在意实际大小",
          "1688商家提供的图可以用，但要去掉中文水印",
          "去水印工具：watermarkremover.io（免费在线）",
        ],
      },
      {
        title: "商品描述要点",
        content: [
          "描述必须用俄语，可以用本工具翻译后人工检查",
          "必填：材质、尺寸（长宽高/重量）、包装内容物",
          "玩具类必填：适用年龄（3岁以下/以上）、安全认证",
          "加入FAQ：常见问题提前回答，减少买家咨询和差评",
          "描述不要夸大（如「最好的/第一的」），Ozon会处罚",
          "可以加表情符号让描述更易读（俄语买家接受度高）",
        ],
      },
      {
        title: "定价技巧",
        content: [
          "新品期定低价（接近成本线）冲量，积累评价后涨价",
          "设置促销价格（原价1000，促销价799）显示划线价，点击率+40%",
          "参考竞品定价，不要做最便宜的，定中间价显得更可信",
          "尾数定价：799卢布比800卢布转化率更高",
          "同款商品可以出不同规格套餐（单件/2件装/3件装），提升客单价",
        ],
      },
      {
        title: "Ozon 新品期规则",
        content: [
          "上架后14天是新品期，搜索排名有额外加权",
          "新品期内尽量保证每天有订单（哪怕亏本），维持活跃度",
          "前20个评价最关键，决定商品能否持续上升",
          "新品期结束后排名会下降，需要用广告维持曝光",
        ],
      },
    ],
    links: [
      { text: "Ozon 商品上架规范", url: "https://docs.ozon.ru/seller/en/" },
      { text: "DeepL 俄语翻译", url: "https://www.deepl.com/translator" },
      { text: "Canva 商品图设计", url: "https://www.canva.com" },
      { text: "去水印工具", url: "https://watermarkremover.io" },
    ],
  },
  {
    id: "operations",
    icon: <Star size={20} />,
    title: "店铺运营与广告",
    color: "orange",
    sections: [
      {
        title: "新品期运营策略",
        content: [
          "上架即开广告：「搜索广告」设置每天100-200卢布预算",
          "核心关键词：商品类名（俄语）+ 材质/尺寸 + 适用人群",
          "前7天重点看：点击率（>1%正常）、加购率（>5%正常）",
          "如果点击率低 → 换主图；如果加购率低 → 检查价格",
          "刷好评：可请真实买家购买后留评（违规风险低，但别批量刷）",
          "跟进发货：RFBS模式下订单5天内必须发货，否则取消扣分",
        ],
      },
      {
        title: "广告类型与策略",
        content: [
          "搜索广告（Трафаретная）：按关键词出价，最直接，新品必开",
          "展示广告（Медийная）：按曝光收费，适合做品牌认知",
          "商品促销广告（Продвижение товаров）：Ozon新出，按销售额收费",
          "ACoS目标：广告费/销售额，建议控制在15-25%以内",
          "每周优化：关掉不出单的关键词，加大出单关键词的预算",
          "大促前2周：提前加预算，大促期间流量是平时5-10倍",
        ],
      },
      {
        title: "评价管理",
        content: [
          "目标评分：4.5分以上，低于4.0会被降权",
          "所有差评都要回复，态度诚恳，说明处理方案",
          "包裹里放卡片：「好评返现/小礼品」引导留评（不违规）",
          "差评内容分析：是产品质量问题还是物流问题？分开处理",
          "物流慢差评：不可避免，回复说明跨境时效，提供补偿",
          "产品质量差评：联系1688换货源，或者改进包装防损",
        ],
      },
      {
        title: "参与平台活动",
        content: [
          "Ozon 全年大促：双11(11月)/元旦(1月)/妇女节(3月)/暑期(7月)",
          "参与方式：卖家后台「促销活动」报名，需要提前2-4周",
          "报名条件：设置活动价格（需比平时低10%+），库存充足",
          "活动期间流量暴增，提前备货，避免断货",
          "Ozon Premium（付费会员）：参与会员专属活动，流量更大",
        ],
      },
      {
        title: "数据分析要点",
        content: [
          "每日必看：订单量、广告花费、退货率",
          "每周必看：关键词排名变化、竞品价格变化、库存预警",
          "转化漏斗：曝光→点击→加购→下单，找每个环节的问题",
          "利润核算：每月做一次真实利润核算（别忘了广告费和汇损）",
        ],
      },
    ],
    links: [
      { text: "Ozon 广告投放指南", url: "https://seller-edu.ozon.ru/advertising" },
      { text: "Ozon 卖家数据分析后台", url: "https://seller.ozon.ru/app/analytics" },
    ],
  },
  {
    id: "logistics",
    icon: <Truck size={20} />,
    title: "物流与供应链",
    color: "teal",
    sections: [
      {
        title: "跨境直发（RFBS）推荐渠道",
        content: [
          "云途物流（YunExpress）：价格实惠，俄罗斯专线，追踪稳定 ⭐推荐",
          "燕文物流：老牌，俄罗斯小包专线，价格适中",
          "广东联邑：俄罗斯专线，时效较快",
          "4PX递四方：覆盖广，支持多种服务",
          "运费参考：500g以内 ¥15-25，1kg约 ¥30-45（视渠道和时效）",
          "时效：普通小包15-35天，特快小包7-15天（贵3-5倍）",
          "追踪号必须72小时内上传到Ozon系统",
        ],
      },
      {
        title: "备货到俄仓",
        content: [
          "头程物流公司推荐：菜鸟国际、递四方、出口易、万邑通",
          "海运：30-45天，费用约¥5-15/kg，适合大批量",
          "空运：7-15天，费用约¥25-45/kg，适合紧急补货",
          "俄罗斯清关：需要申报商品价值，建议如实申报，低报风险高",
          "注意：进入俄罗斯需要支付关税（进口税率约15-20%）",
          "第三方海外仓：可以用速卖通菜鸟仓或专业俄罗斯仓",
        ],
      },
      {
        title: "包装与标签要求",
        content: [
          "每件商品贴 Ozon 条形码标签（在卖家后台「商品标签」生成）",
          "RFBS模式：纸箱或气泡袋，加充气填充，防止运输挤压",
          "FBO模式：严格按Ozon包装规范，尺寸超标会被拒收",
          "易碎品：双层气泡膜，4个角重点保护",
          "包裹重量/尺寸如实填报，抽查不符会扣费",
        ],
      },
      {
        title: "退货处理",
        content: [
          "Ozon允许30天无理由退货，退货率是跨境卖家最大痛点",
          "RFBS退货：买家退回到Ozon本地仓，Ozon会转给你的代理或销毁",
          "退货率高（>5%）的原因：描述与实物不符、质量差、尺寸标注错",
          "降低退货率：主图真实不P太多图，尺寸图必须有，材质如实写",
          "申诉机制：如果退货是买家原因（说谎），可以申诉不退款",
        ],
      },
      {
        title: "供应链管理",
        content: [
          "1688找货：选择有「实力商家」标志的，看近30天销量和评价",
          "拿样：先拍一件测质量，满意再批量下单",
          "谈判：单量大可以谈价格，500件以上一般能砍10-20%",
          "备货量：参考月销量 × 2（覆盖跨境运输周期）",
          "质检：备货到国内仓时做质检，不合格品当场退换",
        ],
      },
    ],
    links: [
      { text: "云途物流官网", url: "https://www.yunexpress.cn" },
      { text: "燕文物流官网", url: "https://www.yanwen.com" },
      { text: "递四方物流", url: "https://www.4px.com" },
      { text: "1688 找货源", url: "https://www.1688.com" },
    ],
  },
  {
    id: "tools",
    icon: <Wrench size={20} />,
    title: "必备工具与软件推荐",
    color: "cyan",
    sections: [
      {
        title: "🛒 选品数据工具",
        content: [
          "本工具（ozon-tools）：1688→Ozon一键导入，利润计算，批量翻译 ⭐免费",
          "选品大师：Ozon选品数据分析，月销量/趋势/竞品，约¥199/月",
          "Seller Assistant App：Ozon卖家数据分析，有免费版",
          "Moneyplace.io：俄语Ozon分析工具，数据准，需翻墙",
          "MPStats.ru：俄罗斯本土数据工具，很准，需会俄语",
          "魔方格：跨境数据工具，支持Ozon，有免费版",
        ],
      },
      {
        title: "🌐 翻译工具",
        content: [
          "DeepL：俄语翻译最准确，强烈推荐 deepl.com，有免费版",
          "Google翻译：备用，准确率稍差但免费",
          "ChatGPT/Claude：优化俄语标题和描述，效果最好",
          "本工具翻译：批量翻译商品标题，支持8种语言 ⭐",
          "百度翻译APP：手机端扫图翻译俄语商品",
          "Yandex翻译：俄罗斯本土翻译，俄语细节更准",
        ],
      },
      {
        title: "🎨 图片处理工具",
        content: [
          "Canva：设计详情图/场景图，有大量模板，免费版够用 canva.com",
          "Remove.bg：一键抠图做白底图，免费 remove.bg",
          "Watermarkremover.io：去除1688商品图水印，免费",
          "美图秀秀/PicsArt：手机端修图，批量处理方便",
          "Photoshop：专业修图，需要订阅 ¥88/月",
          "Squoosh：图片压缩工具，不影响质量，在线免费 squoosh.app",
        ],
      },
      {
        title: "📦 ERP/店铺管理",
        content: [
          "店小秘（ECCANG）：支持Ozon，多平台订单管理，¥99起/月",
          "马帮ERP：老牌跨境ERP，功能全，适合有一定规模的卖家",
          "万里牛：国内老牌ERP，支持Ozon接入",
          "Ozon卖家后台：seller.ozon.ru 自带基础数据分析和订单管理",
          "新手阶段用Ozon自带后台就够，月销100单以内不需要ERP",
        ],
      },
      {
        title: "🚚 物流工具",
        content: [
          "17Track：全球物流追踪，支持俄罗斯所有物流 17track.net",
          "云途物流官网：yunexpress.cn（俄罗斯专线首选）",
          "燕文物流：yanwen.com（老牌小包）",
          "递四方4PX：4px.com（覆盖广）",
          "菜鸟国际：跨境物流，阿里旗下，和1688联动方便",
          "AfterShip：物流追踪+买家通知自动化",
        ],
      },
      {
        title: "💬 卖家社群",
        content: [
          "Ozon中文卖家Telegram群：搜「Ozon中文卖家」加群，资源最多",
          "闲鱼/微信群：很多老卖家分享经验，搜「Ozon卖家交流」",
          "知无不言：跨境电商论坛，有专门的俄罗斯电商板块 zhiwubuyan.com",
          "雨果网：跨境电商媒体，有Ozon专题内容 cifnews.com",
          "跨境知道：视频教程多，B站有大量免费课程",
        ],
      },
      {
        title: "💰 收款与汇率",
        content: [
          "PingPong：跨境收款，支持卢布→人民币，手续费1% pingpongx.com",
          "连连支付：Ozon官方推荐收款，手续费约1% lianlianpay.com",
          "万里汇（WorldFirst）：老牌跨境收款，汇率好 worldfirst.com",
          "招商银行：外币账户，SWIFT收款，汇率透明",
          "注意：卢布波动大，建议及时换汇，不要囤卢布",
        ],
      },
    ],
    links: [
      { text: "DeepL 翻译", url: "https://www.deepl.com" },
      { text: "Canva 设计", url: "https://www.canva.com" },
      { text: "Remove.bg 抠图", url: "https://www.remove.bg" },
      { text: "17Track 物流追踪", url: "https://www.17track.net" },
      { text: "PingPong 收款", url: "https://www.pingpongx.com" },
      { text: "知无不言论坛", url: "https://www.zhiwubuyan.com" },
    ],
  },
  {
    id: "analytics-guide",
    icon: <BarChart2 size={20} />,
    title: "数据分析与进阶运营",
    color: "rose",
    sections: [
      {
        title: "核心数据指标",
        content: [
          "曝光量（Показы）：你的商品被多少人看到，主要受搜索排名影响",
          "点击率（CTR）：曝光→点击的比例，正常值1-5%，低说明主图不吸引人",
          "加购率：点击→加购比例，低说明价格或详情页有问题",
          "转化率（Конверсия）：加购→下单比例，正常3-10%",
          "退货率：低于5%为优秀，超过10%需要立即整改",
          "ACoS：广告费/广告销售额，目标15-25%",
        ],
      },
      {
        title: "搜索排名提升方法",
        content: [
          "销量是最大权重：销量越高排名越靠前，形成正循环",
          "评分权重：4.5分以上有加权，低于4.0会被惩罚",
          "关键词相关性：标题和描述里必须包含核心搜索词",
          "点击率：主图好看→点击多→排名上升",
          "广告可以间接提升排名（广告带来销量，销量提升自然排名）",
          "完播率/浏览时长：详情页做得好，买家看得久，有加权",
        ],
      },
      {
        title: "竞品分析方法",
        content: [
          "找到竞品：Ozon搜索你的类目，按「销量排序」，看前5名",
          "分析竞品：主图风格、定价、评价内容、关键词",
          "看竞品差评：找到买家最不满意的点，你的商品避免这些问题",
          "看竞品好评：找到买家最喜欢的点，你的详情页重点强调",
          "价格跟踪：记录竞品价格变化，大促前后对比",
          "MPStats/Moneyplace 可以看竞品的历史销量曲线",
        ],
      },
      {
        title: "账号健康度管理",
        content: [
          "Ozon会评分你的账号：发货准时率、退货率、差评率",
          "发货准时率必须>95%（RFBS模式5天内必须发货）",
          "差评率必须<5%，超过会被限制推广",
          "账号评分高的卖家，同等条件下搜索排名更高",
          "不要尝试刷单、刷评（Ozon AI检测很强），封号损失惨重",
        ],
      },
    ],
    links: [
      { text: "Ozon 卖家数据后台", url: "https://seller.ozon.ru/app/analytics" },
      { text: "MPStats 俄语数据工具", url: "https://mpstats.ru" },
      { text: "Moneyplace 分析工具", url: "https://moneyplace.io" },
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
};

export function GuidePage() {
  const [openGuide, setOpenGuide] = useState<string | null>("open-store");
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Ozon 跨境电商完全指南</h2>
        </div>
        <p className="text-sm text-gray-500">从零开始做 Ozon，系统学习开店、选品、运营、物流、工具全流程</p>
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
        <p className="text-sm font-semibold text-indigo-800 mb-2">🚀 新手推荐路线</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["注册Ozon账号", "→ 1688找3-5款测品", "→ 用本工具计算利润", "→ 上架RFBS模式", "→ 开搜索广告", "→ 积累评价", "→ 找到爆款备货"].map((s, i) => (
            <span key={i} className={`px-2 py-1 rounded-lg ${i === 0 || s.startsWith("→") ? "bg-white border border-indigo-100 text-indigo-700" : ""}`}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
