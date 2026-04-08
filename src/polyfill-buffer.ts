/** 必須在任何載入 gray-matter 的模組之前 import，否則瀏覽器內解析會失敗、食譜為空。 */
import { Buffer } from 'buffer'

const g = globalThis as unknown as { Buffer?: typeof Buffer }
if (g.Buffer === undefined) {
  g.Buffer = Buffer
}
