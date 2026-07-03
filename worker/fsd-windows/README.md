# FSD Windows Worker

Worker service untuk menjalankan pipeline FSD di Windows Server dengan **smart cache**:
cache AI + screenshot dari Git → assemble → Pandoc → Word COM → Vercel Blob.

## Prerequisites

- Windows Server / VM dengan Node 20+, Python 3.11+
- Pandoc, Microsoft Word, pywin32
- `pip install playwright python-docx` + `playwright install chromium`
- Repo prototype di `FSD_PROTOTYPE_ROOT`
- Static server untuk capture (hanya saat refresh screenshot): `npx http-server -p 5500 -c-1`

## Environment (.env di root prototype)

```
KV_REST_API_URL=
KV_REST_API_TOKEN=
BLOB_READ_WRITE_TOKEN=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
FSD_PROMPT_VERSION=fsd-flow-v2
FSD_AI_CONCURRENCY=5
FSD_WEBHOOK_SECRET=
FSD_CAPTURE_BASE_URL=http://127.0.0.1:5500
FSD_WORKER_PORT=3950
FSD_PROTOTYPE_ROOT=D:\Falcon\Prototype
WINDOWS_WORKER_WEBHOOK_URL=https://your-vm:3950/fsd/jobs
FSD_WORKER_GIT_PULL=false
```

## Smart cache (Git)

Asset cache disimpan di repo:

```
wwwroot/document/FSD/FalconWebPortal/
  _cache/manifest.json    # hash per modul
  _cache/ai/*.md          # output Gemini
  screenshots/*.png       # UI screenshots
```

**Workflow tim:**

1. Ubah HTML modul → `npm run fsd:prewarm -- --module=<id>`
2. Commit `_cache/` + `screenshots/` ke Git
3. Worker `git pull` → Generate FSD UI pakai **Smart Generate** (~3–8 menit full portal)

**Bootstrap awal:**

```powershell
npx http-server -p 5500 -c-1
npm run fsd:capture
npm run fsd:prewarm
git add wwwroot/document/FSD/FalconWebPortal/_cache wwwroot/document/FSD/FalconWebPortal/screenshots
```

## Run worker

```powershell
npm run fsd:worker
```

## Install as Windows Service (NSSM)

```powershell
nssm install FalconFsdWorker "C:\Program Files\nodejs\node.exe" "D:\Falcon\Prototype\worker\fsd-windows\index.js"
nssm set FalconFsdWorker AppDirectory D:\Falcon\Prototype\worker\fsd-windows
nssm start FalconFsdWorker
```

## Flow

1. Vercel API enqueue job → KV (`status: queued`)
2. Webhook POST `/fsd/jobs` `{ jobId }` + `X-FSD-Signature`
3. Poll fallback every 10s if webhook missed
4. Worker: **plan cache** → capture (hanya stale) → AI (hanya stale, paralel) → build → upload
5. UI **Smart** (default) vs **Full Refresh**

## Cache invalidation

- HTML/JS modul berubah → `sourceHash` berubah → AI + screenshot stale
- Bump `FSD_PROMPT_VERSION` → semua AI stale
- UI **Full Refresh** → force regenerate semua

## Logs

Default: `worker/fsd-windows/worker.log`

## Stuck jobs

Jobs in non-terminal status > 45 minutes are logged as warnings.

## reference.docx

Untuk styling ItemSpec AKS penuh, letakkan `reference.docx` di:
`wwwroot/document/FSD/FalconWebPortal/reference.docx`
