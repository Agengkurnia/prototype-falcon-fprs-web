# Master Channel — Web (dual-surface)

## Surfaces

| Surface | Path | Mode |
|---------|------|------|
| **Master Data Portal** (CRUD) | `Views/MasterDataPortal/Channel/index.html` | Kelola hierarki Channel → Type Customer → Account + mapping triple |
| **Man Power GT / FPRS** (view-only) | `Views/FPRS/MasterData/Channel/index.html` | Lihat saja; link ke Portal untuk ubah |

Portal hub: `Views/MasterDataPortal/` — **layout Vuexy sama** Man Power GT (`layout.js`), sidebar hanya **Channel**.

Data **satu sumber** (`localStorage` + seed JSON) — ubah di Portal, langsung terlihat di FPRS.

## Fungsi (Portal — CRUD)

- **Index — Tab Mapping** (default): DataTable semua triple Channel · Type Customer · Account; tombol **Tambah Mapping**.
- **Index — Tab Manage**: accordion per master — **Channel**, **Type Customer**, **Account** (masing-masing DataTable + Tambah/Ubah modal).

## Fungsi (FPRS — view-only)

- List mapping saja (Channel · Type Customer · Account); **tanpa detail**.
- CTA **Kelola di Master Data Portal**.

## Data
| File | localStorage |
|------|----------------|
| `wwwroot/data/channel.json` | `md_channel` |
| `wwwroot/data/type-customer.json` | `md_type_customer` |
| `wwwroot/data/account.json` | `md_account` |
| `wwwroot/data/channel-mapping.json` | `md_channel_mapping` |

Seed ver: `hierarchy-20260812b`. Type Customer = **master global** (distinct `TypeCus`); hubungan ke Channel hanya via mapping triple. Regenerate: `py scripts/seed_channel_hierarchy_from_csv.py`.

## Pola
[master_data_pola.md](master_data_pola.md)
