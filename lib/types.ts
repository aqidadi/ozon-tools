export interface Settings {
  exchangeRate: number;         // 汇率：1元 = X卢布
  shippingRatePerGram: number;  // 运费：元/克
  platformFeeRate: number;      // 平台佣金比例（0.15 = 15%）
  packagingCost: number;        // 包装费（元）
}

export interface Product {
  id: string;
  title: string;           // 中文标题（从1688抓取）
  titleRu: string;         // 俄语标题（AI翻译）
  price: number;           // 1688进价（元）
  weight: number;          // 重量（克）
  images: string[];        // 图片URL数组
  sellPriceRub: number;    // 卖家设定售价（卢布）
  note: string;            // 备注
  sourceUrl: string;       // 1688原链接
}

export interface CostBreakdown {
  purchasePrice: number;   // 进价（元）
  shippingCost: number;    // 运费（元）
  packagingCost: number;   // 包装费（元）
  platformFee: number;     // 平台佣金（元）
  totalCost: number;       // 总成本（元）
  sellPriceCny: number;    // 售价折合人民币
  profit: number;          // 利润（元）
  profitRate: number;      // 利润率（%）
  minSellPriceRub: number; // 保本最低售价（卢布）
}

export function calcCost(product: Product, settings: Settings): CostBreakdown {
  const purchasePrice = product.price;
  const shippingCost = product.weight * settings.shippingRatePerGram;
  const packagingCost = settings.packagingCost;
  const sellPriceCny = product.sellPriceRub / settings.exchangeRate;
  const platformFee = sellPriceCny * settings.platformFeeRate;
  const totalCost = purchasePrice + shippingCost + packagingCost + platformFee;
  const profit = sellPriceCny - totalCost;
  const profitRate = sellPriceCny > 0 ? (profit / sellPriceCny) * 100 : 0;

  // 保本价：cost_without_fee / (1 - platformFeeRate) * exchangeRate
  const costWithoutFee = purchasePrice + shippingCost + packagingCost;
  const minSellPriceCny = costWithoutFee / (1 - settings.platformFeeRate);
  const minSellPriceRub = Math.ceil(minSellPriceCny * settings.exchangeRate);

  return {
    purchasePrice,
    shippingCost,
    packagingCost,
    platformFee,
    totalCost,
    sellPriceCny,
    profit,
    profitRate,
    minSellPriceRub,
  };
}
