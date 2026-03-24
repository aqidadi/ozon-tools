import * as XLSX from "xlsx";
import { Product, Settings, calcCost, LANGUAGES } from "./types";

export function exportToExcel(products: Product[], settings: Settings) {
  const wb = XLSX.utils.book_new();

  // === Sheet 1: 成本分析 ===
  const costRows = products.map((p) => {
    const cost = calcCost(p, settings);
    return {
      "商品名称（中文）": p.title,
      "商品名称（俄语）": p.titleRu || "",
      "商品名称（英语）": p.titleEn || "",
      "1688进价（元）": p.price,
      "重量（克）": p.weight,
      "运费（元）": cost.shippingCost.toFixed(2),
      "包装费（元）": cost.packagingCost.toFixed(2),
      "平台佣金（元）": cost.platformFee.toFixed(2),
      "总成本（元）": cost.totalCost.toFixed(2),
      "售价（卢布）": p.sellPriceRub || "",
      "售价折合人民币": p.sellPriceRub ? cost.sellPriceCny.toFixed(2) : "",
      "利润（元）": p.sellPriceRub ? cost.profit.toFixed(2) : "",
      "利润率": p.sellPriceRub ? `${cost.profitRate.toFixed(1)}%` : "",
      "保本最低售价（卢布）": cost.minSellPriceRub,
      "备注": p.note || "",
      "1688链接": p.sourceUrl || "",
    };
  });

  const wsCost = XLSX.utils.json_to_sheet(costRows);
  wsCost["!cols"] = [
    { wch: 30 }, { wch: 40 }, { wch: 40 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 20 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCost, "成本分析");

  // === Sheet 2: Ozon上架模板 ===
  // 参考 Ozon seller 上架必填字段
  const ozonRows = products.map((p) => {
    const cost = calcCost(p, settings);
    const sellPrice = p.sellPriceRub || cost.minSellPriceRub;
    return {
      "Название товара": p.titleRu || p.title,           // 商品名称（俄语）
      "Артикул": `1688-${p.id.slice(0, 8)}`,            // 商家SKU
      "Цена, руб.": sellPrice,                           // 价格（卢布）
      "НДС, %": 0,                                       // 税率
      "Вес в упаковке, г": p.weight || 500,              // 含包装重量(克)
      "Ширина упаковки, мм": 150,                        // 包装宽度
      "Высота упаковки, мм": 100,                        // 包装高度
      "Глубина упаковки, мм": 100,                       // 包装深度
      "Количество": 10,                                   // 库存数量
      "Ссылки на фото": p.images.slice(0, 3).join("; "), // 图片链接
      "Описание": p.titleRu || p.title,                  // 描述
      "Бренд": "No Brand",                               // 品牌
      "Страна изготовитель": "Китай",                    // 生产国
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

  XLSX.writeFile(wb, `ozon_upload_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
