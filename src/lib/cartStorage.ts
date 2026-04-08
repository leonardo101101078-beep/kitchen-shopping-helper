import type { ShopCategory } from '../types/recipe'
import { isShopCategory } from './ingredientCategory'

const STORAGE_V1 = 'kitchen-cart:v1'
const STORAGE_V2 = 'kitchen-cart:v2'

export interface CartExtra {
  id: string
  text: string
  /** true = 已買／已採購 */
  bought: boolean
  category: ShopCategory
}

export interface CartState {
  recipeIds: string[]
  extras: CartExtra[]
  /** 食譜合併列：key 為 `ing:` + 品名 */
  recipeItemBought: Record<string, boolean>
}

function normalizeCart(input: unknown): CartState {
  if (!input || typeof input !== 'object') {
    return { recipeIds: [], extras: [], recipeItemBought: {} }
  }
  const o = input as Record<string, unknown>
  const recipeIds = Array.isArray(o.recipeIds)
    ? o.recipeIds.filter((x): x is string => typeof x === 'string')
    : []
  const extras: CartExtra[] = []
  if (Array.isArray(o.extras)) {
    for (const row of o.extras) {
      if (!row || typeof row !== 'object') continue
      const r = row as Record<string, unknown>
      const id = typeof r.id === 'string' ? r.id : ''
      const text = typeof r.text === 'string' ? r.text.trim() : ''
      if (!id || !text) continue
      const catRaw = r.category
      const category: ShopCategory = isShopCategory(catRaw)
        ? catRaw
        : 'other'
      extras.push({
        id,
        text,
        bought: Boolean(r.bought),
        category,
      })
    }
  }
  const recipeItemBought: Record<string, boolean> = {}
  if (o.recipeItemBought && typeof o.recipeItemBought === 'object') {
    for (const [k, v] of Object.entries(
      o.recipeItemBought as Record<string, unknown>,
    )) {
      if (typeof k === 'string' && k.startsWith('ing:') && typeof v === 'boolean') {
        recipeItemBought[k] = v
      }
    }
  }
  return { recipeIds, extras, recipeItemBought }
}

function readV1RecipeIds(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_V1)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ids?: unknown }
    if (!Array.isArray(parsed.ids)) return null
    return parsed.ids.filter((x): x is string => typeof x === 'string')
  } catch {
    return null
  }
}

export function loadCart(): CartState {
  try {
    const v2 = localStorage.getItem(STORAGE_V2)
    if (v2) {
      return normalizeCart(JSON.parse(v2) as unknown)
    }
  } catch {
    /* ignore */
  }

  const fromV1 = readV1RecipeIds()
  if (fromV1) {
    const state: CartState = {
      recipeIds: fromV1,
      extras: [],
      recipeItemBought: {},
    }
    saveCart(state)
    try {
      localStorage.removeItem(STORAGE_V1)
    } catch {
      /* ignore */
    }
    return state
  }

  return { recipeIds: [], extras: [], recipeItemBought: {} }
}

export function saveCart(state: CartState): void {
  try {
    localStorage.setItem(STORAGE_V2, JSON.stringify(state))
  } catch (e) {
    console.warn('[cart] could not save to localStorage', e)
  }
}

export function clearCartStorage(): void {
  try {
    localStorage.removeItem(STORAGE_V2)
    localStorage.removeItem(STORAGE_V1)
  } catch {
    /* ignore */
  }
}
