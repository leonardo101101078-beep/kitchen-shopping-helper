export type Cuisine = 'chinese' | 'western' | 'fusion'

/** 採買分類：蛋奶、蔬菜、水果、肉類、零食、調味品、其他 */
export type ShopCategory =
  | 'dairy'
  | 'vegetables'
  | 'fruits'
  | 'meat'
  | 'snacks'
  | 'condiments'
  | 'other'

export interface IngredientRow {
  item: string
  amount?: string
  /** 食譜可選；未標時由程式推斷 */
  category?: ShopCategory
}

export interface Recipe {
  id: string
  cuisine: Cuisine
  name: string
  ingredients: IngredientRow[]
  /** Markdown body (below frontmatter), shown as recipe narrative */
  bodyMarkdown: string
}

export const CUISINE_LABEL: Record<Cuisine, string> = {
  chinese: '中餐',
  western: '西餐',
  fusion: '融合',
}
