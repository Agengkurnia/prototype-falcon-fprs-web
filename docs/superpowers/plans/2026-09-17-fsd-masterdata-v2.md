# FSD Data Master v2.0 Implementation Plan

> **For agentic workers:** Execute inline in this session. User requested implementation immediately.

**Goal:** Generate `FSD_Falcon_Web_MasterData_v2.0.md` + `.docx` from HTML Master Data + MAVEN.DAL GT tables, without editing the v1.17 pipeline.

**Architecture:** New scripts next to the existing FalconWebPortal FSD pipeline. Capture overwrites `screenshots/`. Assemble imports `extract_module_spec` (read-only) and `maven_gt_spec.py`. Build uses FSD Generator Engine `fsd_module_runner`.

**Tech Stack:** Python 3, Playwright, Pandoc, python-docx, Kroki, FSD Generator Engine `lib/`.

## Global Constraints

- Do not edit `assemble_fsd_masterdata.py`, `maven_spec.py`, `build_masterdata_fsd.py`, or `source/FSD_Falcon_Web_MasterData_v1.0.md`.
- ERD tables: `mGt*` + `mPajak` + `mGtReason` only. No invented `mProduk` / `mAlasan` / `mLimitTargetHarian`.
- Screenshot filenames stay v1 names; files are overwritten.
- After MD exists, `py scripts/build_masterdata_fsd_v2.py` must succeed.

## Tasks

1. `scripts/maven_gt_spec.py` — mapping + ERD from ModelBuilders
2. `scripts/assemble_fsd_masterdata_v2.py` — MD v2.0
3. `scripts/capture_masterdata_v2.py` — wrap existing capture + Limit validations
4. `scripts/build_masterdata_fsd_v2.py` — DOCX v2.0
5. Run capture (server :5502)
6. Run assemble
7. Run build
8. Verify MD mentions `mGtProduk` / `mGtReason` and DOCX exists
