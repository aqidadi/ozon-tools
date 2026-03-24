import * as XLSX from "xlsx";
import { Product, Settings, calcCost, getSellPrice, getPlatform, LANGUAGES } from "./types";

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

  // === Sheet 2: 平台上架模板（根据平台生成不同字段） ===
  if (settings.platformCode === "RUB") {
    // Ozon 模板
    const ozonRows = products.map((p) => {
      const cost = calcCost(p, settings);
      const sellPrice = getSellPrice(p, "RUB") || cost.minSellPrice;
      return {
        "Название товара": p.titleRu || p.title,
        "Артикул": `1688-${p.id.slice(0, 8)}`,
        "Цена, руб.": sellPrice,
        "НДС, %": 0,
        "Вес в упаковке, г": p.weight || 500,
        "Ширина упаковки, мм": 150,
        "Высота упаковки, мм": 100,
        "Глубина упаковки, мм": 100,
        "Количество": 10,
        "Ссылки на фото": p.images.slice(0, 3).join("; "),
        "Описание": p.titleRu || p.title,
        "Бренд": "No Brand",
        "Страна изготовитель": "Китай",
        "1688链接（参考）": p.sourceUrl || "",
        "中文名称（参考）": p.title,
      };
    });
    const wsOzon = XLSX.utils.json_to_sheet(ozonRows);
    wsOzon["!cols"] = [
      { wch: 50 }, { wch: 20 }, { wch: 12 }, { wch: 8 },
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
      { wch: 10 }, { wch: 60 }, { wch: 50 }, { wch: 15 },
      { wch: 15 }, { wch: 40 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, wsOzon, "Ozon上架模板");
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
