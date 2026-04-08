import type { ShopCategory } from '../types/recipe'

export const SHOP_CATEGORY_ORDER: ShopCategory[] = [
  'dairy',
  'vegetables',
  'fruits',
  'meat',
  'snacks',
  'condiments',
  'other',
]

export const SHOP_CATEGORY_LABEL: Record<ShopCategory, string> = {
  dairy: '蛋奶',
  vegetables: '蔬菜',
  fruits: '水果',
  meat: '肉類',
  snacks: '零食',
  condiments: '調味品',
  other: '其他',
}

const ALL_KEYS = new Set(SHOP_CATEGORY_ORDER)

export function isShopCategory(x: unknown): x is ShopCategory {
  return typeof x === 'string' && ALL_KEYS.has(x as ShopCategory)
}

export function normalizeIngredientKey(item: string): string {
  return item.trim()
}

export function recipeItemStorageKey(item: string): string {
  return `ing:${normalizeIngredientKey(item)}`
}

export function inferCategory(itemName: string): ShopCategory {
  const t = itemName.trim()

  const has = (sub: string) => t.includes(sub)

  if (
    has('黃油') ||
    has('照燒') ||
    has('蒲燒') ||
    has('迷迭香') ||
    has('番茄罐頭') ||
    has('辣椒粉') ||
    has('乾辣椒')
  ) {
    return 'condiments'
  }

  if (
    has('醬油') ||
    has('老抽') ||
    has('生抽') ||
    has('味醂') ||
    has('醋') ||
    has('鹽') ||
    has('糖') ||
    has('胡椒') ||
    has('花椒') ||
    has('孜然') ||
    has('豆瓣') ||
    has('辣醬') ||
    has('魚露') ||
    has('味噌') ||
    has('蜂蜜') ||
    has('橄欖油') ||
    has('食用油') ||
    has('香油') ||
    has('麻油') ||
    has('太白粉') ||
    has('澱粉') ||
    has('料酒') ||
    has('紹興') ||
    has('花生油') ||
    has('葵花油') ||
    has('調味') ||
    (has('粉') && (has('胡椒') || has('花椒') || has('孜然')))
  ) {
    return 'condiments'
  }

  if (
    has('餅') ||
    has('洋芋片') ||
    has('零食') ||
    has('堅果') ||
    has('巧克力') ||
    has('肉鬆') ||
    (has('花生') && (has('碎') || has('粉')))
  ) {
    return 'snacks'
  }

  if (
    has('皮蛋') ||
    has('蛋糕')
  ) {
    /* 略過蛋奶，往下 */
  } else if (
    has('雞蛋') ||
    has('鴨蛋') ||
    has('蛋絲') ||
    (has('蛋') && !has('蛋糕')) ||
    has('鮮奶') ||
    has('牛奶') ||
    has('牛乳') ||
    has('優格') ||
    has('酸奶') ||
    has('起司') ||
    has('乳酪') ||
    has('芝士') ||
    has('鮮奶油') ||
    (has('奶油') && !has('奶油萵'))
  ) {
    return 'dairy'
  }

  if (
    has('雞') ||
    has('豬') ||
    has('牛') ||
    has('羊') ||
    has('鴨') ||
    has('鵝') ||
    has('絞肉') ||
    has('肉末') ||
    has('肉片') ||
    has('排骨') ||
    has('培根') ||
    has('火腿') ||
    has('香腸') ||
    has('五花肉') ||
    has('蝦') ||
    has('蟹') ||
    has('魚') ||
    has('鮭') ||
    has('鮪') ||
    has('花枝') ||
    has('透抽') ||
    has('蛤蜊') ||
    has('海鮮') ||
    has('雞翅') ||
    has('雞腿') ||
    has('雞胸') ||
    has('雞片') ||
    has('肉串') ||
    (has('肉') && !has('肉桂')) ||
    has('pancetta')
  ) {
    return 'meat'
  }

  if (
    has('蘋果') ||
    has('香蕉') ||
    has('橘子') ||
    has('橙') ||
    has('葡萄') ||
    has('草莓') ||
    has('鳳梨') ||
    has('西瓜') ||
    has('櫻桃') ||
    has('檸檬') ||
    has('奇異果') ||
    has('小番茄')
  ) {
    return 'fruits'
  }

  if (
    has('菜') ||
    has('蔥') ||
    has('薑') ||
    has('蒜') ||
    has('洋蔥') ||
    has('番茄') ||
    has('茄子') ||
    has('瓜') ||
    has('菇') ||
    has('筍') ||
    has('豆芽') ||
    has('豆腐') ||
    has('豆干') ||
    has('泡菜') ||
    has('白菜') ||
    has('菠菜') ||
    has('生菜') ||
    has('高麗') ||
    has('花椰') ||
    has('青椒') ||
    (has('辣椒') &&
      !has('辣醬') &&
      !has('乾辣椒') &&
      !has('辣椒粉')) ||
    has('九層塔') ||
    has('紅蘿蔔') ||
    has('胡蘿蔔') ||
    has('馬鈴薯') ||
    has('玉米') ||
    has('南瓜') ||
    has('冬瓜') ||
    has('絲瓜') ||
    has('小黃瓜') ||
    has('芹菜') ||
    has('香菜') ||
    has('萵苣') ||
    has('青江菜') ||
    has('空心菜') ||
    has('地瓜') ||
    has('番薯') ||
    has('芋頭') ||
    has('山藥') ||
    has('木耳') ||
    has('香菇') ||
    has('蘑菇') ||
    has('金針') ||
    has('蟲草花') ||
    has('雪菜') ||
    has('榨菜') ||
    has('芽菜') ||
    has('蔬菜') ||
    has('番茄') ||
    has('粿條')
  ) {
    return 'vegetables'
  }

  if (has('年糕')) {
    return 'other'
  }

  return 'other'
}

export function mergeCategories(
  a: ShopCategory,
  b: ShopCategory,
): ShopCategory {
  if (a === 'other') return b
  if (b === 'other') return a
  return a
}
