# FSD Windows Worker

Worker service untuk menjalankan pipeline FSD lengkap di Windows Server:
Playwright screenshot → Gemini flow analysis → Python Pandoc → Word COM → Vercel Blob upload.

## Prerequisites

- Windows Server / VM dengan Node 20+, Python 3.11+
- Pandoc, Microsoft Word, pywin32
- `pip install playwright python-docx` + `playwright install chromium`
- Repo prototype di `FSD_PROTOTYPE_ROOT` (default: parent of worker folder)
- Static server untuk capture: `npx http-server -p 5500 -c-1` di root prototype

## Environment (.env di root prototype)

```
KV_REST_API_URL=
KV_REST_API_TOKEN=
BLOB_READ_WRITE_TOKEN=
GEMINI_API_KEY=
FSD_WEBHOOK_SECRET=
FSD_CAPTURE_BASE_URL=http://127.0.0.1:5500
FSD_WORKER_PORT=3950
FSD_PROTOTYPE_ROOT=D:\Falcon\Prototype
WINDOWS_WORKER_WEBHOOK_URL=https://your-vm:3950/fsd/jobs
```

Vercel production set `WINDOWS_WORKER_WEBHOOK_URL` ke URL internal/VPN worker.

## Run

```powershell
cd worker\fsd-windows
node index.js
```

## Install as Windows Service (NSSM)

```powershell
nssm install FalconFsdWorker "C:\Program Files\nodejs\node.exe" "D:\Falcon\Prototype\worker\fsd-windows\index.js"
nssm set FalconFsdWorker AppDirectory D:\Falcon\Prototype\worker\fsd-windows
nssm start FalconFsdWorker
```

## Flow

1. Vercel API enqueue job → KV (`status: queued`)
2. Webhook POST `/fsd/jobs` `{ jobId }` + header `X-FSD-Signature`
3. Poll fallback every 10s if webhook missed
4. Worker: capture → AI → build → upload Blob → KV `done` + `downloadUrl`

## Logs

Default: `worker/fsd-windows/worker.log`

## Stuck jobs

Jobs in non-terminal status > 45 minutes are logged as warnings (see `checkStuckJobs`).
