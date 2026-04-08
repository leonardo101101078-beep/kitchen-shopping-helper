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

## GitHub 與 GitHub Pages

**倉庫：** [github.com/leonardo101101078-beep/kitchen-shopping-helper](https://github.com/leonardo101101078-beep/kitchen-shopping-helper)

建置已支援 **`VITE_BASE`**（見 [`vite.config.ts`](vite.config.ts)），CI 會設成 `/<repo 名稱>/`，對應 **Project Pages** 網址：

`https://leonardo101101078-beep.github.io/kitchen-shopping-helper/`

### 啟用自動部署（Actions）

預設的 GitHub CLI token 常**無法推送** `.github/workflows/`（需 `workflow` 權限）。擇一即可：

1. **本機授權後推送 workflow**  
   ```bash
   gh auth refresh -s workflow -h github.com
   ```  
   瀏覽器完成裝置驗證後：  
   ```bash
   git add .github/workflows/deploy-github-pages.yml
   git commit -m "ci: GitHub Pages workflow"
   git push
   ```

2. **在網頁上新增 workflow**  
   複製 [`docs/github-pages-workflow.yml`](docs/github-pages-workflow.yml) 全文，到倉庫 [新增檔案（預填路徑）](https://github.com/leonardo101101078-beep/kitchen-shopping-helper/new/main?filename=.github%2Fworkflows%2Fdeploy-github-pages.yml) 貼上後 Commit；或 **Add file → Create new file**，路徑填 **`.github/workflows/deploy-github-pages.yml`**。

### 開啟 Pages

倉庫 **Settings → Pages → Build and deployment**：**Source** 選 **GitHub Actions**（不要選 Deploy from a branch）。workflow 跑成功後即可開啟上述網址。

本機用子路徑預覽：`VITE_BASE=/kitchen-shopping-helper/ npm run build && npm run preview`（依你的 repo 名稱調整）。

## 部署到子路徑（手動）

除 Actions 外，也可在本機設 `VITE_BASE=/repo-name/ npm run build`，將 `dist` 上傳至靜態託管；PWA 的 `start_url` / `scope` 已依 `base` 產生。
