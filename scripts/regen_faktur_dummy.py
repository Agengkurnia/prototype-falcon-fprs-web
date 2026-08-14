#!/usr/bin/env python3
"""Regenerate wwwroot/data/faktur.json with mixed SKU counts and UOM."""
from __future__ import annotations

import json
import random
import re
import shutil
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "wwwroot" / "data"
COPIES = [
    ROOT / "Mobile" / "MobileApp" / "assets" / "www" / "wwwroot" / "data" / "faktur.json",
    ROOT / "Mobile" / "MobileApp_capacitor" / "www" / "wwwroot" / "data" / "faktur.json",
    ROOT / "falcon_sfa_mobile" / "android" / "app" / "src" / "main" / "assets" / "web" / "wwwroot" / "data" / "faktur.json",
]

PCS_PER_DUS = 6
PCS_PER_KRT = 72
KODE_TX = [
    "01 - Kepada Selain Pemungut PPN",
    "08 - Penyerahan Fasilitas PPN Dibebaskan",
]
HOURS = [(9, 0), (10, 15), (11, 30), (13, 0), (13, 30), (14, 45), (15, 20)]


def norm_city(raw: str) -> str:
    s = (raw or "").strip()
    s = re.sub(r"\s+\d+$", "", s)
    s = re.sub(r"^Jakarta\s+\w+$", "Jakarta", s, flags=re.I)
    if s.lower().startswith("jakarta"):
        return "Jakarta"
    return s


def pick_stokis(rng: random.Random, pel: dict, stokis: list[dict]) -> dict:
    city = norm_city(pel.get("kota") or "")
    hits = [s for s in stokis if norm_city(s.get("branch") or "") == city]
    pool = hits or stokis
    return rng.choice(pool)


def due_from(term: str, d: date) -> date:
    t = (term or "Net 30").lower()
    if "cash" in t:
        return d
    if "14" in t:
        return d + timedelta(days=14)
    if "7" in t:
        return d + timedelta(days=7)
    return d + timedelta(days=30)


LEAVE_RANGES = [
    (date(2026, 1, 1), date(2026, 1, 2)),
    (date(2026, 3, 18), date(2026, 3, 25)),
    (date(2026, 12, 24), date(2026, 12, 26)),
    (date(2026, 12, 31), date(2026, 12, 31)),
]
BOOST_DAYS = {
    date(2026, 2, 17), date(2026, 4, 3), date(2026, 5, 1), date(2026, 5, 14),
    date(2026, 5, 27), date(2026, 6, 1), date(2026, 6, 16), date(2026, 8, 17), date(2026, 8, 25),
}


def is_leave(d: date) -> bool:
    if d.weekday() == 6:
        return True
    return any(a <= d <= b for a, b in LEAVE_RANGES)


def day_weight(d: date) -> float:
    if is_leave(d):
        return 0.0
    if d in BOOST_DAYS:
        return 1.8
    if d.weekday() == 5:
        return 0.7
    return 1.0


def pick_day(rng: random.Random) -> date:
    for _ in range(60):
        d = date(2026, 1, 1) + timedelta(days=rng.randint(0, 364))
        w = day_weight(d)
        if w <= 0:
            continue
        if rng.random() < w / 1.8:
            return d
    return date(2026, 6, 10)


def sku_count(rng: random.Random) -> int:
    roll = rng.random()
    if roll < 0.08:
        return 1
    if roll < 0.28:
        return 2
    if roll < 0.62:
        return rng.randint(3, 4)
    if roll < 0.88:
        return rng.randint(5, 6)
    return rng.randint(7, min(8, 26))


def pick_uom(rng: random.Random) -> str:
    roll = rng.random()
    if roll < 0.28:
        return "KARTON"
    if roll < 0.62:
        return "DUS"
    return "PCS"


def pack_size(uom: str) -> int:
    if uom == "KARTON":
        return PCS_PER_KRT
    if uom == "DUS":
        return PCS_PER_DUS
    return 1


def qty_for(rng: random.Random, uom: str) -> int:
    if uom == "KARTON":
        return rng.randint(1, 6)
    if uom == "DUS":
        return rng.randint(1, 10)
    return rng.choice([1, 2, 3, 4, 6, 8, 10, 12, 18, 24])


def build_lines(rng: random.Random, products: list[dict], n_sku: int) -> list[dict]:
    chosen = rng.sample(products, k=min(n_sku, len(products)))
    lines = []
    for prod in chosen:
        uoms = [pick_uom(rng)]
        if n_sku == 1 and rng.random() < 0.45:
            extra = pick_uom(rng)
            if extra not in uoms:
                uoms.append(extra)
        elif rng.random() < 0.22:
            extra = pick_uom(rng)
            if extra not in uoms:
                uoms.append(extra)
        for uom in uoms:
            qty = qty_for(rng, uom)
            harga = int(prod.get("hargaJual") or 0) * pack_size(uom)
            diskon = 0
            if rng.random() < 0.08:
                diskon = int(round(harga * qty * 0.05))
            lines.append({
                "kode": prod["kode"],
                "nama": prod["nama"],
                "qty": qty,
                "satuan": uom,
                "hargaUnit": harga,
                "diskon": diskon,
                "pajak": prod.get("namaPajak") or "NoPPN",
            })
    return lines


def main() -> None:
    rng = random.Random(20260814)
    pelanggan = json.loads((DATA / "pelanggan.json").read_text(encoding="utf-8"))
    produk = [p for p in json.loads((DATA / "produk.json").read_text(encoding="utf-8"))
              if str(p.get("status", "")).lower() == "active"]
    stokis = [s for s in json.loads((DATA / "stokis.json").read_text(encoding="utf-8"))
              if str(s.get("status", "")).lower() == "active"]
    outlets = [p for p in pelanggan if str(p.get("status", "")).lower() in ("active", "unverified")]
    rng.shuffle(outlets)

    invoices = []
    seq = 6100
    n = 1400
    extra_boost = 4
    planned_days = [pick_day(rng) for _ in range(n)]
    planned_days.extend([d for d in BOOST_DAYS for _ in range(extra_boost)])
    rng.shuffle(planned_days)
    for i, day in enumerate(planned_days):
        pel = outlets[i % len(outlets)]
        st = pick_stokis(rng, pel, stokis)
        hh, mm = rng.choice(HOURS)
        term = pel.get("waktuPembayaran") or "Net 30"
        n_sku = sku_count(rng)
        if day in BOOST_DAYS:
            n_sku = max(n_sku, rng.randint(4, 7))
        lines = build_lines(rng, produk, n_sku)
        total = sum(it["qty"] * it["hargaUnit"] - it["diskon"] for it in lines)
        seq += 1
        invoices.append({
            "id": f"SI-{day.strftime('%y%m%d')}{seq}",
            "tanggalFaktur": f"{day.isoformat()}T{hh:02d}:{mm:02d}:00",
            "pelangganId": pel.get("id"),
            "pelangganNama": pel.get("nama"),
            "pelangganKode": pel.get("kode"),
            "pelangganAlamat": pel.get("alamat"),
            "salesNama": pel.get("salesman") or pel.get("employee") or "",
            "gudang": st.get("nama"),
            "tanggalJatuhTempo": due_from(term, day).isoformat(),
            "jangkaWaktuPembayaran": term,
            "jumlahTagihan": total,
            "belumDibayar": 0,
            "status": "Paid",
            "tipe": "Canvass",
            "kodeTransaksi": rng.choice(KODE_TX),
            "catatan": "",
            "items": lines,
        })

    invoices.sort(key=lambda x: x["tanggalFaktur"], reverse=True)
    out = DATA / "faktur.json"
    out.write_text(json.dumps(invoices, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for dest in COPIES:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out, dest)

    from collections import Counter
    lens = Counter(len({it['kode'] for it in inv['items']}) for inv in invoices)
    uoms = Counter(it['satuan'] for inv in invoices for it in inv['items'])
    print(f"wrote {len(invoices)} invoices -> {out}")
    print("sku-per-invoice", dict(sorted(lens.items())))
    print("satuan", dict(uoms))
    for dest in COPIES:
        print("copied", dest)


if __name__ == "__main__":
    main()
