# 美甲預約系統

使用 Next.js 14、TypeScript、Tailwind CSS、Prisma + SQLite 建立的單人美甲師預約網站。

【本專案已支援 LINE 登入、Telegram 通知、週視圖選時段、每日預約/取消次數上限與後台封鎖管理】

## 功能
- 預約流程：LINE 登入後，於週視圖選擇時段和服務，提交手機（必填）與備註（選填）。
- 服務時長：不同服務有不同耗時，系統自動避開衝突、打烊與緩衝時間。
- 每日上限：同一使用者每日最多預約 3 次、取消 3 次（以 Asia/Taipei 計算）。
- 我的預約：顯示「未取消」與「已取消」區塊，可在列表右側取消。
- 後台管理：密碼登入、月曆顯示、手動新增/刪除封鎖區間、查看未來預約。
- 時區策略：DB 永遠儲存 UTC，顯示/邏輯以 Asia/Taipei。

## 快速開始
- 需求：Node.js 18+、npm、SQLite（隨 Prisma 自帶驅動即可）。
- 建立環境變數檔：
  - `cp .env.example .env`，依下方說明填入.
- 初始化與啟動（開發模式）：
  - `npm install`
  - `npx prisma db push && npx prisma generate`
  - `npm run dev`
- 生產環境：
  - `npm run build`
  - `NODE_ENV=production npm start`

## 環境變數說明（.env）
- 必填
  - `DATABASE_URL`: SQLite 路徑，例如 `file:./dev.db`。
  - `ADMIN_PASSWORD`: 後台 `/admin/login` 密碼。
  - `TZ`: 時區，預設 `Asia/Taipei`。
- 營業規則
  - `BUSINESS_DAYS`: 營業日陣列，`0`=週日，如 `[1,2,3,4,5,6]`。
  - `OPEN_TIME` / `CLOSE_TIME`: 營業時間（24 小時制），如 `10:00` / `19:00`。
  - `APPOINTMENT_SLOT_MINUTES`: 起始顆粒度（例如 `60` 代表每小時一格）。
  - `BOOKING_BUFFER_MINUTES`: 距離現在多少分鐘以內不可預約（緩衝）。
  - `NEXT_MONTH_OPEN_DAY`: 每月幾號開放「下個月」預約（本月永遠開放）。
- LINE Login（登入必填）
  - `LINE_CHANNEL_ID`: LINE Developers 建立 Login Channel 取得。
  - `LINE_CHANNEL_SECRET`: 同上。
  - `LINE_REDIRECT_URI`: 回呼網址，開發環境通常為 `http://localhost:3000/api/auth/line/callback`；部署後請改成正式網域的 https 版本，並同步到 LINE 後台 Callback URL。
- Telegram（選填，用於店主收到新預約通知/摘要）
  - `TELEGRAM_BOT_TOKEN`: @BotFather 建立的 Bot Token。
  - `TELEGRAM_CHAT_ID`: 要接收通知的 chat id。

## LINE Login 設定流程（必要）
- LINE Developers 建立「LINE Login」Channel。
- Scope 勾選：`openid`、`profile`。
- Callback URL 設為 `.env` 的 `LINE_REDIRECT_URI`（字串需完全一致）。
- 把 `LINE_CHANNEL_ID`、`LINE_CHANNEL_SECRET`、`LINE_REDIRECT_URI` 寫入 `.env`，重新啟動專案。

## 開發者指引
- 預約 API：`POST /api/bookings`，會再驗證該時段可用、寫入 `Booking` 並通知 Telegram。
- 可用時段 API：`GET /api/availability?date=YYYY-MM-DD&serviceId=...`，需登入，回傳 `slots: string[]`（24h 內照規則濾除）。
- 我的預約頁：`/my`（登入後顯示列表，可取消、顯示已取消區塊）。
- 後台：`/admin/login`（用 `ADMIN_PASSWORD` 登入）→ `/admin`。

## 注意事項與最佳實踐
- 務必不要把 `.env`、`.next`、`node_modules`、`prisma/dev.db` 提交到 Git（`.gitignore` 已包含）。
- 若不小心提交過敏感資訊，請旋轉密鑰並使用 `git filter-repo` 移除歷史紀錄後強制推送。
- 預設資料庫為 SQLite，適合單機部署；若要上雲（如 Vercel），建議改用 Postgres 並更新 `DATABASE_URL`。

## 常用指令
- 初始化 DB：`npx prisma db push && npx prisma generate`
- 開發模式：`npm run dev`
- 打包與啟動：`npm run build && npm start`
- 建立/刪除封鎖：後台 `/admin` 操作。

## 第三方元件
- `react-calendar` – MIT License
