"""Expand pelanggan.json with dummy customers so every channel has members.
Rule: 1 pelanggan hanya 1 channel. Existing 15 records are preserved.
"""
import json, os, random

random.seed(42)
BASE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(BASE, 'pelanggan.json')

with open(PATH, encoding='utf-8') as f:
    data = json.load(f)

# keep only the original seed (id 1..15) as the base
base = [p for p in data if p.get('id', 0) <= 15]

cities = [
    ("Jakarta Pusat", -6.1862, 106.8342), ("Jakarta Selatan", -6.2607, 106.8106),
    ("Bandung", -6.9163, 107.6202), ("Bekasi", -6.2323, 106.9811),
    ("Bogor", -6.5878, 106.8232), ("Depok", -6.3989, 106.7975),
    ("Surabaya", -7.2563, 112.7532), ("Semarang", -6.9932, 110.4203),
    ("Medan", 3.5952, 98.6722), ("Padang", -0.9387, 100.4249),
    ("Palembang", -2.9761, 104.7754), ("Makassar", -5.1477, 119.4327),
    ("Denpasar", -8.6705, 115.2126), ("Yogyakarta", -7.7956, 110.3695),
    ("Balikpapan", -1.2283, 116.8617),
]
persons = [
    "Budi Santoso", "Siti Aminah", "Andi Wijaya", "Rina Kartika", "Slamet Riyadi",
    "Dewi Lestari", "Agus Salim", "Maria Ulfa", "Hartono", "Nur Cahyo",
    "Yusuf Maulana", "Lina Marlina", "Eko Prasetyo", "Fitri Handayani", "Rudi Hermawan",
    "Sri Wahyuni", "Bambang Sutrisno", "Ratna Sari", "Joko Purnomo", "Indah Permata",
    "Wawan Setiawan", "Nurul Hidayah", "Dedi Kurniawan", "Yanti Suryani", "Hendra Gunawan",
]

# name template pools per channel
templates = {
    "MT-HPM-NKA": ["Hypermart {c}", "Lotte Mart {c}", "Transmart {c}"],
    "MT-MM-NKA": ["Indomaret {c}", "Alfamart {c}", "Alfamidi {c}"],
    "MT-MM-MTI": ["Indomaret Point {c}", "Alfamart Plus {c}", "Circle K {c}"],
    "MT-SPM-NKA": ["Superindo {c}", "Giant {c}", "Foodmart {c}"],
    "MT-SPM-RKA": ["Ranch Market {c}", "Farmers Market {c}", "Grand Lucky {c}"],
    "MT-SPM-MTI": ["Yogya Supermarket {c}", "Borma {c}", "Griya {c}"],
    "SPC-BABY SHOP": ["Baby Shop {c}", "Toko Bayi Ceria {c}", "Mothercare {c}"],
    "SPC-TOKO BUAH": ["Toko Buah Segar {c}", "All Fresh {c}", "Total Buah {c}"],
    "SPC-TOKO SUSU": ["Toko Susu Sehat {c}", "Milk Store {c}", "Susu Center {c}"],
    "SPC-TOKO SUSU TRADITIONAL": ["Warung Susu {c}", "Kios Susu {c}", "Susu Murni {c}"],
    "GT-GROSIR": ["Grosir Makmur {c}", "UD Sumber Rezeki {c}", "PD Jaya Abadi {c}"],
    "GT-KELONTONG": ["Toko Berkah {c}", "Warung Bu {p}", "Toko {p}"],
    "GI HORECA": ["Cafe Nikmat {c}", "Restoran Selera {c}", "Hotel Mawar {c}"],
    "MED-APOTIK": ["Apotek Sehat {c}", "Apotek K24 {c}", "Apotek Kimia Farma {c}"],
    "MED-BIDAN": ["Praktik Bidan {p}", "Bidan {p}", "Klinik Bidan {c}"],
    "MED-DHB": ["Distributor Herbal {c}", "Toko Herbal {c}", "DHB {p}"],
    "MED-HCP": ["Praktik dr. {p}", "Klinik dr. {p}", "Dokter {p}"],
    "MED-RS KLINIK": ["RS Mitra {c}", "Klinik Sehat {c}", "RSU {c}"],
    "MED-TOKO OBAT": ["Toko Obat Sehat {c}", "Toko Obat {p}", "Sinar Obat {c}"],
    "ECOM": ["Online Store {p}", "{p} Shop", "E-Store {c}"],
    "MED-PBF": ["PBF {c} Farma", "PT {p} Pharma", "PBF Sehat {c}"],
}

outlet_types = ["Outlet Regular", "Outlet Prime", "Outlet Star"]
pay_terms = ["Cash", "Net 7", "Net 14", "Net 30"]

# counts per channel (dummy detail members)
counts = {
    "MT-HPM-NKA": 8, "MT-MM-NKA": 12, "MT-MM-MTI": 9, "MT-SPM-NKA": 14,
    "MT-SPM-RKA": 7, "MT-SPM-MTI": 6, "SPC-BABY SHOP": 6, "SPC-TOKO BUAH": 6,
    "SPC-TOKO SUSU": 7, "SPC-TOKO SUSU TRADITIONAL": 6, "GT-GROSIR": 13,
    "GT-KELONTONG": 15, "GI HORECA": 8, "MED-APOTIK": 12, "MED-BIDAN": 8,
    "MED-DHB": 6, "MED-HCP": 7, "MED-RS KLINIK": 8, "MED-TOKO OBAT": 10,
    "ECOM": 6, "MED-PBF": 5,
}

result = list(base)
nid = 16
kode_n = 16

for channel, n in counts.items():
    tmpls = templates[channel]
    for i in range(n):
        city, lat, lng = random.choice(cities)
        person = random.choice(persons)
        tmpl = tmpls[i % len(tmpls)]
        nama = tmpl.format(c=city, p=person)
        has_gps = random.random() > 0.15
        rec = {
            "id": nid,
            "kode": f"CS-{kode_n:03d}",
            "nama": nama,
            "partnerId": "",
            "alamat": f"Jl. {random.choice(['Merdeka','Sudirman','Ahmad Yani','Diponegoro','Gatot Subroto'])} No.{random.randint(1,150)}, {city}",
            "telepon": "0" + str(random.randint(2, 8)) + str(random.randint(10000000, 99999999)) if has_gps else "",
            "employee": city.split()[0].upper(),
            "kunjunganTerakhir": f"2026-06-{random.randint(1,5):02d}",
            "transaksiTerakhir": f"2026-06-{random.randint(1,5):02d}",
            "status": "Active" if random.random() > 0.2 else "Unverified",
            "grupPelanggan": "",
            "daftarHarga": "Inc Pajak",
            "waktuPembayaran": random.choice(pay_terms),
            "salesman": city.split()[0].upper(),
            "pemilik": random.choice(persons),
            "npwp": f"09{random.randint(1000000000000, 9999999999999)}",
            "rtrw": f"{random.randint(1,15):03d}/{random.randint(1,10):03d}",
            "kelurahan": f"Kel. {city.split()[0]} {random.randint(1,5)}",
            "kecamatan": f"Kec. {city.split()[0]} {random.randint(1,3)}",
            "kota": city,
            "channel": channel,
            "outletType": random.choice(outlet_types),
            "lat": round(lat + random.uniform(-0.03, 0.03), 4),
            "lng": round(lng + random.uniform(-0.03, 0.03), 4),
            "hasGps": has_gps,
            "photo": "",
        }
        result.append(rec)
        nid += 1
        kode_n += 1

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# summary
from collections import Counter
c = Counter(p['channel'] for p in result)
print(f"Total pelanggan: {len(result)}")
for ch, n in c.most_common():
    print(f"  {ch}: {n}")
