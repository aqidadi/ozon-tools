import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// 预设FAQ知识库（用于快速匹配，不消耗token）
const FAQ_KB = [
  {
    keywords: ["运费", "物流", "rets", "发货", "配送", "快线"],
    answer: `**Ozon 新手推荐「RETS快线」物流模板 🚀**

**为什么选RETS？**
- ⏱️ 时效：5-10个工作日到俄罗斯
- 💰 费用：约35-60元/件（400g以内）
- ✅ 稳定：Ozon官方合作，不怕丢件

**一键复制设置模板：**
1. Ozon后台 → 物流 → 仓库设置
2. 备货时间：选「5个工作日」（给自己留够时间）
3. 配送方案：选「RETS跨境快线」
4. 退货处理：选「在俄罗斯销毁」（避免退货运费坑）
5. 保存模板，所有商品共用这个设置

**小白保命原则：** 备货时间宁长勿短，宁可客户多等几天，也不要因为备货来不及被差评！`,
  },
  {
    keywords: ["选品", "卖什么", "爆款", "热销", "什么商品"],
    answer: `**Ozon 新手选品公式 🎯**

**黄金选品标准（记住这5个）：**
1. 1688价格 < 30元
2. 重量 < 500g（运费低）
3. 月销量 > 1000件（有市场验证）
4. 不易碎、不液体（不怕运损）
5. Ozon上竞争对手 < 50个（蓝海）

**2024最好卖品类：**
- 🧸 毛绒玩具（俄罗斯人超爱）
- 💄 美妆工具（睫毛夹/卷发棒）
- 🏠 家居小物（收纳盒/硅胶垫）
- 🎮 手机配件（数据线/支架）
- 🌸 节日礼品（3月8日妇女节爆单）

**快速验证方法：**
去Ozon搜这个词，看销量和评价数，评价多说明需求真实。`,
  },
  {
    keywords: ["注册", "开户", "开店", "入驻", "申请"],
    answer: `**Ozon 开店注册全流程（约3-7天）📋**

**准备材料：**
- 营业执照（个体工商户即可，200元办理）
- 法人身份证正反面
- 银行卡（对公账户）
- 手机号（接验证码）

**注册步骤：**
1. 访问 seller.ozon.ru → 点「注册卖家」
2. 填写公司信息（可用个体工商户）
3. 上传营业执照和身份证
4. 等待审核（1-3个工作日）
5. 审核通过后签署合同（电子合同）
6. 充值保证金（约1000-3000元，视品类）

**小白避坑：**
- ❌ 不要用个人身份证注册（后续提现麻烦）
- ✅ 先办个体工商户再注册（手续费200元值得）
- 审核期间可以先准备商品图片和俄文标题`,
  },
  {
    keywords: ["定价", "利润", "价格", "怎么算", "汇率", "卢布"],
    answer: `**Ozon 定价公式（不亏钱版）💰**

**保本价公式：**
\`\`\`
Ozon售价(₽) = (采购价 + 运费 + 包材) × 汇率 ÷ (1 - 佣金率)
\`\`\`

**实际例子（毛绒玩具）：**
- 采购价：¥17.5
- 头程运费：¥25
- 包材：¥2
- 合计成本：¥44.5
- 换算卢布（×13）：₽578
- ÷(1-15%佣金)：₽680 = 保本价
- **建议售价：₽800-900**（利润率约25%）

**黄金法则：**
- 佣金按15%算（保守估计）
- 汇率按12-13算（留缓冲）
- 售价 > 保本价 × 1.3 才下单
- 新品先定高价，稳定后再调`,
  },
  {
    keywords: ["货代", "仓库", "转运", "义乌", "发货地址"],
    answer: `**义乌货代操作指南（宝妈版）🏭**

**推荐流程：**
1. 在1688下单，**收货地址填义乌货代仓**
2. 货代收到货后贴上Ozon标签
3. 货代统一发往Ozon俄罗斯仓库
4. 你全程不用碰快递！

**怎么找靠谱货代？**
- 搜「义乌Ozon货代」
- 要求：支持上门取货/代收货 + 帮贴Ozon标签
- 价格：约35-55元/kg（含头程运费）
- 建议先试发1-3件，验证靠谱再批量

**下单地址模板：**
收件人：[货代公司名] - [你的客户编号]
地址：义乌市[货代具体地址]
电话：[货代联系电话]

**注意：** 每次在1688下单前，先联系货代确认仓库地址是否变动！`,
  },
  {
    keywords: ["图片", "主图", "详情图", "P图", "翻译图片"],
    answer: `**Ozon 商品图片要求（新手必看）🖼️**

**主图要求：**
- 白底（强烈建议）或浅色背景
- 尺寸：至少900×1200像素（3:4比例）
- 商品占图片面积 > 70%
- 不能有水印、不能有中文
- 最多上传15张主图

**怎么处理图片（免费方案）：**
1. 用Crossly插件一键抓取1688主图
2. 点「俄化」按钮，AI自动添加俄文标题
3. 发布时系统自动上传到Ozon

**超简单去中文方法：**
- 进 remove.bg 免费去背景
- 或者直接选白底商品图（1688很多卖家有白底图）
- 有中文水印的图直接不用，换下一张

**详情图建议：**
- 上传10-20张（越多越好）
- 包含：尺寸图、材质图、使用场景图
- 用Crossly插件滚动页面后重新识别可抓到详情图`,
  },
];

function matchFAQ(question: string) {
  const q = question.toLowerCase();
  for (const item of FAQ_KB) {
    if (item.keywords.some(k => q.includes(k))) {
      return item.answer;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { question } = await req.json().catch(() => ({ question: "" }));
  if (!question?.trim()) {
    return NextResponse.json({ error: "请输入问题" }, { status: 400, headers: CORS });
  }

  // 先查本地知识库
  const localAnswer = matchFAQ(question);
  if (localAnswer) {
    return NextResponse.json({ answer: localAnswer, source: "kb" }, { headers: CORS });
  }

  // 本地没有，调 DeepSeek
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY || "sk-e8f1e6eb4be646b99c31686d5bd7bfe1"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是Crossly跨境电商平台的新手指导老师，专门帮助完全0基础的普通人（宝妈、大学生、上班族）学习做跨境电商。

回答要求：
1. 不超过300字
2. 必须有具体操作步骤（1、2、3...）
3. 用emoji让内容更生动
4. 语气亲切，像朋友说话，不要说教
5. 专注于Ozon（俄罗斯）平台，因为这是最适合新手的平台
6. 如果涉及费用，给出实际数字
7. 末尾加一句鼓励的话

背景知识：
- Crossly是一个免费的跨境工具，帮用户从1688一键上架到Ozon
- 目标用户是完全没有跨境经验的普通人
- 物流推荐RETS快线（5-10天，稳定）
- 备货时间默认5天，退货默认销毁`
          },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (answer) {
      return NextResponse.json({ answer, source: "ai" }, { headers: CORS });
    }
  } catch {}

  return NextResponse.json({
    answer: "抱歉，暂时无法回答这个问题。你可以在新手指南里找到相关内容，或者联系我们的客服。",
    source: "fallback"
  }, { headers: CORS });
}
