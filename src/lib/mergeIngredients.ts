import type { Recipe, ShopCategory } from '../types/recipe'
import {
  inferCategory,
  mergeCategories,
  SHOP_CATEGORY_ORDER,
} from './ingredientCategory'

export interface MergedShoppingLine {
  item: string
  amounts: string[]
  category: ShopCategory
}

export function mergeShoppingList(
  recipes: Recipe[],
  selectedIds: string[],
): MergedShoppingLine[] {
  const byId = new Map(recipes.map((r) => [r.id, r]))
  const map = new Map<
    string,
    { amounts: string[]; category: ShopCategory }
  >()

  for (const id of selectedIds) {
    const recipe = byId.get(id)
    if (!recipe) continue
    for (const ing of recipe.ingredients) {
      const key = ing.item.trim()
      if (!key) continue
      const line = ing.amount?.trim() || '（份量自訂）'
      const resolved: ShopCategory =
        ing.category ?? inferCategory(key)

      const prev = map.get(key)
      if (!prev) {
        map.set(key, { amounts: [line], category: resolved })
      } else {
        if (!prev.amounts.includes(line)) prev.amounts.push(line)
        prev.category = mergeCategories(prev.category, resolved)
      }
    }
  }

  return [...map.entries()]
    .map(([item, v]) => ({
      item,
      amounts: v.amounts,
      category: v.category,
    }))
    .sort((a, b) => a.item.localeCompare(b.item, 'zh-Hant'))
}

/** 依固定順序輸出有內容的分類與列 */
export function groupShoppingByCategory(
  lines: MergedShoppingLine[],
): { category: ShopCategory; lines: MergedShoppingLine[] }[] {
  const bucket = new Map<ShopCategory, MergedShoppingLine[]>()
  for (const c of SHOP_CATEGORY_ORDER) bucket.set(c, [])
  for (const line of lines) {
    bucket.get(line.category)!.push(line)
  }
  return SHOP_CATEGORY_ORDER.map((category) => ({
    category,
    lines: bucket.get(category) ?? [],
  })).filter((g) => g.lines.length > 0)
}
