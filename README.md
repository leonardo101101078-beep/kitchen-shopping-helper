# 廚房採購小幫手（Prototype）

一頁式工具：選 **中餐 / 西餐 / 融合** → 勾選菜色、展開看材料與做法 → **菜籃**內可加 **自訂採買**（選分類後輸入）。下方 **採買清單**依 **蛋奶、蔬菜、水果、肉類、零食、調味品、其他** 分組，食譜合併材料與自訂項目皆可 **勾選表示已買**。

資料在 `localStorage`（鍵：`kitchen-cart:v2`）：`recipeIds`、`extras`（含 `category`）、`recipeItemBought`（食譜合併列勾選）；舊版 `kitchen-cart:v1` 會自動遷移。

食譜為 `src/recipes/**/*.md`，frontmatter 需含 `id`、`cuisine`（`chinese` \| `western` \| `fusion`）、`name`、`ingredients`。材料可選標 **分類**（與程式推斷並用）：

```yaml
ingredients:
  - { item: "雞蛋", amount: "2 顆", category: dairy }
  - { item: "豆瓣醬", amount: "適量", category: condiments }
```

合法 `category` 值：`dairy`、`vegetables`、`fruits`、`meat`、`snacks`、`condiments`、`other`。

## 本機開發

```bash
npm install
npm run dev
```

若出現**只有底色、沒有介面**，或**點菜系後沒有菜名**：瀏覽器解析食譜需要 `Buffer`。專案以 [`src/polyfill-buffer.ts`](src/polyfill-buffer.ts) 作為 **entry 第一個 import**（見 [`src/main.tsx`](src/main.tsx)），並在 [`vite.config.ts`](vite.config.ts) 將 `buffer` 做 alias；請硬重新整理（Cmd+Shift+R）。食譜載入改在 `App` 內 `useMemo`，避免比 polyfill 更早執行。

## 建置與預覽

```bash
npm run build
npm run preview
```

PWA 在 **HTTPS 或 localhost** 下可測試安裝與離線；iPhone 請用 Safari「加入主畫面」。

## 部署到子路徑（例如 GitHub Pages）

在 `vite.config.ts` 設定 `base: '/你的-repo名稱/'`，並確認 PWA 的 `manifest` `start_url` / `scope` 與之一致。
