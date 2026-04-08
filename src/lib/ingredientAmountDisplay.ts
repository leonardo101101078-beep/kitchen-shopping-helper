/** 展開食譜「材料」列：隱藏泛用份量，保留有數字或具體單位的描述 */

const GENERIC_NORMALIZED = new Set([
  '適量',
  '适量',
  '少許',
  '少许',
  '些許',
  '些许',
  '酌量',
  '酌情',
  '依口味',
  '依個人口味',
  '依个人口味',
  '隨意',
  '随意',
  '隨個人',
  '随个人',
  '份量自訂',
  '份量自订',
  '（份量自訂）',
  '（份量自订）',
  '(份量自訂)',
  '(份量自订)',
  'to taste',
  'as needed',
])

function normalizeForCompare(s: string): string {
  return s
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[（）]/g, (ch) => (ch === '（' ? '(' : ')'))
    .toLowerCase()
}

function hasNumericOrConcreteUnit(s: string): boolean {
  if (/\d/.test(s)) return true
  if (/[０-９]/.test(s)) return true
  if (
    /[/／∕]/.test(s) ||
    /[克g斤兩杯大勺小勺匙毫升mlL tbsp tsp oz lb]/i.test(s)
  ) {
    return true
  }
  return false
}

/** 若為 true，材料列只顯示品項名，不顯示份量附註 */
export function shouldHideGenericAmount(amount: string | undefined): boolean {
  if (amount == null) return true
  const t = amount.trim()
  if (!t) return true
  if (hasNumericOrConcreteUnit(t)) return false
  const key = normalizeForCompare(t)
  return GENERIC_NORMALIZED.has(key)
}

export function ingredientLineLabel(item: string, amount: string | undefined): string {
  if (shouldHideGenericAmount(amount)) return item
  return `${item} — ${amount!.trim()}`
}
