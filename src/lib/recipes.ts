import matter from 'gray-matter'
import { isShopCategory } from './ingredientCategory'
import type { Cuisine, IngredientRow, Recipe } from '../types/recipe'

const rawModules = import.meta.glob<string>('../recipes/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const CUISINES = ['chinese', 'western', 'fusion'] as const

function isCuisine(x: unknown): x is Cuisine {
  return typeof x === 'string' && CUISINES.includes(x as Cuisine)
}

function normalizeIngredients(data: unknown): IngredientRow[] {
  if (!Array.isArray(data)) return []
  const out: IngredientRow[] = []
  for (const row of data) {
    if (row && typeof row === 'object' && 'item' in row) {
      const item = String((row as { item: unknown }).item ?? '').trim()
      if (!item) continue
      const amount = (row as { amount?: unknown }).amount
      const rawCat = (row as { category?: unknown }).category
      const category = isShopCategory(rawCat) ? rawCat : undefined
      out.push({
        item,
        amount: typeof amount === 'string' ? amount : undefined,
        ...(category ? { category } : {}),
      })
    }
  }
  return out
}

function parseRecipe(raw: string, path: string): Recipe | null {
  let data: unknown
  let content: string
  try {
    const parsed = matter(raw)
    data = parsed.data
    content = parsed.content
  } catch (e) {
    console.warn(`[recipes] YAML parse failed: ${path}`, e)
    return null
  }
  const d = data as Record<string, unknown>
  const id = typeof d.id === 'string' ? d.id.trim() : ''
  const name = typeof d.name === 'string' ? d.name.trim() : ''
  const cuisine = d.cuisine

  if (!id || !name || !isCuisine(cuisine)) {
    console.warn(`[recipes] skip invalid frontmatter: ${path}`)
    return null
  }

  return {
    id,
    cuisine,
    name,
    ingredients: normalizeIngredients(d.ingredients),
    bodyMarkdown: content.trim(),
  }
}

export function loadRecipes(): Recipe[] {
  const list: Recipe[] = []
  for (const path of Object.keys(rawModules)) {
    const raw = rawModules[path]
    const recipe = parseRecipe(raw, path)
    if (recipe) list.push(recipe)
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
}
