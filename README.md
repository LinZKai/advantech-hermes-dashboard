# Hermes Feedback Intelligence Dashboard

Hermes Feedback Intelligence 系統的前端 Dashboard。負責呈現 User Feedback → Cases →
Case Intelligence → Reflector Improvement Proposal → Human Review → Curator Proposed
Change → Human Review → Apply to Runtime 這條 improvement lifecycle 的證據與人工審核介面。

本 repo 只負責 UI 呈現與 human-in-the-loop 操作,不包含任何 backend business logic、
不直接讀取資料庫。所有資料皆透過 REST API 向 `advantech-hermes-feedback` repo 的 FastAPI
backend 取得。

## Tech Stack

- React 19 + TypeScript
- Vite 7(build tool / dev server)
- react-router-dom(routing)
- recharts(Overview 頁面圖表)
- lucide-react(icons)
- Plain CSS + CSS Modules(無 UI framework、無 Tailwind)

## Backend Requirement

Dashboard 假設 backend FastAPI server 運行於:

```
http://127.0.0.1:8800
```

Backend 需提供以下 API(詳見 `src/types/api.ts`):

```
GET  /overview
GET  /cases
GET  /cases/{case_id}
GET  /improvements
GET  /improvements/{proposal_id}
GET  /curator-changes/{change_id}
POST /improvements/{proposal_id}/review
POST /curator-changes/{change_id}/review
POST /curator-changes/{change_id}/apply
```

## How to Install

```bash
npm install
```

## How to Run

```bash
npm run dev
```

開發伺服器預設運行於 `http://localhost:5173`。

請另外啟動 backend(於 `advantech-hermes-feedback` repo)於 `127.0.0.1:8800`,Dashboard
才能取得真實資料;若 backend 未啟動,頁面會顯示 inline error state,不會 crash。

## Vite Proxy

`vite.config.ts` 已設定開發環境 proxy,將前端的 `/api/*` 請求轉送到 backend:

```
/api/*  →  http://127.0.0.1:8800/*
```

所有 API 呼叫皆透過 `src/api/client.ts` 這個集中的 API client(呼叫 `/api/...`),
component 內不會出現 hard-coded backend URL。

## Available Pages

| Route                    | Page              |
| ------------------------- | ----------------- |
| `/`                        | Overview           |
| `/cases`                   | Cases              |
| `/cases/:caseId`           | Case Detail        |
| `/improvements`            | Improvements       |
| `/improvements/:proposalId`| Improvement Detail |

## Project Structure

```
src/
  assets/        # Advantech logo 等靜態資源
  api/           # 集中 API client + data-fetching hook
  components/    # 可重用元件(Sidebar、StatCard、StatusBadge、AsyncState...)
  pages/         # 各路由頁面
  types/         # 對應 backend API 的 TypeScript type
  App.tsx
  main.tsx
```
