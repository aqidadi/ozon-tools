export interface PlatformConfig {
  code: string;        // 货币代码 e.g. "RUB"
  symbol: string;      // 货币符号 e.g. "₽"
  platform: string;    // 平台名 e.g. "Ozon/WB"
  flag: string;        // 旗帜
  label: string;       // 展示名
  defaultFeeRate: number; // 默认平台佣金率
}

export const PLATFORMS: PlatformConfig[] = [
  { code: "RUB", symbol: "₽",  platform: "Ozon/WB",       flag: "🇷🇺", label: "卢布",     defaultFeeRate: 0.15 },
  { code: "USD", symbol: "$",  platform: "Amazon/eBay",   flag: "🇺🇸", label: "美元",     defaultFeeRate: 0.15 },
  { code: "THB", symbol: "฿",  platform: "Shopee TH",     flag: "🇹🇭", label: "泰铢",     defaultFeeRate: 0.08 },
  { code: "VND", symbol: "₫",  platform: "Shopee VN",     flag: "🇻🇳", label: "越南盾",   defaultFeeRate: 0.08 },
  { code: "IDR", symbol: "Rp", platform: "Shopee ID",     flag: "🇮🇩", label: "印尼盾",   defaultFeeRate: 0.08 },
  { code: "MYR", symbol: "RM", platform: "Shopee MY",     flag: "🇲🇾", label: "马币",     defaultFeeRate: 0.08 },
  { code: "EUR", symbol: "€",  platform: "Amazon EU",     flag: "🇪🇺", label: "欧元",     defaultFeeRate: 0.15 },
  { code: "GBP", symbol: "£",  platform: "Amazon UK",     flag: "🇬🇧", label: "英镑",     defaultFeeRate: 0.15 },
  { code: "AED", symbol: "د.إ",platform: "速卖通中东",    flag: "🇦🇪", label: "迪拉姆",   defaultFeeRate: 0.05 },
  { code: "BRL", symbol: "R$", platform: "Shopee BR",     flag: "🇧🇷", label: "巴西雷亚尔", defaultFeeRate: 0.12 },
];

export interface Settings {
  platformCode: string;       // 当前平台货币代码（默认 "RUB"）
  exchangeRate: number;       // 汇率：1元 = X目标货币
  shippingRatePerGram: number; // 运费：元/克（旧字段，兼容保留）
  shippingPerItem: number;    // 头程运费：元/件（优先使用）
  platformFeeRate: number;    // 平台佣金比例（0.15 = 15%）
  packagingCost: number;      // 包装费（元）
}

export interface Product {
  id: string;
  title: string;           // 中文标题（从1688抓取）
  titleRu: string;         // 俄语标题（AI翻译）
  titleEn?: string;        // 英语标题
  titleTh?: string;        // 泰语标题
  titleVi?: string;        // 越南语标题
  titleId?: string;        // 印尼语标题
  titleMs?: string;        // 马来语标题
  price: number;           // 1688进价（元）
  weight: number;          // 重量（克）
  images: string[];        // 主图URL数组
  detailImages?: string[]; // 详情页描述大图（完整搬运）
  specs?: Record<string, string>; // 规格参数（颜色/材质/尺寸等）
  monthlySales?: number;   // 月销量
  moq?: number;            // 最小起订量
  // 多平台售价：key为货币代码，value为对应货币售价
  sellPrices?: Record<string, number>;
  // 兼容旧字段
  sellPriceRub?: number;
  targetLang?: string;     // 当前目标语言
  note: string;            // 备注
  sourceUrl: string;       // 1688原链接
  tags?: string[];         // 标签：待上架/已上架/爆款/观察中
  starred?: boolean;       // 收藏
}

export const LANGUAGES = [
  { code: "ru", label: "俄语",   flag: "🇷🇺", platform: "Ozon/WB" },
  { code: "en", label: "英语",   flag: "🇺🇸", platform: "Amazon/eBay" },
  { code: "th", label: "泰语",   flag: "🇹🇭", platform: "Shopee TH" },
  { code: "vi", label: "越南语", flag: "🇻🇳", platform: "Shopee VN" },
  { code: "id", label: "印尼语", flag: "🇮🇩", platform: "Shopee ID" },
  { code: "ms", label: "马来语", flag: "🇲🇾", platform: "Shopee MY" },
  { code: "es", label: "西班牙语", flag: "🇪🇸", platform: "Amazon ES" },
  { code: "ar", label: "阿拉伯语", flag: "🇸🇦", platform: "速卖通中东" },
];

export interface CostBreakdown {
  purchasePrice: number;   // 进价（元）
  shippingCost: number;    // 运费（元）
  packagingCost: number;   // 包装费（元）
  platformFee: number;     // 平台佣金（元）
  totalCost: number;       // 总成本（元）
  sellPriceCny: number;    // 售价折合人民币
  profit: number;          // 利润（元）
  profitRate: number;      // 利润率（%）
  minSellPrice: number;    // 保本最低售价（目标货币）
  currencySymbol: string;  // 货币符号
}

export function getPlatform(code: string): PlatformConfig {
  return PLATFORMS.find(p => p.code === code) ?? PLATFORMS[0];
}

export function getSellPrice(product: Product, platformCode: string): number {
  // 优先从 sellPrices 字典取
  if (product.sellPrices?.[platformCode] !== undefined) {
    return product.sellPrices[platformCode];
  }
  // 兼容旧 sellPriceRub
  if (platformCode === "RUB" && product.sellPriceRub) {
    return product.sellPriceRub;
  }
  return 0;
}

export function setSellPrice(product: Product, platformCode: string, value: number): Partial<Product> {
  const sellPrices = { ...(product.sellPrices || {}) };
  sellPrices[platformCode] = value;
  // 同时更新旧字段保持兼容
  if (platformCode === "RUB") {
    return { sellPrices, sellPriceRub: value };
  }
  return { sellPrices };
}

export function calcCost(product: Product, settings: Settings): CostBreakdown {
  const platform = getPlatform(settings.platformCode);
  const currencySymbol = platform.symbol;

  const purchasePrice = product.price;
  const shippingCost = settings.shippingPerItem > 0
    ? settings.shippingPerItem
    : product.weight * settings.shippingRatePerGram;
  const packagingCost = settings.packagingCost;

  const sellPriceLocal = getSellPrice(product, settings.platformCode);
  const sellPriceCny = sellPriceLocal > 0 ? sellPriceLocal / settings.exchangeRate : 0;
  const platformFee = sellPriceCny * settings.platformFeeRate;
  const totalCost = purchasePrice + shippingCost + packagingCost + platformFee;
  const profit = sellPriceCny - totalCost;
  const profitRate = sellPriceCny > 0 ? (profit / sellPriceCny) * 100 : 0;

  // 保本价：cost_without_fee / (1 - platformFeeRate) * exchangeRate
  const costWithoutFee = purchasePrice + shippingCost + packagingCost;
  const minSellPriceCny = costWithoutFee / (1 - settings.platformFeeRate);
  const minSellPrice = Math.ceil(minSellPriceCny * settings.exchangeRate);

  return {
    purchasePrice,
    shippingCost,
    packagingCost,
    platformFee,
    totalCost,
    sellPriceCny,
    profit,
    profitRate,
    minSellPrice,
    currencySymbol,
  };
}
