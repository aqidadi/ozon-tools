import * as XLSX from "xlsx";
import { Product, Settings, calcCost, getSellPrice, getPlatform, LANGUAGES } from "./types";

// 1688 类目 → Ozon 类目映射（Top 50 品类）
const CATEGORY_MAP: Record<string, string> = {
  // 服装配件
  "女装": "Женская одежда",
  "男装": "Мужская одежда",
  "童装": "Детская одежда",
  "内衣": "Нижнее бельё",
  "运动服": "Спортивная одежда",
  "连衣裙": "Платья",
  "T恤": "Футболки",
  "裤子": "Брюки",
  "外套": "Куртки и пальто",
  "羽绒服": "Пуховики",
  // 鞋靴
  "运动鞋": "Кроссовки",
  "凉鞋": "Сандалии",
  "高跟鞋": "Туфли",
  "靴子": "Сапоги",
  "拖鞋": "Тапочки",
  // 配饰
  "帽子": "Головные уборы",
  "围巾": "Шарфы",
  "手套": "Перчатки",
  "腰带": "Ремни",
  "首饰": "Ювелирные украшения",
  "手表": "Часы",
  "太阳镜": "Солнцезащитные очки",
  // 箱包
  "女包": "Женские сумки",
  "男包": "Мужские сумки",
  "背包": "Рюкзаки",
  "行李箱": "Чемоданы",
  // 美妆个护
  "护肤品": "Уход за кожей лица",
  "彩妆": "Декоративная косметика",
  "洗发水": "Шампуни",
  "沐浴露": "Гели для душа",
  "香水": "Парфюмерия",
  "美发工具": "Инструменты для укладки",
  // 家居生活
  "床上用品": "Постельное бельё",
  "厨具": "Кухонная утварь",
  "收纳": "Системы хранения",
  "装饰品": "Декор для дома",
  "毛巾": "Полотенца",
  "地毯": "Ковры",
  // 3C数码
  "手机壳": "Чехлы для телефонов",
  "数据线": "Кабели",
  "耳机": "Наушники",
  "充电器": "Зарядные устройства",
  "蓝牙音箱": "Bluetooth-колонки",
  "移动电源": "Внешние аккумуляторы",
  // 运动户外
  "瑜伽用品": "Йога",
  "健身器材": "Тренажёры",
  "户外用品": "Товары для отдыха",
  // 母婴
  "玩具": "Игрушки",
  "婴儿用品": "Товары для малышей",
  // 宠物
  "宠物用品": "Товары для животных",
};

function guessOzonCategory(title: string): string {
  for (const [zh, ru] of Object.entries(CATEGORY_MAP)) {
    if (title.includes(zh)) return ru;
  }
  return "Прочее"; // 其他
}

export function exportToExcel(products: Product[], settings: Settings) {
  const wb = XLSX.utils.book_new();
  const platform = getPlatform(settings.platformCode);
  const sym = platform.symbol;

  // === Sheet 1: 成本分析 ===
  const costRows = products.map((p) => {
    const cost = calcCost(p, settings);
    const sellPriceLocal = getSellPrice(p, settings.platformCode);
    return {
      "商品名称（中文）": p.title,
      "商品名称（译文）": p.titleRu || p.titleEn || "",
      "1688进价（元）": p.price,
      "重量（克）": p.weight,
      "运费（元）": cost.shippingCost.toFixed(2),
      "包装费（元）": cost.packagingCost.toFixed(2),
      "平台佣金（元）": cost.platformFee.toFixed(2),
      "总成本（元）": cost.totalCost.toFixed(2),
      [`售价（${platform.label}）`]: sellPriceLocal || "",
      "售价折合人民币": sellPriceLocal ? cost.sellPriceCny.toFixed(2) : "",
      "利润（元）": sellPriceLocal ? cost.profit.toFixed(2) : "",
      "利润率": sellPriceLocal ? `${cost.profitRate.toFixed(1)}%` : "",
      [`保本最低售价（${platform.label}）`]: cost.minSellPrice,
      "目标平台": platform.platform,
      "备注": p.note || "",
      "1688链接": p.sourceUrl || "",
    };
  });

  const wsCost = XLSX.utils.json_to_sheet(costRows);
  wsCost["!cols"] = [
    { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCost, "成本分析");

  // === Sheet 2: Ozon 完整上架模板 ===
  if (settings.platformCode === "RUB") {
    const ozonRows = products.map((p) => {
      const cost = calcCost(p, settings);
      const sellPrice = getSellPrice(p, "RUB") || Math.ceil(cost.minSellPrice * 1.3);
      const oldPrice = Math.ceil(sellPrice * 1.5); // 原价 = 售价×1.5，显示折扣
      // 物流重量加 15% 损耗
      const weightWithMargin = Math.ceil((p.weight || 500) * 1.15);
      // 图片：主图 + 详情图（最多9张）
      const allImages = [...(p.images || []), ...(p.detailImages || [])].slice(0, 9);
      // 规格参数拼接
      const specsStr = p.specs
        ? Object.entries(p.specs).map(([k,v])=>`${k}: ${v}`).join(" | ")
        : "";
      // Ozon 简单富文本描述
      const richDesc = p.titleRu || p.title;

      return {
        // ── 基础信息 ──
        "Название товара": p.titleRu || p.title,
        "Артикул (货号)": `1688-${p.id.slice(0, 8)}`,
        "Категория (类目)": guessOzonCategory(p.title),
        "Бренд": "No Brand",
        "Страна изготовитель": "Китай",
        // ── 价格 ──
        "Цена, руб. (售价)": sellPrice,
        "Старая цена, руб. (原价)": oldPrice,
        "НДС, % (增值税)": 0,
        // ── 物流（重量含15%损耗） ──
        "Вес в упаковке, г (重量g)": weightWithMargin,
        "Ширина упаковки, мм (宽mm)": p.specs?.["宽"] ? parseInt(p.specs["宽"]) * 10 : 150,
        "Высота упаковки, мм (高mm)": p.specs?.["高"] ? parseInt(p.specs["高"]) * 10 : 100,
        "Глубина упаковки, мм (深mm)": p.specs?.["长"] ? parseInt(p.specs["长"]) * 10 : 100,
        // ── 图片 ──
        "Ссылка на главное фото (主图)": p.images?.[0] || "",
        "Ссылки на фото 2-9 (副图)": allImages.slice(1).join(" ; "),
        // ── 描述 ──
        "Описание (描述)": richDesc,
        "Характеристики (规格)": specsStr,
        // ── 库存 ──
        "Количество (库存数)": 99,
        // ── 参考信息 ──
        "1688链接": p.sourceUrl || "",
        "中文名称": p.title,
        "进价(元)": p.price,
        "利润(元)": cost.profit.toFixed(2),
        "利润率": `${cost.profitRate.toFixed(1)}%`,
        "保本价(₽)": Math.ceil(cost.minSellPrice),
      };
    });

    const wsOzon = XLSX.utils.json_to_sheet(ozonRows);
    wsOzon["!cols"] = [
      { wch: 50 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 14 }, { wch: 16 }, { wch: 10 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
      { wch: 60 }, { wch: 80 },
      { wch: 50 }, { wch: 50 },
      { wch: 12 },
      { wch: 40 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsOzon, "Ozon上架模板");

    // === Sheet 3: Ozon 说明 ===
    const guide = [
      ["字段说明", "操作提示"],
      ["Название товара", "俄语商品标题，已由 Crossly 翻译，可手动修改"],
      ["Артикул", "货号，系统自动生成，无需修改"],
      ["Категория", "已根据商品名自动匹配，请核对后修改"],
      ["Цена", "售价（卢布），已按利润计算器结果填入"],
      ["Старая цена", "原价 = 售价×1.5，Ozon 会显示折扣标签，吸引点击"],
      ["НДС", "跨境卖家填 0，无需缴纳俄罗斯增值税"],
      ["Вес", "重量已自动增加 15% 损耗，防止预估偏低亏运费"],
      ["尺寸字段", "如 1688 详情页有尺寸数据会自动填入，否则请手动填写"],
      ["主图/副图", "直接使用 1688 图片链接，上传时需确保图片可访问"],
      ["Количество", "库存默认填 99，按实际库存修改"],
      ["上传方法", "登录 seller.ozon.ru → 商品 → 导入 → 上传此 Excel 文件"],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet(guide);
    wsGuide["!cols"] = [{ wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, "填写说明");

  } else {
    // 通用模板（Shopee / Amazon / TikTok 等）
    const generalRows = products.map((p) => {
      const cost = calcCost(p, settings);
      const sellPriceLocal = getSellPrice(p, settings.platformCode) || cost.minSellPrice;
      return {
        "商品名称": p.titleEn || p.titleRu || p.title,
        "中文名称": p.title,
        "SKU": `1688-${p.id.slice(0, 8)}`,
        [`售价（${sym}）`]: sellPriceLocal,
        [`保本最低售价（${sym}）`]: cost.minSellPrice,
        "进价（元）": p.price,
        "利润（元）": sellPriceLocal > 0 ? cost.profit.toFixed(2) : "",
        "利润率": sellPriceLocal > 0 ? `${cost.profitRate.toFixed(1)}%` : "",
        "重量（克）": p.weight,
        "平台": platform.platform,
        "图片1": p.images[0] || "",
        "图片2": p.images[1] || "",
        "图片3": p.images[2] || "",
        "1688链接": p.sourceUrl || "",
        "备注": p.note || "",
      };
    });
    const wsGeneral = XLSX.utils.json_to_sheet(generalRows);
    wsGeneral["!cols"] = [
      { wch: 50 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
      { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 40 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsGeneral, `${platform.platform}上架模板`);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `crossly_${platform.code.toLowerCase()}_${dateStr}.xlsx`);
}
