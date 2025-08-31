# 美甲預約系統

使用 Next.js 14、TypeScript、Tailwind CSS、Prisma + SQLite 建立的單人美甲師預約網站。

## 功能
- 前台預約：選擇日期與時段、填寫資料後建立預約。
- 後台管理：簡易密碼登入、月曆顯示、手動新增/刪除封鎖區間、查看未來預約。
- 避免重複預約與設定緩衝時間。
- 所有時間以 UTC 儲存，顯示為 Asia/Taipei。
- 預約建立後以 `console.log` 通知，可自行改為 Email（例如使用 SendGrid/Resend）。

## 環境變數
請參考 `.env.example` 建立 `.env` 檔：
```
cp .env.example .env
```
`ADMIN_PASSWORD` 為後台登入密碼。

## 安裝與啟動
```
npm install
npx prisma migrate dev
npm run dev
```

## 第三方元件
- [react-calendar](https://github.com/wojtekmaj/react-calendar) – MIT License

## 部署
可直接部署至 Vercel 或一般 Node 主機。
