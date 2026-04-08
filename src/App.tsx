import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { loadRecipes } from './lib/recipes'
import {
  clearCartStorage,
  loadCart,
  saveCart,
  type CartState,
} from './lib/cartStorage'
import {
  groupShoppingByCategory,
  mergeShoppingList,
} from './lib/mergeIngredients'
import {
  recipeItemStorageKey,
  SHOP_CATEGORY_LABEL,
  SHOP_CATEGORY_ORDER,
} from './lib/ingredientCategory'
import { ingredientLineLabel } from './lib/ingredientAmountDisplay'
import type { Cuisine, Recipe, ShopCategory } from './types/recipe'
import { CUISINE_LABEL } from './types/recipe'

const CUISINES: Cuisine[] = ['chinese', 'western', 'fusion']

function IconChevron({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex transition-transform duration-200 ease-out ${
        open ? '-rotate-180' : 'rotate-0'
      }`}
    >
      <svg
        className="size-5 shrink-0 text-olive"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25 12 15.75 4.5 8.25"
        />
      </svg>
    </span>
  )
}

function useIosStandaloneHint() {
  return useState(() => {
    const ua = navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(ua)
    const standalone =
      'standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    return iOS && !standalone
  })[0]
}

export default function App() {
  const recipes = useMemo(() => loadRecipes(), [])

  const [cuisine, setCuisine] = useState<Cuisine | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [cart, setCart] = useState<CartState>(() => loadCart())
  const [extraDraft, setExtraDraft] = useState('')
  const [extraCategory, setExtraCategory] = useState<ShopCategory>('other')
  const showIosHint = useIosStandaloneHint()

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const recipeIds = cart.recipeIds

  const shopping = useMemo(
    () => mergeShoppingList(recipes, recipeIds),
    [recipes, recipeIds],
  )

  const byCuisine = useMemo(() => {
    const m = new Map<Cuisine, Recipe[]>()
    for (const c of CUISINES) m.set(c, [])
    for (const r of recipes) {
      const bucket = m.get(r.cuisine)
      if (bucket) bucket.push(r)
    }
    for (const c of CUISINES) {
      m.get(c)!.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    }
    return m
  }, [recipes])

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => recipeIds.includes(r.id)),
    [recipes, recipeIds],
  )

  const categorySections = useMemo(() => {
    const recipeGroups = groupShoppingByCategory(shopping)
    const recipeByCat = new Map(
      recipeGroups.map((g) => [g.category, g.lines]),
    )
    return SHOP_CATEGORY_ORDER.map((category) => ({
      category,
      recipeLines: recipeByCat.get(category) ?? [],
      extras: cart.extras.filter((e) => e.category === category),
    })).filter(
      (s) => s.recipeLines.length > 0 || s.extras.length > 0,
    )
  }, [shopping, cart.extras])

  const cartHasContent =
    cart.recipeIds.length > 0 || cart.extras.length > 0

  const hasShoppingItems =
    shopping.length > 0 || cart.extras.length > 0

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCart(id: string) {
    setCart((c) => ({
      ...c,
      recipeIds: c.recipeIds.includes(id)
        ? c.recipeIds.filter((x) => x !== id)
        : [...c.recipeIds, id],
    }))
  }

  function toggleRecipeLineBought(item: string) {
    const key = recipeItemStorageKey(item)
    setCart((c) => ({
      ...c,
      recipeItemBought: {
        ...c.recipeItemBought,
        [key]: !c.recipeItemBought[key],
      },
    }))
  }

  function addExtraLine() {
    const text = extraDraft.trim()
    if (!text) return
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `x-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setCart((c) => ({
      ...c,
      extras: [
        ...c.extras,
        {
          id,
          text,
          bought: false,
          category: extraCategory,
        },
      ],
    }))
    setExtraDraft('')
  }

  function toggleExtraBought(id: string) {
    setCart((c) => ({
      ...c,
      extras: c.extras.map((e) =>
        e.id === id ? { ...e, bought: !e.bought } : e,
      ),
    }))
  }

  function removeExtra(id: string) {
    setCart((c) => ({
      ...c,
      extras: c.extras.filter((e) => e.id !== id),
    }))
  }

  function clearCart() {
    if (!cartHasContent) return
    if (!window.confirm('確定要清空菜籃、自訂採買與合併採買清單嗎？')) return
    clearCartStorage()
    setCart({ recipeIds: [], extras: [], recipeItemBought: {} })
  }

  const listForCuisine = cuisine ? byCuisine.get(cuisine) ?? [] : []

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header
        className="animate-soft-in mb-10 text-center"
        style={{ animationDelay: '0ms' }}
      >
        <h1 className="font-display text-[1.65rem] font-semibold tracking-tight text-olive-deep md:text-3xl">
          廚房採購小幫手
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-olive-muted">
          選菜系 → 勾菜進菜籃 → 帶著清單去買菜
        </p>
      </header>

      {showIosHint && (
        <div
          className="animate-fade-up mb-8 rounded-[24px] border border-paper-edge bg-cream-card px-4 py-3 text-sm text-olive-deep"
          role="status"
          style={{ animationDelay: '40ms' }}
        >
          <strong className="font-medium text-olive">iPhone 小提示：</strong>
          點 Safari 的「分享」→「加入主畫面」，可像 App 一樣開啟。
        </div>
      )}

      <section
        className="animate-fade-up mb-10"
        aria-labelledby="pick-cuisine-heading"
        style={{ animationDelay: '80ms' }}
      >
        <h2
          id="pick-cuisine-heading"
          className="font-display mb-4 text-xl font-medium text-olive-deep"
        >
          今天吃什麼？
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {CUISINES.map((c, i) => {
            const active = cuisine === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(c)}
                className={[
                  'lp-btn-pill min-h-14 border-2 px-2 py-3 text-base font-medium',
                  active
                    ? 'border-olive bg-olive text-warm-surface'
                    : 'border-paper-edge bg-cream-card text-olive-deep hover:border-olive-muted',
                ].join(' ')}
                style={{ animationDelay: `${120 + i * 50}ms` }}
              >
                {CUISINE_LABEL[c]}
              </button>
            )
          })}
        </div>
      </section>

      {cuisine && (
        <section
          className="animate-fade-up mb-10"
          aria-labelledby="menu-heading"
          style={{ animationDelay: '100ms' }}
        >
          <h2
            id="menu-heading"
            className="font-display mb-4 text-xl font-medium text-olive-deep"
          >
            {CUISINE_LABEL[cuisine]} · 菜色
          </h2>
          <ul className="space-y-3">
            {listForCuisine.length === 0 && (
              <li className="lp-card rounded-[24px] px-4 py-4 text-sm text-olive-deep">
                此菜系目前沒有載入到食譜。若剛更新過專案，請試著
                <strong className="font-medium"> 硬重新整理</strong>
                （Cmd+Shift+R）。仍無資料請開啟開發者工具查看 Console 是否出現錯誤。
              </li>
            )}
            {listForCuisine.map((r, ri) => {
              const open = expanded.has(r.id)
              const inCart = recipeIds.includes(r.id)
              return (
                <li
                  key={r.id}
                  className="lp-card overflow-hidden rounded-[24px]"
                  style={{
                    animation: 'lp-fade-up 0.45s ease-out both',
                    animationDelay: `${ri * 45}ms`,
                  }}
                >
                  <div className="flex items-stretch gap-1">
                    <label className="flex min-h-[52px] flex-1 cursor-pointer items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={inCart}
                        onChange={() => toggleCart(r.id)}
                        className="lp-checkbox size-5 shrink-0 rounded border-paper-edge"
                      />
                      <span className="font-medium text-olive-deep">
                        {r.name}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(r.id)}
                      className="lp-btn-pill flex min-w-[52px] items-center justify-center px-3 text-olive hover:bg-cream-deep/60"
                      aria-expanded={open}
                      aria-controls={`dish-detail-${r.id}`}
                    >
                      <span className="sr-only">
                        {open ? '收合' : '展開'}
                      </span>
                      <IconChevron open={open} />
                    </button>
                  </div>
                  {open && (
                    <div
                      id={`dish-detail-${r.id}`}
                      className="animate-soft-in border-t border-paper-edge bg-cream-deep/40 px-4 py-4 text-sm"
                    >
                      {r.ingredients.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-display mb-2 text-base font-medium text-olive-deep">
                            材料
                          </h3>
                          <ul className="list-inside list-disc space-y-1 text-olive-deep/95">
                            {r.ingredients.map((ing) => (
                              <li key={`${r.id}-${ing.item}`}>
                                {ingredientLineLabel(ing.item, ing.amount)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="prose-recipe text-olive-deep [&_h2]:mb-2 [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-medium [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:leading-relaxed">
                        <ReactMarkdown>{r.bodyMarkdown}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section
        className="lp-card animate-fade-up p-5 md:p-6"
        aria-labelledby="cart-heading"
        style={{ animationDelay: '120ms' }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id="cart-heading"
            className="font-display text-xl font-medium text-olive-deep"
          >
            菜籃子
          </h2>
          <button
            type="button"
            onClick={clearCart}
            disabled={!cartHasContent}
            className="lp-btn-pill min-h-11 shrink-0 rounded-[24px] border border-[#c9b8a8] bg-[#faf6f1] px-4 text-sm font-medium text-olive-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            清空菜籃
          </button>
        </div>

        {selectedRecipes.length === 0 ? (
          <p className="mb-5 text-sm text-olive-muted">
            尚未選擇菜色，先選菜系並勾選想做的料理。
          </p>
        ) : (
          <ul className="mb-5 flex flex-wrap gap-2">
            {selectedRecipes.map((r) => (
              <li
                key={r.id}
                className="rounded-full border border-paper-edge bg-cream-deep/80 px-3 py-1.5 text-sm text-olive-deep"
              >
                {r.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mb-5 border-t border-paper-edge pt-5">
          <h3 className="font-display mb-2 text-lg font-medium text-olive-deep">
            自訂採買
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-olive-muted">
            選擇分類後輸入並新增；項目會出現在下方「採買清單」對應分類。勾選表示已買齊。
          </p>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-xs text-olive-muted sm:shrink-0">
              分類
            </label>
            <select
              value={extraCategory}
              onChange={(e) =>
                setExtraCategory(e.target.value as ShopCategory)
              }
              className="min-h-11 w-full rounded-[24px] border border-paper-edge bg-warm-surface px-3 text-sm text-olive-deep focus:border-olive sm:max-w-[220px]"
              aria-label="自訂採買分類"
            >
              {SHOP_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {SHOP_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={extraDraft}
              onChange={(e) => setExtraDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addExtraLine()
                }
              }}
              placeholder="例如：牛奶、衛生紙…"
              className="min-h-12 flex-1 rounded-[24px] border border-paper-edge bg-warm-surface px-4 text-base text-olive-deep placeholder:text-olive-muted/70 focus:border-olive"
              aria-label="自訂採買項目"
            />
            <button
              type="button"
              onClick={addExtraLine}
              className="lp-btn-pill min-h-12 shrink-0 rounded-[24px] border border-olive bg-olive px-6 text-sm font-medium text-warm-surface hover:bg-olive-deep"
            >
              新增
            </button>
          </div>
        </div>

        <div className="border-t border-paper-edge pt-5">
          <h3 className="font-display mb-2 text-lg font-medium text-olive-deep">
            採買清單
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-olive-muted">
            依蛋奶、蔬菜等分類；勾選表示已買齊（食譜材料與自訂項目皆適用）。
          </p>
          {!hasShoppingItems ? (
            <p className="text-sm text-olive-muted">
              勾選料理或新增自訂項目後，會依分類顯示在這裡。
            </p>
          ) : (
            <div className="space-y-6">
              {categorySections.map(({ category, recipeLines, extras }, si) => (
                <div
                  key={category}
                  style={{
                    animation: 'lp-soft-in 0.4s ease-out both',
                    animationDelay: `${si * 60}ms`,
                  }}
                >
                  <h4 className="font-display lp-shop-category-sticky text-sm font-medium text-olive">
                    {SHOP_CATEGORY_LABEL[category]}
                  </h4>
                  <ul className="space-y-2">
                    {recipeLines.map((line, li) => {
                      const key = recipeItemStorageKey(line.item)
                      const bought = Boolean(cart.recipeItemBought[key])
                      return (
                        <li
                          key={`r-${line.item}`}
                          className="flex gap-3 rounded-[20px] bg-cream-deep/50 px-3 py-3"
                          style={{
                            animation: 'lp-fade-up 0.4s ease-out both',
                            animationDelay: `${li * 35}ms`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={bought}
                            onChange={() =>
                              toggleRecipeLineBought(line.item)
                            }
                            className="lp-checkbox mt-0.5 size-5 shrink-0 rounded border-paper-edge"
                            aria-label={`${line.item} 已買`}
                          />
                          <span
                            className="lp-strike-wrap min-w-0 flex-1 font-medium"
                            data-bought={bought ? 'true' : 'false'}
                          >
                            {line.item}
                          </span>
                        </li>
                      )
                    })}
                    {extras.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center gap-3 rounded-[20px] border border-dashed border-paper-edge bg-warm-surface px-3 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={row.bought}
                          onChange={() => toggleExtraBought(row.id)}
                          className="lp-checkbox size-5 shrink-0 rounded border-paper-edge"
                          aria-label={row.bought ? '標為尚未購買' : '標為已買'}
                        />
                        <span className="min-w-0 flex-1 text-sm">
                          <span
                            className="lp-strike-wrap"
                            data-bought={row.bought ? 'true' : 'false'}
                          >
                            {row.text}
                          </span>
                          <span className="ml-1 text-xs text-olive-muted">
                            （自訂）
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExtra(row.id)}
                          className="lp-btn-pill min-h-9 shrink-0 rounded-[16px] px-2 text-sm text-[#8b5a4a] hover:bg-cream-deep/80"
                          aria-label="刪除此項"
                        >
                          刪除
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
