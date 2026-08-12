#!/usr/bin/env python3
"""Parse Channel/TypeCus/Account CSV → wwwroot/data seed JSON.

Masters:
  - Channel (distinct Channel)
  - Type Customer (distinct TypeCus, GLOBAL — tidak diikat channelId)
  - Account (distinct Account kode)
Mapping:
  - triple unik (channelId, typeCustomerId, accountId)
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

CSV_PATH = Path(
    r"d:\Work\Kalbe Nutritionals\Query Export\2026"
    r"\_Select_distinct_f_Channel_f_TypeCus_c_Account_c_GROUP_OUTLET_Fr_202608121026.csv"
)
OUT_DIR = Path(__file__).resolve().parents[1] / "wwwroot" / "data"
SEED_VER = "hierarchy-20260812b"


def main() -> None:
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    channels: dict[str, int] = {}
    type_customers: dict[str, int] = {}
    accounts: dict[str, int] = {}
    channel_list = []
    type_list = []
    account_list = []
    mapping_list = []
    seen_maps: set[tuple[int, int, int]] = set()

    next_ch = 1
    next_tc = 1
    next_acc = 1
    next_map = 1

    for row in rows:
        ch_name = (row.get("Channel") or "").strip()
        tc_name = (row.get("TypeCus") or "").strip()
        acc_kode = (row.get("Account") or "").strip()
        if not ch_name or not tc_name or not acc_kode:
            continue

        if ch_name not in channels:
            channels[ch_name] = next_ch
            channel_list.append({"id": next_ch, "nama": ch_name, "active": True})
            next_ch += 1
        ch_id = channels[ch_name]

        if tc_name not in type_customers:
            type_customers[tc_name] = next_tc
            type_list.append({"id": next_tc, "nama": tc_name, "active": True})
            next_tc += 1
        tc_id = type_customers[tc_name]

        if acc_kode not in accounts:
            accounts[acc_kode] = next_acc
            account_list.append({"id": next_acc, "kode": acc_kode, "active": True})
            next_acc += 1
        acc_id = accounts[acc_kode]

        key = (ch_id, tc_id, acc_id)
        if key in seen_maps:
            continue
        seen_maps.add(key)
        mapping_list.append(
            {
                "id": next_map,
                "channelId": ch_id,
                "typeCustomerId": tc_id,
                "accountId": acc_id,
            }
        )
        next_map += 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = {
        "channel.json": channel_list,
        "type-customer.json": type_list,
        "account.json": account_list,
        "channel-mapping.json": mapping_list,
    }
    for name, payload in files.items():
        (OUT_DIR / name).write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {name}: {len(payload)} rows")

    print(f"SEED_VER={SEED_VER}")


if __name__ == "__main__":
    main()
