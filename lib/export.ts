import * as XLSX from "xlsx";
import { Product, Settings, calcCost } from "./types";

export function exportToExcel(products: Product[], settings: Settings) {
  const rows = products.map((p) => {
    const cost = calcCost(p, settings);
    return {
      "商品名称（中文）": p.title,
      "商品名称（俄语）": p.titleRu,
      "1688进价（元）": p.price,
      "重量（克）": p.weight,
      "运费（元）": cost.shippingCost.toFixed(2),
      "包装费（元）": cost.packagingCost.toFixed(2),
      "平台佣金（元）": cost.platformFee.toFixed(2),
      "总成本（元）": cost.totalCost.toFixed(2),
      "售价（卢布）": p.sellPriceRub,
      "售价折合人民币": cost.sellPriceCny.toFixed(2),
      "利润（元）": cost.profit.toFixed(2),
      "利润率": `${cost.profitRate.toFixed(1)}%`,
      "保本最低售价（卢布）": cost.minSellPriceRub,
      "备注": p.note,
      "1688链接": p.sourceUrl,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "商品列表");

  // 设置列宽
  ws["!cols"] = [
    { wch: 30 }, { wch: 40 }, { wch: 14 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 20 }, { wch: 40 },
  ];

  XLSX.writeFile(wb, `ozon_products_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
