/**
 * sfa-store.js — Falcon SFA Mobile Shared Data Layer
 * Menyimulasikan offline SQLite database SimpliDOTS SFA
 * Semua halaman membaca/menulis dari satu sumber ini.
 */
(function(window) {
    'use strict';

    // =========================================================
    // SEED DATA
    // =========================================================
    const SEED_CUSTOMERS = [
        { id: 'OL-10492', name: 'Apotek Sehat Prima',      outletType: 'Apotek',         address: 'Jl. Kebayoran Baru No.12', kota: 'Jakarta Selatan', owner: 'Drs. Hendra S.',  phone: '0812-1111-2222', channel: 'GT', status: 'Aktif',     lat: -6.2200, lng: 106.8100, arBalance: 0,         top: 14, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' },
        { id: 'OL-10511', name: 'Toko Ibu & Anak Melati',  outletType: 'Baby Shop',      address: 'Jl. Fatmawati Raya No.55', kota: 'Jakarta Selatan', owner: 'Siti Rahayu',     phone: '0813-3333-4444', channel: 'GT', status: 'Aktif',     lat: -6.2890, lng: 106.7940, arBalance: 1850000,   top: 30, imageUrl: '../../wwwroot/assets/images/outlets/baby_shop.png' },
        { id: 'OL-10283', name: 'Apotek Roxy Salemba',     outletType: 'Apotek',         address: 'Jl. Salemba Raya No.15',  kota: 'Jakarta Pusat',   owner: 'H. Syamsul A.',   phone: '0821-5555-6666', channel: 'GT', status: 'Aktif',     lat: -6.2010, lng: 106.8440, arBalance: 3750000,   top: 30, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' },
        { id: 'OL-10772', name: 'Klinik Bunda Mulia',      outletType: 'Klinik',         address: 'Jl. Menteng Raya No.88',  kota: 'Jakarta Pusat',   owner: 'dr. Susi W.',     phone: '0815-7777-8888', channel: 'MT', status: 'Aktif',     lat: -6.1960, lng: 106.8370, arBalance: 0,         top: 14, imageUrl: '../../wwwroot/assets/images/outlets/clinic.png' },
        { id: 'OL-10819', name: 'Minimart Keluarga Jaya',  outletType: 'Outlet Regular', address: 'Jl. Tebet Raya No.101',   kota: 'Jakarta Selatan', owner: 'Budi Santoso',    phone: '0817-9999-0000', channel: 'GT', status: 'Aktif',     lat: -6.2250, lng: 106.8510, arBalance: 2100000,   top: 30, imageUrl: '../../wwwroot/assets/images/outlets/minimarket.png' },
        { id: 'OL-10902', name: 'RS Ibu Prima',            outletType: 'Rumah Sakit',    address: 'Jl. Kuningan No.22',      kota: 'Jakarta Selatan', owner: 'Dr. Andika P.',   phone: '0818-1212-3434', channel: 'MT', status: 'Aktif',     lat: -6.2310, lng: 106.8320, arBalance: 8500000,   top: 14, imageUrl: '../../wwwroot/assets/images/outlets/clinic.png' },
        { id: 'OL-11002', name: 'Apotek 24 Jam Selaras',   outletType: 'Apotek',         address: 'Jl. Kemang Raya No.67',   kota: 'Jakarta Selatan', owner: 'Farida Hanum',    phone: '0819-5656-7878', channel: 'GT', status: 'Aktif',     lat: -6.2620, lng: 106.8130, arBalance: 0,         top: 30, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' },
        { id: 'OL-11145', name: 'Posyandu Melati RW 05',   outletType: 'Posyandu',       address: 'Jl. Senopati No.10',      kota: 'Jakarta Selatan', owner: 'Ibu Kartini',     phone: '0822-2345-6789', channel: 'GT', status: 'Potential', lat: -6.2380, lng: 106.8090, arBalance: 0,         top: 0,  imageUrl: '../../wwwroot/assets/images/outlets/minimarket.png' },
        { id: 'OL-11239', name: 'Apotek Kimia Farma 88',   outletType: 'Apotek',         address: 'Jl. Sudirman No.88',      kota: 'Jakarta Pusat',   owner: 'Manager KF88',    phone: '0821-8080-9090', channel: 'MT', status: 'Aktif',     lat: -6.2100, lng: 106.8200, arBalance: 5600000,   top: 14, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' },
        { id: 'OL-11340', name: 'Toko Nutrisi Mama',       outletType: 'Baby Shop',      address: 'Jl. Blok M No.34',        kota: 'Jakarta Selatan', owner: 'Nurhayati',       phone: '0823-4567-8901', channel: 'GT', status: 'Aktif',     lat: -6.2440, lng: 106.7990, arBalance: 750000,    top: 30, imageUrl: '../../wwwroot/assets/images/outlets/baby_shop.png' },
        { id: 'OL-11451', name: 'Koperasi Karyawan PLN',   outletType: 'Koperasi',       address: 'Jl. Gatot Subroto No.47', kota: 'Jakarta Selatan', owner: 'Kop. PLN Jaksel', phone: '0824-6789-0123', channel: 'GT', status: 'Aktif',     lat: -6.2280, lng: 106.8270, arBalance: 0,         top: 30, imageUrl: '../../wwwroot/assets/images/outlets/minimarket.png' },
        { id: 'OL-11562', name: 'Apotek Generik Sehat',    outletType: 'Apotek',         address: 'Jl. Pancoran No.9',       kota: 'Jakarta Selatan', owner: 'Agus Santoso',    phone: '0825-1111-2345', channel: 'GT', status: 'Aktif',     lat: -6.2555, lng: 106.8430, arBalance: 1200000,   top: 30, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' },
        { id: 'OL-11673', name: 'Baby World Pondok Indah', outletType: 'Baby Shop',      address: 'Jl. Metro Pondok Indah',  kota: 'Jakarta Selatan', owner: 'Chandra W.',      phone: '0826-3456-7890', channel: 'MT', status: 'Aktif',     lat: -6.2680, lng: 106.7880, arBalance: 4200000,   top: 14, imageUrl: '../../wwwroot/assets/images/outlets/baby_shop.png' },
        { id: 'OL-11784', name: 'Puskesmas Mampang',       outletType: 'Puskesmas',      address: 'Jl. Mampang Prapatan 12', kota: 'Jakarta Selatan', owner: 'dr. Teguh',       phone: '0827-5678-9012', channel: 'GT', status: 'Aktif',     lat: -6.2490, lng: 106.8160, arBalance: 0,         top: 0,  imageUrl: '../../wwwroot/assets/images/outlets/clinic.png' },
        { id: 'OL-11895', name: 'Apotek Kasih Ibu',        outletType: 'Apotek',         address: 'Jl. Cipete Raya No.23',   kota: 'Jakarta Selatan', owner: 'Dewi Lestari',    phone: '0828-7890-1234', channel: 'GT', status: 'Aktif',     lat: -6.2810, lng: 106.7960, arBalance: 0,         top: 30, imageUrl: '../../wwwroot/assets/images/outlets/apotek.png' }
    ];

    const SEED_PRODUCTS = [
        // ── Susu Formula Bayi ────────────────────────────────────────────────────
        {
            code: 'KN-SF-001', name: 'Morinaga Chil*Kid Gold',
            category: 'Susu Formula', price: 265000, stock: 36, conversionCtn: 12,
            icon: 'fa-baby-bottle', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/morinaga/chilkid-gold/4_87_chil-kid-gold_thumbnail.png',
            promoDesc: 'Beli 3 karton gratis 1 karton. Berlaku s/d 30 Juni 2026.'
        },
        {
            code: 'KN-SF-002', name: 'Morinaga Chil*School Gold',
            category: 'Susu Formula', price: 235000, stock: 18, conversionCtn: 12,
            icon: 'fa-baby-bottle', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/morinaga/chilschool-gold/5_88_chil-school-gold_thumbnail.png'
        },
        {
            code: 'KN-SF-003', name: 'Morinaga Chil*Kid Platinum',
            category: 'Susu Formula', price: 398000, stock: 12, conversionCtn: 12,
            icon: 'fa-baby-bottle', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/morinaga/chilkid-platinum/6_98_chil-kid-platinum_thumbnail.png',
            promoDesc: 'Diskon 10% untuk pembelian min. 2 karton. Promo Canvasser Juni 2026.'
        },
        {
            code: 'KN-SF-004', name: 'Morinaga Chil*School Platinum',
            category: 'Susu Formula', price: 368000, stock: 10, conversionCtn: 12,
            icon: 'fa-baby-bottle', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/morinaga/chilschool-platinum/7_13_chil-school-platinum_thumbnail.png'
        },
        {
            code: 'KN-SF-005', name: 'Morinaga Chil*Go! RTD',
            category: 'Susu Formula', price: 245000, stock: 24, conversionCtn: 24,
            icon: 'fa-baby-bottle', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/morinaga/chilgo/12_34_morinaga-chil-go_thumbnail.png'
        },
        // ── Susu Anak ────────────────────────────────────────────────────────────
        {
            code: 'KN-SA-001', name: 'Zee Platinum (Vanilla/Coklat)',
            category: 'Susu Anak', price: 215000, stock: 30, conversionCtn: 12,
            icon: 'fa-child', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/zee/zee-platinum/41_51_zee-platinum_thumbnail.jpg',
            promoDesc: 'Cashback Rp 15.000 per karton untuk pembelian ≥2 karton.'
        },
        {
            code: 'KN-SA-002', name: 'Zee Reguler',
            category: 'Susu Anak', price: 145000, stock: 24, conversionCtn: 12,
            icon: 'fa-child', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/zee/zee-reguler/42_5_zee-reguler_thumbnail.png'
        },
        {
            code: 'KN-SA-003', name: 'Zee Up & Go',
            category: 'Susu Anak', price: 185000, stock: 20, conversionCtn: 12,
            icon: 'fa-child', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/zee/zee-up-go/43_77_zee-up-go_thumbnail.png'
        },
        // ── Makanan & Nutrisi Bayi ───────────────────────────────────────────────
        {
            code: 'KN-MB-001', name: 'Milna Biskuit Bayi',
            category: 'Makanan Bayi', price: 28500, stock: 60, conversionCtn: 48,
            icon: 'fa-cookie', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/milna/milna-biskuit-bayi/1_75_milna-biskuit-bayi_thumbnail.png'
        },
        {
            code: 'KN-MB-002', name: 'Milna Bubur Bayi',
            category: 'Makanan Bayi', price: 24000, stock: 48, conversionCtn: 48,
            icon: 'fa-cookie', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/milna/milna-bubur-bayi/2_17_milna-bubur-bayi_thumbnail.png',
            promoDesc: 'Gratis 1 Milna Biskuit Bayi setiap pembelian 1 karton Milna Bubur Bayi.'
        },
        {
            code: 'KN-MB-003', name: 'Milna Bubur Organik',
            category: 'Makanan Bayi', price: 32000, stock: 36, conversionCtn: 36,
            icon: 'fa-seedling', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/milna/milna-bubur-organik/13_50_milna-bubur-organic_thumbnail.png'
        },
        {
            code: 'KN-MB-004', name: 'PRENAGEN mommy',
            category: 'Makanan Bayi', price: 135000, stock: 36, conversionCtn: 24,
            icon: 'fa-heart', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/prenagen/prenagen-mommy/33_52_prenagen-mommy_thumbnail.png'
        },
        {
            code: 'KN-MB-005', name: 'PRENAGEN lactamom',
            category: 'Makanan Bayi', price: 145000, stock: 24, conversionCtn: 24,
            icon: 'fa-heart', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/prenagen/prenagen-lactamom/34_87_prenagen-lactamom_thumbnail.png',
            promoDesc: 'Diskon 8% untuk pembelian min. 1 karton. Promo Juni 2026.'
        },
        // ── Nutrisi Dewasa & Lansia ──────────────────────────────────────────────
        {
            code: 'KN-ND-001', name: 'Entrasol Gold',
            category: 'Nutrisi Dewasa', price: 65000, stock: 72, conversionCtn: 24,
            icon: 'fa-mug-hot', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/entrasol/entrasol-gold/20_24_entrasol-gold_thumbnail.png'
        },
        {
            code: 'KN-ND-002', name: 'Entrasol Active',
            category: 'Nutrisi Dewasa', price: 58000, stock: 60, conversionCtn: 24,
            icon: 'fa-dumbbell', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/entrasol/entrasol-active/19_20_entrasol-active_thumbnail.png',
            promoDesc: 'Buy 2 Get 1 untuk varian Active. Berlaku Juni 2026.'
        },
        {
            code: 'KN-ND-003', name: 'Entrasol Platinum',
            category: 'Nutrisi Dewasa', price: 89000, stock: 30, conversionCtn: 12,
            icon: 'fa-mug-hot', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/entrasol/entrasol-senior/57_38_entrasol-platinum_thumbnail.png'
        },
        // ── Minuman Kesehatan ────────────────────────────────────────────────────
        {
            code: 'KN-MK-001', name: 'Nutrive Benecol Smoothie',
            category: 'Minuman Kesehatan', price: 72000, stock: 48, conversionCtn: 12,
            icon: 'fa-flask', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/nutrive-benecol/nutrive-benecol-smoothie/29_68_nutrive-benecol-smoothie_thumbnail.png'
        },
        {
            code: 'KN-MK-002', name: 'Nutrive Benecol Yogurt',
            category: 'Minuman Kesehatan', price: 68000, stock: 36, conversionCtn: 12,
            icon: 'fa-flask', hasPromo: false,
            imageUrl: 'https://kalbenutritionals.com/images/product/nutrive-benecol/nutrive-benecol-yogurt/70_65_nutrive-benecol-yogurt_thumbnail.jpeg'
        },
        // ── Snack Sehat ──────────────────────────────────────────────────────────
        {
            code: 'KN-SK-001', name: 'Fitbar Oat & Fruit',
            category: 'Snack Sehat', price: 58000, stock: 48, conversionCtn: 24,
            icon: 'fa-apple-alt', hasPromo: true,
            imageUrl: 'https://kalbenutritionals.com/images/product/fitbar/fitbar/46_89_fitbar_thumbnail.png',
            promoDesc: 'Diskon 15% untuk pembelian 2 karton atau lebih. Promo Canvasser.'
        }
    ];

    const SEED_STOCKISTS = [
        { id: 'STK-001', name: 'Grosir Sinar Jaya',    address: 'Jl. Pasar Baru No.12, Jakarta Pusat',      kota: 'Jakarta Pusat',  tipe: 'Grosir',        lat: -6.1625, lng: 106.8342 },
        { id: 'STK-002', name: 'PT Sumber Makmur',     address: 'Jl. Mangga Dua Raya, Jakarta Utara',       kota: 'Jakarta Utara',  tipe: 'Distributor',   lat: -6.1350, lng: 106.8230 },
        { id: 'STK-003', name: 'CV Berkah Jaya',       address: 'Jl. Rawa Belong, Jakarta Barat',           kota: 'Jakarta Barat',  tipe: 'Grosir',        lat: -6.1980, lng: 106.7720 },
        { id: 'STK-004', name: 'PT Indo Distribusi',   address: 'Jl. Cakung Cilincing, Jakarta Timur',      kota: 'Jakarta Timur',  tipe: 'Distributor',   lat: -6.1520, lng: 106.9450 },
        { id: 'STK-005', name: 'PT Kalbe Farma Dist.', address: 'Jl. Letjen S. Parman, Jakarta Barat',      kota: 'Jakarta Barat',  tipe: 'Principal',     lat: -6.1890, lng: 106.7980 },
        { id: 'STK-006', name: 'CV Karya Mandiri',     address: 'Jl. Condet Raya, Jakarta Timur',           kota: 'Jakarta Timur',  tipe: 'Grosir',        lat: -6.2780, lng: 106.8520 }
    ];

    const SEED_COLLECTIONS = [
        // AR outstanding untuk beberapa outlet
        { id: 'AR-2026-0011', customerId: 'OL-10511', invoiceNo: 'FKT-2026-0045', date: '2026-05-12', amount: 1850000, balance: 1850000, status: 'outstanding', dueDate: '2026-06-11' },
        { id: 'AR-2026-0022', customerId: 'OL-10283', invoiceNo: 'FKT-2026-0061', date: '2026-05-01', amount: 2500000, balance: 2500000, status: 'outstanding', dueDate: '2026-05-31' },
        { id: 'AR-2026-0023', customerId: 'OL-10283', invoiceNo: 'FKT-2026-0072', date: '2026-05-11', amount: 1250000, balance: 1250000, status: 'outstanding', dueDate: '2026-06-10' },
        { id: 'AR-2026-0031', customerId: 'OL-10819', invoiceNo: 'FKT-2026-0083', date: '2026-05-12', amount: 2100000, balance: 2100000, status: 'outstanding', dueDate: '2026-06-11' },
        { id: 'AR-2026-0041', customerId: 'OL-10902', invoiceNo: 'FKT-2026-0094', date: '2026-04-28', amount: 5000000, balance: 5000000, status: 'outstanding', dueDate: '2026-05-12' },
        { id: 'AR-2026-0042', customerId: 'OL-10902', invoiceNo: 'FKT-2026-0101', date: '2026-05-10', amount: 3500000, balance: 3500000, status: 'outstanding', dueDate: '2026-05-24' },
        { id: 'AR-2026-0051', customerId: 'OL-11239', invoiceNo: 'FKT-2026-0112', date: '2026-05-28', amount: 5600000, balance: 5600000, status: 'outstanding', dueDate: '2026-06-11' },
        { id: 'AR-2026-0061', customerId: 'OL-11340', invoiceNo: 'FKT-2026-0123', date: '2026-05-12', amount: 750000,  balance: 750000,  status: 'outstanding', dueDate: '2026-06-11' },
        { id: 'AR-2026-0071', customerId: 'OL-11562', invoiceNo: 'FKT-2026-0134', date: '2026-05-12', amount: 1200000, balance: 1200000, status: 'outstanding', dueDate: '2026-06-11' },
        { id: 'AR-2026-0081', customerId: 'OL-11673', invoiceNo: 'FKT-2026-0145', date: '2026-05-28', amount: 4200000, balance: 4200000, status: 'outstanding', dueDate: '2026-06-11' }
    ];

    // =========================================================
    // STORAGE KEYS
    // =========================================================
    const KEYS = {
        USER:        'sfa_user',
        VISITS:      'sfa_visits',
        INVOICES:    'sfa_invoices',
        COLLECTIONS: 'sfa_collections',
        CUSTOMERS:   'sfa_customers',
        PRODUCTS:    'sfa_products',
        SYNC_QUEUE:  'sfa_sync_queue',
        SYNC_QUEUE_CLEARED: 'sfa_sync_queue_cleared',
        DOWNLOAD_STATUS: 'sfa_download_status',
        SEEDED:      'sfa_seeded_v9_today',
        ACTIVE_STOCKIST: 'sfa_active_stockist'
    };

    // =========================================================
    // HELPERS
    // =========================================================
    function read(key) {
        try { return JSON.parse(localStorage.getItem(key)) || null; } catch(e) { return null; }
    }
    function write(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.error('SfaStore write error', e); }
    }
    function genId(prefix) {
        return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    function todayStr() {
        return new Date().toISOString().slice(0, 10);
    }

    function getActiveSalesPeriod(date) {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const fmt = (dt) => dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        return {
            label: fmt(start) + ' — ' + fmt(end),
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            monthName: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        };
    }

    function getStockists() {
        try {
            const raw = localStorage.getItem('md_stokis');
            if (raw) {
                const list = JSON.parse(raw);
                return list
                    .filter(s => (s.status || 'Active') === 'Active')
                    .map(s => ({
                        id: s.kode || String(s.id),
                        name: s.nama,
                        address: s.alamat || '',
                        kota: s.kota || '',
                        telepon: s.telepon || '',
                        tipe: s.tipe || 'Grosir',
                        lat: s.lat,
                        lng: s.lng
                    }));
            }
        } catch (e) { /* fallback seed */ }
        return SEED_STOCKISTS;
    }
    function getStockistById(id) {
        return getStockists().find(s => s.id === id) || SEED_STOCKISTS.find(s => s.id === id) || null;
    }

    function getActiveStockist() {
        const id = localStorage.getItem(KEYS.ACTIVE_STOCKIST);
        return id ? getStockistById(id) : null;
    }
    function setActiveStockist(id) {
        if (id) localStorage.setItem(KEYS.ACTIVE_STOCKIST, id);
        else localStorage.removeItem(KEYS.ACTIVE_STOCKIST);
    }

    function haversineMeters(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const toRad = d => d * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function formatDistanceMeters(m) {
        if (m == null || !isFinite(m)) return '—';
        if (m < 1000) return Math.round(m) + ' m';
        return (m / 1000).toFixed(1) + ' km';
    }

    function getNearestStockists(lat, lng, limit = 5) {
        return getStockists()
            .map(s => {
                if (s.lat == null || s.lng == null) {
                    return { ...s, distanceM: null, distanceLabel: '—' };
                }
                const distanceM = haversineMeters(lat, lng, s.lat, s.lng);
                return { ...s, distanceM, distanceLabel: formatDistanceMeters(distanceM) };
            })
            .sort((a, b) => {
                if (a.distanceM == null) return 1;
                if (b.distanceM == null) return -1;
                return a.distanceM - b.distanceM;
            })
            .slice(0, limit);
    }

    // =========================================================
    // SEED: Run once per session install
    // =========================================================
    function seedIfNeeded() {
        const lastSeed = read(KEYS.SEEDED);
        const todayString = todayStr();
        if (lastSeed === todayString) return;

        write(KEYS.CUSTOMERS,   SEED_CUSTOMERS);
        write(KEYS.PRODUCTS,    SEED_PRODUCTS);
        write(KEYS.COLLECTIONS, SEED_COLLECTIONS);
        write(KEYS.VISITS,      buildSeedVisits());
        write(KEYS.INVOICES,    buildSeedInvoices());
        if (!Array.isArray(read(KEYS.SYNC_QUEUE)) || read(KEYS.SYNC_QUEUE).length === 0) {
            write(KEYS.SYNC_QUEUE, buildSeedSyncQueue());
            localStorage.removeItem(KEYS.SYNC_QUEUE_CLEARED);
        }
        write(KEYS.DOWNLOAD_STATUS, buildDefaultDownloadStatus());
        write(KEYS.SEEDED,      todayString);
        console.log('[SfaStore] Seed data v9 (Today route demo) loaded/refreshed for ' + todayString);
    }

    const TODAY_ROUTE_IDS = ['OL-10492', 'OL-10511', 'OL-10283', 'OL-10772', 'OL-10819'];

    const ROUTE_PLAN_WEEKDAY = {
        1: ['OL-10492', 'OL-10511', 'OL-10283'],
        2: ['OL-10772', 'OL-10819', 'OL-10902'],
        3: ['OL-10283', 'OL-11002', 'OL-11145'],
        4: ['OL-10492', 'OL-10819', 'OL-11239'],
        5: ['OL-10511', 'OL-10772', 'OL-11340'],
        6: ['OL-11673', 'OL-11784']
    };

    function getTodayRouteIds() {
        return TODAY_ROUTE_IDS.slice();
    }

    function getPlannedRouteIdsForDate(dateStr) {
        if (dateStr === todayStr()) return getTodayRouteIds();
        const d = new Date(dateStr + 'T12:00:00');
        const dow = d.getDay();
        if (dow === 0) return [];
        return (ROUTE_PLAN_WEEKDAY[dow] || []).slice();
    }

    function wasVisitedOnDate(customerId, dateStr) {
        return getVisits().some(v =>
            v.customerId === customerId &&
            v.date === dateStr &&
            (v.status === 'checked_out' || v.status === 'checked_in')
        );
    }

    function getOverdueRouteCustomers() {
        const today = new Date();
        const bestByCustomer = {};

        for (let day = 1; day < today.getDate(); day++) {
            const dt = new Date(today.getFullYear(), today.getMonth(), day);
            if (dt.getDay() === 0) continue;
            const dateStr = dt.toISOString().slice(0, 10);
            getPlannedRouteIdsForDate(dateStr).forEach(customerId => {
                if (wasVisitedOnDate(customerId, dateStr)) return;
                const daysOverdue = today.getDate() - day;
                const prev = bestByCustomer[customerId];
                if (!prev || daysOverdue > prev.daysOverdue) {
                    bestByCustomer[customerId] = { customerId, scheduledDate: dateStr, daysOverdue };
                }
            });
        }

        return Object.values(bestByCustomer).sort((a, b) => b.daysOverdue - a.daysOverdue);
    }

    function isModernTradeUser() {
        const role = String(getUser()?.role || 'canvasser').toLowerCase().replace(/[\s-]+/g, '_');
        return role === 'md' || role === 'modern_trade' || role === 'moderntrade';
    }

    function buildSeedSyncQueue() {
        const now = Date.now();
        return [
            {
                id: 'SQ-DEMO-1', type: 'Visit',
                payload: { customerId: 'OL-10772', customerName: 'Klinik Bunda Mulia' },
                status: 'pending',
                createdAt: new Date(now - 7200000).toISOString()
            },
            {
                id: 'SQ-DEMO-2', type: 'Invoice',
                payload: { invoiceNo: 'FKT-2026-0188', customerId: 'OL-10819', amount: 2100000 },
                status: 'pending',
                createdAt: new Date(now - 5400000).toISOString()
            },
            {
                id: 'SQ-DEMO-3', type: 'Collection',
                payload: { customerId: 'OL-10511', amount: 750000 },
                status: 'success',
                createdAt: new Date(now - 86400000).toISOString(),
                updatedAt: new Date(now - 86000000).toISOString()
            },
            {
                id: 'SQ-DEMO-ERR', type: 'Invoice',
                payload: { invoiceNo: 'FKT-2026-0099', customerId: 'OL-10511', amount: 1850000 },
                status: 'failed',
                createdAt: new Date(now - 10800000).toISOString(),
                updatedAt: new Date(now - 3600000).toISOString(),
                errorMessage: 'Timeout — server tidak merespons',
                retryCount: 2
            }
        ];
    }

    function ensureDemoSyncQueue() {
        if (read(KEYS.SYNC_QUEUE_CLEARED)) {
            const q = read(KEYS.SYNC_QUEUE);
            return Array.isArray(q) ? q : [];
        }
        let q = read(KEYS.SYNC_QUEUE);
        if (!Array.isArray(q)) q = [];
        if (!q.some(i => i.status === 'failed')) {
            const demoErr = q.find(i => i.id === 'SQ-DEMO-ERR');
            if (demoErr) {
                demoErr.status = 'failed';
                demoErr.updatedAt = new Date().toISOString();
                demoErr.errorMessage = demoErr.errorMessage || 'Koneksi timeout — gagal unggah ke server';
            } else {
                q.push({
                    id: 'SQ-DEMO-ERR',
                    type: 'Invoice',
                    payload: { invoiceNo: 'FKT-2026-0099', customerId: 'OL-10511', amount: 1850000 },
                    status: 'failed',
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    errorMessage: 'Koneksi timeout — gagal unggah ke server',
                    retryCount: 1
                });
            }
            write(KEYS.SYNC_QUEUE, q);
        }
        return read(KEYS.SYNC_QUEUE) || [];
    }

    function shouldDemoFailUpload(item) {
        if (!item) return false;
        if (item.id === 'SQ-DEMO-ERR') return true;
        const inv = item.payload && item.payload.invoiceNo;
        return inv === 'FKT-2026-0099' || inv === 'FKT-DEMO-ERR';
    }

    function uploadQueueItemById(id) {
        return new Promise(resolve => {
            const all = getSyncQueue();
            const idx = all.findIndex(item => item.id === id);
            if (idx < 0) { resolve(null); return; }

            all[idx].status = 'uploading';
            all[idx].updatedAt = new Date().toISOString();
            write(KEYS.SYNC_QUEUE, all);

            setTimeout(() => {
                const fresh = getSyncQueue();
                const fi = fresh.findIndex(item => item.id === id);
                if (fi < 0) { resolve(null); return; }

                if (shouldDemoFailUpload(fresh[fi])) {
                    fresh[fi].status = 'failed';
                    fresh[fi].errorMessage = 'Koneksi timeout — gagal unggah ke server';
                } else {
                    fresh[fi].status = 'success';
                    fresh[fi].errorMessage = null;
                }
                fresh[fi].updatedAt = new Date().toISOString();
                write(KEYS.SYNC_QUEUE, fresh);
                resolve(fresh[fi]);
            }, 600);
        });
    }

    // Generate realistic historical invoice + visit data
    function buildSeedVisits() {
        const visits = [];
        const today = new Date();
        const todayString = today.toISOString().slice(0, 10);
        const customerIds = SEED_CUSTOMERS.map(c => c.id);
        // ~5 visits per working day over 365 days
        for (let d = 365; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(today.getDate() - d);
            const dow = date.getDay();
            if (dow === 0) continue; // skip Sunday
            const dateStr = date.toISOString().slice(0, 10);

            if (dateStr === todayString) {
                TODAY_ROUTE_IDS.slice(0, 2).forEach((cid, i) => {
                    const cust = SEED_CUSTOMERS.find(c => c.id === cid);
                    const orderAmount = Math.round((Math.random() * 1500000 + 500000) / 1000) * 1000;
                    visits.push({
                        id: 'VST-TODAY-' + i,
                        customerId: cid,
                        customerName: cust ? cust.name : cid,
                        date: dateStr,
                        createdAt: dateStr + 'T08:00:00.000Z',
                        status: 'checked_out',
                        hasOrder: true,
                        hasCollection: false,
                        hasNoOrderReason: false,
                        orderAmount: orderAmount,
                        collectionAmount: 0,
                        stockistId: SEED_STOCKISTS[i % SEED_STOCKISTS.length].id,
                        stockCheckDone: true,
                        checkInTime: '08:' + String(30 + i * 15).padStart(2, '0') + ' WIB',
                        checkOutTime: '09:' + String(15 + i * 10).padStart(2, '0') + ' WIB'
                    });
                });
                continue;
            }

            const count = dow === 6 ? 3 : 5;
            for (let i = 0; i < count; i++) {
                const cid = customerIds[(d * 7 + i) % customerIds.length];
                const hasOrder = Math.random() > 0.25;
                const vid = 'VST-SEED-' + d + '-' + i;
                visits.push({
                    id: vid,
                    customerId: cid,
                    customerName: SEED_CUSTOMERS.find(c => c.id === cid).name,
                    date: dateStr,
                    createdAt: dateStr + 'T08:00:00.000Z',
                    status: 'checked_out',
                    hasOrder: hasOrder,
                    hasCollection: false,
                    orderAmount: hasOrder ? Math.round((Math.random() * 2000000 + 300000) / 1000) * 1000 : 0,
                    collectionAmount: 0
                });
            }
        }
        return visits;
    }

    function buildSeedInvoices() {
        const invoices = [];
        const today = new Date();
        const productSeed = [
            { code: 'KN-SF-001', name: 'Morinaga Chil*Kid Gold',        price: 265000 },
            { code: 'KN-SF-002', name: 'Morinaga Chil*School Gold',     price: 235000 },
            { code: 'KN-SF-003', name: 'Morinaga Chil*Kid Platinum',    price: 398000 },
            { code: 'KN-SA-001', name: 'Zee Platinum',                  price: 215000 },
            { code: 'KN-SA-002', name: 'Zee Reguler',                   price: 145000 },
            { code: 'KN-MB-001', name: 'Milna Biskuit Bayi',            price: 28500  },
            { code: 'KN-MB-002', name: 'Milna Bubur Bayi',              price: 24000  },
            { code: 'KN-ND-001', name: 'Entrasol Gold',                 price: 65000  },
            { code: 'KN-MB-004', name: 'PRENAGEN mommy',                price: 135000 }
        ];
        const customerIds = SEED_CUSTOMERS.map(c => c.id);
        let seq = 1;
        for (let d = 365; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(today.getDate() - d);
            const dow = date.getDay();
            if (dow === 0) continue;
            const dateStr = date.toISOString().slice(0, 10);
            const invoiceCount = dow === 6 ? 2 : Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < invoiceCount; i++) {
                const cid = customerIds[(d * 5 + i) % customerIds.length];
                const cust = SEED_CUSTOMERS.find(c => c.id === cid);
                const numItems = Math.floor(Math.random() * 3) + 1;
                const items = [];
                let totalGross = 0;
                for (let j = 0; j < numItems; j++) {
                    const prod = productSeed[(d + i + j) % productSeed.length];
                    const qty = Math.floor(Math.random() * 5) + 1;
                    const subtotal = prod.price * qty;
                    totalGross += subtotal;
                    items.push({ code: prod.code, name: prod.name, qty, qtyPcs: qty, price: prod.price, subtotal });
                }
                const discount = Math.round(totalGross * 0.03);
                const totalNet = totalGross - discount;
                invoices.push({
                    id: 'INV-SEED-' + d + '-' + i,
                    invoiceNo: 'FKT-' + String(seq++).padStart(4, '0'),
                    customerId: cid,
                    customerName: cust.name,
                    date: dateStr,
                    createdAt: dateStr + 'T09:00:00.000Z',
                    status: 'confirmed',
                    items,
                    totalGross,
                    discount,
                    totalNet
                });
            }
        }
        return invoices;
    }

    // =========================================================
    // AUTH
    // =========================================================
    function getUser() { return read(KEYS.USER); }
    function saveUser(u) { write(KEYS.USER, u); }
    function clearUser() { localStorage.removeItem(KEYS.USER); }

    // =========================================================
    // CUSTOMERS
    // =========================================================
    function getCustomers() { return read(KEYS.CUSTOMERS) || []; }
    function getCustomerById(id) { return getCustomers().find(c => c.id === id) || null; }
    function saveCustomer(obj) {
        const list = getCustomers();
        const idx = list.findIndex(c => c.id === obj.id);
        if (idx >= 0) list[idx] = { ...list[idx], ...obj };
        else { obj.id = obj.id || genId('OL'); list.push(obj); }
        write(KEYS.CUSTOMERS, list);
        addToSyncQueue('CUSTOMER_UPSERT', obj);
        return obj.id;
    }

    // =========================================================
    // PRODUCTS
    // =========================================================
    function deriveBrand(name) {
        if (!name) return 'Lainnya';
        const n = name.toLowerCase();
        if (n.startsWith('morinaga')) return 'Morinaga';
        if (n.startsWith('zee')) return 'Zee';
        if (n.startsWith('milna')) return 'Milna';
        if (n.startsWith('prenagen')) return 'Prenagen';
        if (n.startsWith('entrasol')) return 'Entrasol';
        if (n.startsWith('nutrive')) return 'Nutrive Benecol';
        if (n.startsWith('fitbar')) return 'Fitbar';
        return 'Lainnya';
    }

    function getProducts() {
        const list = read(KEYS.PRODUCTS) || [];
        return list.map(p => {
            // Normalisasi UOM & Konversi
            const pcsPerCtn = p.conversionCtn || p.conversion || 36;
            let boxPerCtn = 6;
            let pcsPerBox = 6;
            
            if (pcsPerCtn === 12) {
                boxPerCtn = 2;
                pcsPerBox = 6;
            } else if (pcsPerCtn === 24) {
                boxPerCtn = 4;
                pcsPerBox = 6;
            } else if (pcsPerCtn === 48) {
                boxPerCtn = 8;
                pcsPerBox = 6;
            } else {
                boxPerCtn = 6;
                pcsPerBox = Math.round(pcsPerCtn / 6) || 6;
            }
            
            const finalPcsPerCtn = boxPerCtn * pcsPerBox;
            
            // Hitung harga per UOM
            let priceKarton = p.price;
            let pricePcs = Math.round(priceKarton / finalPcsPerCtn);
            let priceBox = pricePcs * pcsPerBox;
            
            if (p.price < 50000) { // e.g. Milna
                pricePcs = p.price;
                priceBox = pricePcs * pcsPerBox;
                priceKarton = pricePcs * finalPcsPerCtn;
            }

            return {
                ...p,
                brand: p.brand || deriveBrand(p.name),
                boxPerCtn,
                pcsPerBox,
                pcsPerCtn: finalPcsPerCtn,
                priceKarton,
                priceBox,
                pricePcs,
                stockKarton: p.stock || 0,
                stockBox: p.stockBox || 0,
                stockPcs: p.stockPcs || 0
            };
        });
    }
    function getProductById(code) { return getProducts().find(p => p.code === code) || null; }
    function getProductCategories() {
        const cats = [...new Set(getProducts().map(p => p.category))];
        return cats;
    }
    function getProductBrands() {
        const brands = [...new Set(getProducts().map(p => p.brand))];
        return brands.sort((a, b) => a.localeCompare(b, 'id'));
    }

    function updateProductStock(code, stockKarton, stockPcs) {
        const list = read(KEYS.PRODUCTS) || [];
        const idx = list.findIndex(p => p.code === code);
        if (idx >= 0) {
            list[idx].stock = stockKarton;
            if (stockPcs !== undefined) {
                list[idx].stockPcs = stockPcs;
            }
            write(KEYS.PRODUCTS, list);
        }
    }

    // =========================================================
    // VISITS (DailyVisitService)
    // =========================================================
    function getVisits() { return read(KEYS.VISITS) || []; }

    function getTodayVisitByCustomerId(customerId) {
        return getVisits().find(v => v.customerId === customerId && v.date === todayStr()) || null;
    }

    function getActiveVisitByCustomerId(customerId) {
        return getVisits().find(v => v.customerId === customerId && v.status === 'checked_in') || null;
    }

    function getActiveVisit() {
        return getVisits().find(v => v.date === todayStr() && v.status === 'checked_in') || null;
    }

    function saveVisit(obj) {
        const existing = getActiveVisit();
        if (existing && existing.customerId !== obj.customerId) {
            return { error: 'ACTIVE_VISIT_EXISTS', visit: existing };
        }
        const stockist = getActiveStockist();
        const list = getVisits();
        const id = genId('VST');
        const entry = {
            id, date: todayStr(), createdAt: new Date().toISOString(),
            status: 'checked_in', hasOrder: false, hasCollection: false,
            hasNoOrderReason: false, orderAmount: 0, collectionAmount: 0,
            stockistId: obj.stockistId || (stockist ? stockist.id : null),
            stockCheckDone: false,
            ...obj
        };
        list.push(entry);
        write(KEYS.VISITS, list);
        return { id };
    }

    function updateVisit(id, patch) {
        const list = getVisits();
        const idx = list.findIndex(v => v.id === id);
        if (idx >= 0) { list[idx] = { ...list[idx], ...patch }; write(KEYS.VISITS, list); }
    }

    function completeVisit(id, patch) {
        const list = getVisits();
        const idx = list.findIndex(v => v.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...patch, status: 'checked_out', checkOutTime: patch.checkOutTime || formatTime(new Date().toISOString()) };
            write(KEYS.VISITS, list);
            addToSyncQueue('VISIT_COMPLETE', list[idx]);
        }
    }

    // =========================================================
    // INVOICES / SALES ORDERS (SalesOrderService)
    // =========================================================
    function getInvoices() { return read(KEYS.INVOICES) || []; }
    function getInvoicesByCustomerId(customerId) { return getInvoices().filter(i => i.customerId === customerId); }

    function getTodayInvoices() {
        return getInvoices().filter(i => i.date === todayStr());
    }

    function saveInvoice(obj) {
        const list = getInvoices();
        const id = genId('INV');
        const invoice = {
            id, invoiceNo: 'FKT-' + id,
            date: todayStr(), createdAt: new Date().toISOString(),
            status: 'draft', ...obj
        };
        list.push(invoice);
        write(KEYS.INVOICES, list);
        // Update visit hasOrder
        if (obj.visitId) {
            updateVisit(obj.visitId, { hasOrder: true, orderAmount: obj.totalNet || obj.totalGross || 0 });
        }
        return id;
    }

    function completeInvoice(id) {
        const list = getInvoices();
        const idx = list.findIndex(i => i.id === id);
        if (idx >= 0) {
            list[idx].status = 'confirmed';
            write(KEYS.INVOICES, list);
            addToSyncQueue('INVOICE', list[idx]);
        }
    }

    // =========================================================
    // COLLECTIONS / AR PAYMENTS (CollectionService)
    // =========================================================
    function getCollections() { return read(KEYS.COLLECTIONS) || []; }

    function getCollectionsByCustomerId(customerId) {
        return getCollections().filter(c => c.customerId === customerId);
    }

    function getOutstandingByCustomerId(customerId) {
        return getCollectionsByCustomerId(customerId)
            .filter(c => c.balance > 0 && c.status === 'outstanding')
            .reduce((sum, c) => sum + (c.balance || 0), 0);
    }

    function saveCollection(obj) {
        const list = getCollections();
        const id = genId('COL');
        const entry = {
            id, date: todayStr(), createdAt: new Date().toISOString(),
            status: 'paid', ...obj
        };
        // Reduce balances of referenced invoices
        if (obj.invoiceIds && obj.invoiceIds.length > 0) {
            let remaining = obj.paidAmount;
            for (let i = 0; i < list.length && remaining > 0; i++) {
                if (obj.invoiceIds.includes(list[i].id) && list[i].balance > 0) {
                    const deduct = Math.min(list[i].balance, remaining);
                    list[i].balance -= deduct;
                    if (list[i].balance <= 0) list[i].status = 'paid';
                    remaining -= deduct;
                }
            }
        }
        list.push(entry);
        write(KEYS.COLLECTIONS, list);
        addToSyncQueue('COLLECTION', entry);
        return id;
    }

    function completeCollection(id) {
        const list = getCollections();
        const idx = list.findIndex(c => c.id === id);
        if (idx >= 0) { list[idx].status = 'confirmed'; write(KEYS.COLLECTIONS, list); }
    }

    // =========================================================
    // SYNC QUEUE (SyncViewModel)
    // =========================================================
    function getSyncQueue() {
        ensureDemoSyncQueue();
        return read(KEYS.SYNC_QUEUE) || [];
    }

    function addToSyncQueue(type, payload) {
        localStorage.removeItem(KEYS.SYNC_QUEUE_CLEARED);
        const q = getSyncQueue();
        q.push({ id: genId('SQ'), type, payload, status: 'pending', createdAt: new Date().toISOString() });
        write(KEYS.SYNC_QUEUE, q);
    }

    function clearSyncQueue() { return clearAllSyncQueue(); }

    function clearAllSyncQueue() {
        const raw = read(KEYS.SYNC_QUEUE);
        const count = Array.isArray(raw) ? raw.length : 0;
        write(KEYS.SYNC_QUEUE, []);
        write(KEYS.SYNC_QUEUE_CLEARED, true);
        return count;
    }

    // =========================================================
    // DOWNLOAD FROM SERVER (master data ke perangkat)
    // =========================================================
    function buildDefaultDownloadStatus() {
        const now = Date.now();
        return {
            lastDownload: null,
            packages: [
                { id: 'master', label: 'Data Master Produk', status: 'success', updatedAt: new Date(now - 86400000).toISOString() },
                { id: 'customer', label: 'Data Pelanggan', status: 'success', updatedAt: new Date(now - 86400000).toISOString() },
                { id: 'stokis', label: 'Data Stokis & Rute', status: 'pending', updatedAt: null },
                { id: 'price', label: 'Harga & Promo', status: 'failed', errorMessage: 'Gagal mengunduh paket harga dari server', updatedAt: new Date(now - 1800000).toISOString() }
            ]
        };
    }

    function ensureDemoDownloadStatus() {
        let data = read(KEYS.DOWNLOAD_STATUS);
        if (!data || !Array.isArray(data.packages)) {
            write(KEYS.DOWNLOAD_STATUS, buildDefaultDownloadStatus());
            return read(KEYS.DOWNLOAD_STATUS);
        }
        if (!data.packages.some(p => p.status === 'failed')) {
            const price = data.packages.find(p => p.id === 'price');
            if (price) {
                price.status = 'failed';
                price.errorMessage = price.errorMessage || 'Gagal mengunduh paket harga dari server';
                price.updatedAt = new Date().toISOString();
            } else {
                data.packages.push({
                    id: 'price', label: 'Harga & Promo', status: 'failed',
                    errorMessage: 'Gagal mengunduh paket harga dari server',
                    updatedAt: new Date().toISOString()
                });
            }
            write(KEYS.DOWNLOAD_STATUS, data);
        }
        return data;
    }

    function getDownloadStatus() {
        ensureDemoDownloadStatus();
        return read(KEYS.DOWNLOAD_STATUS);
    }

    function setLastDownload(ts) {
        const data = getDownloadStatus();
        data.lastDownload = ts;
        write(KEYS.DOWNLOAD_STATUS, data);
    }

    function runDownloadFromServer(onProgress) {
        return new Promise(resolve => {
            const data = getDownloadStatus();
            const targets = data.packages.filter(p => p.status !== 'success' || p.id === 'price');
            let i = 0;

            function finish() {
                ensureDemoDownloadStatus();
                resolve(getDownloadStatus());
            }

            function step() {
                if (i >= targets.length) {
                    finish();
                    return;
                }
                const pkg = targets[i];
                pkg.status = 'downloading';
                write(KEYS.DOWNLOAD_STATUS, data);
                if (typeof onProgress === 'function') onProgress(pkg, i + 1, targets.length);

                setTimeout(() => {
                    if (pkg.id === 'price') {
                        pkg.status = 'failed';
                        pkg.errorMessage = 'Gagal mengunduh paket harga dari server';
                    } else {
                        pkg.status = 'success';
                        pkg.errorMessage = null;
                    }
                    pkg.updatedAt = new Date().toISOString();
                    write(KEYS.DOWNLOAD_STATUS, data);
                    i++;
                    step();
                }, 450);
            }

            if (targets.length === 0) {
                finish();
            } else {
                step();
            }
        });
    }

    function processQueue(onProgress) {
        return new Promise(resolve => {
            const pendingIds = getSyncQueue()
                .filter(item => item.status === 'pending' || item.status === 'failed')
                .map(item => item.id);
            if (pendingIds.length === 0) { resolve({ success: 0, failed: 0 }); return; }

            let i = 0;
            let successCount = 0;
            let failedCount = 0;

            function step() {
                if (i >= pendingIds.length) {
                    resolve({ success: successCount, failed: failedCount });
                    return;
                }
                const id = pendingIds[i];
                const all = getSyncQueue();
                const idx = all.findIndex(item => item.id === id);
                if (idx < 0) { i++; step(); return; }

                all[idx].status = 'uploading';
                all[idx].updatedAt = new Date().toISOString();
                write(KEYS.SYNC_QUEUE, all);
                if (typeof onProgress === 'function') onProgress(all[idx], i + 1, pendingIds.length);

                setTimeout(() => {
                    const fresh = getSyncQueue();
                    const fi = fresh.findIndex(item => item.id === id);
                    if (fi >= 0) {
                        if (shouldDemoFailUpload(fresh[fi])) {
                            fresh[fi].status = 'failed';
                            fresh[fi].errorMessage = 'Koneksi timeout — gagal unggah ke server';
                            failedCount++;
                        } else {
                            fresh[fi].status = 'success';
                            fresh[fi].errorMessage = null;
                            successCount++;
                        }
                        fresh[fi].updatedAt = new Date().toISOString();
                        write(KEYS.SYNC_QUEUE, fresh);
                    }
                    i++;
                    step();
                }, 350);
            }
            step();
        });
    }

    // =========================================================
    // DASHBOARD & KPI AGGREGATES
    // =========================================================
    function getTodayKpi() {
        return getKpiByDate(todayStr());
    }

    function getKpiByDate(dateStr) {
        const visits   = getVisits().filter(v => v.date === dateStr);
        const invoices = getInvoices().filter(i => i.date === dateStr);
        const doneVisits = visits.filter(v => v.status === 'checked_out');
        const effective  = doneVisits.filter(v => v.hasOrder).length;
        const totalRupiah = invoices.reduce((s, i) => s + (i.totalNet || i.totalGross || 0), 0);
        return {
            kunjungan:        doneVisits.length,
            efektif:          effective,
            kunjunganEfektif: effective,
            fakturCount:      invoices.length,
            totalFaktur:      totalRupiah,
            totalRupiah,
            pelanggan:        getCustomers().length
        };
    }

    function getKpiByMonth(year, month) {
        // month: 1-12
        const prefix = year + '-' + String(month).padStart(2, '0');
        const invoices = getInvoices().filter(i => i.date && i.date.startsWith(prefix));
        const visits   = getVisits().filter(v => v.date && v.date.startsWith(prefix));
        const doneVisits = visits.filter(v => v.status === 'checked_out');
        const effective  = doneVisits.filter(v => v.hasOrder).length;
        const totalRupiah = invoices.reduce((s, i) => s + (i.totalNet || i.totalGross || 0), 0);
        return {
            kunjungan:   doneVisits.length,
            efektif:     effective,
            fakturCount: invoices.length,
            totalRupiah,
            pelanggan:   getCustomers().length
        };
    }

    function getKpiByWeek(year, week) {
        // week: ISO week number
        const invoices = getInvoices().filter(i => {
            if (!i.date) return false;
            const d = new Date(i.date);
            return getISOWeek(d) === week && d.getFullYear() === year;
        });
        const visits = getVisits().filter(v => {
            if (!v.date) return false;
            const d = new Date(v.date);
            return getISOWeek(d) === week && d.getFullYear() === year;
        });
        const doneVisits = visits.filter(v => v.status === 'checked_out');
        const totalRupiah = invoices.reduce((s, i) => s + (i.totalNet || i.totalGross || 0), 0);
        return {
            kunjungan:   doneVisits.length,
            efektif:     doneVisits.filter(v => v.hasOrder).length,
            fakturCount: invoices.length,
            totalRupiah,
            pelanggan:   getCustomers().length
        };
    }

    function getISOWeek(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }

    // Last N days chart data: returns {labels, data} arrays
    function getDailyChartData(days) {
        days = days || 14;
        const labels = [], data = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = d.toISOString().slice(0, 10);
            const kpi = getKpiByDate(ds);
            labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
            data.push(Math.round(kpi.totalRupiah / 1000)); // in thousands
        }
        return { labels, data };
    }

    // Last N months chart data
    function getMonthlyChartData(months) {
        months = months || 3;
        const labels = [], data = [];
        const today = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const kpi = getKpiByMonth(d.getFullYear(), d.getMonth() + 1);
            labels.push(d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }));
            data.push(Math.round(kpi.totalRupiah / 1000));
        }
        return { labels, data };
    }

    // Alias for backward compat
    function getDashboardToday() { return getTodayKpi(); }

    function getTopProductsByPeriod(dateFrom, dateTo, n) {
        n = n || 5;
        const from = dateFrom || todayStr();
        const to   = dateTo   || todayStr();
        const invoices = getInvoices().filter(i => i.date >= from && i.date <= to);
        const map = {};
        invoices.forEach(inv => {
            if (!inv.items) return;
            inv.items.forEach(item => {
                if (!map[item.code]) map[item.code] = { code: item.code, name: item.name, totalAmount: 0, totalQty: 0 };
                map[item.code].totalAmount += item.subtotal || 0;
                map[item.code].totalQty   += item.qtyPcs  || item.qty || 0;
            });
        });
        return Object.values(map).sort((a,b) => b.totalAmount - a.totalAmount).slice(0, n);
    }

    function getTopCustomersByPeriod(dateFrom, dateTo, n) {
        n = n || 5;
        const from = dateFrom || todayStr();
        const to   = dateTo   || todayStr();
        const invoices = getInvoices().filter(i => i.date >= from && i.date <= to);
        const map = {};
        invoices.forEach(inv => {
            const id = inv.customerId;
            if (!map[id]) map[id] = { customerId: id, name: inv.customerName || id, totalAmount: 0, count: 0 };
            map[id].totalAmount += inv.totalNet || inv.totalGross || 0;
            map[id].count++;
        });
        return Object.values(map).sort((a,b) => b.totalAmount - a.totalAmount).slice(0, n);
    }

    function getTopProducts(n) { return getTopProductsByPeriod(todayStr(), todayStr(), n); }
    function getTopCustomers(n) { return getTopCustomersByPeriod(todayStr(), todayStr(), n); }

    // =========================================================
    // CUSTOMERS — EXTRA METHODS
    // =========================================================
    function updateCustomerGps(id, lat, lng) {
        const list = getCustomers();
        const idx = list.findIndex(c => c.id === id);
        if (idx >= 0) {
            list[idx].lat = lat;
            list[idx].lng = lng;
            write(KEYS.CUSTOMERS, list);
            addToSyncQueue('CUSTOMER_GPS', { id, lat, lng });
        }
    }

    // =========================================================
    // SYNC QUEUE — EXTRA METHODS
    // =========================================================
    function retryQueueItem(id) {
        const q = getSyncQueue();
        const idx = q.findIndex(item => item.id === id);
        if (idx < 0) return Promise.resolve(null);

        q[idx].retryCount = (q[idx].retryCount || 0) + 1;
        q[idx].status = 'pending';
        q[idx].updatedAt = new Date().toISOString();
        write(KEYS.SYNC_QUEUE, q);
        return uploadQueueItemById(id);
    }

    function isQueueItemDone(item) {
        const s = String(item && item.status || '').toLowerCase();
        return s === 'success' || s === 'done' || s === 'selesai';
    }

    function clearSuccessfulQueue() {
        const raw = read(KEYS.SYNC_QUEUE);
        if (!Array.isArray(raw)) {
            write(KEYS.SYNC_QUEUE, []);
            return 0;
        }
        const next = raw.filter(item => !isQueueItemDone(item));
        const removed = raw.length - next.length;
        write(KEYS.SYNC_QUEUE, next);
        return removed;
    }

    // =========================================================
    // DEV TOOLS
    // =========================================================
    function resetAndReseed() {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        seedIfNeeded();
        console.log('[SfaStore] Data reset and re-seeded.');
    }

    // =========================================================
    // UTILITIES
    // =========================================================
    function formatRupiah(val) {
        if (!val && val !== 0) return 'Rp 0';
        return 'Rp ' + Math.round(val).toLocaleString('id-ID');
    }

    function formatTime(isoStr) {
        try {
            const d = new Date(isoStr);
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } catch(e) { return '-'; }
    }

    function formatDate(isoStr) {
        try {
            return new Date(isoStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch(e) { return '-'; }
    }

    // =========================================================
    // INIT & EXPOSE
    // =========================================================
    seedIfNeeded();

    window.SfaStore = {
        // Auth
        getUser, saveUser, clearUser,
        // Customers
        getCustomers, getCustomerById, saveCustomer, updateCustomerGps,
        // Products
        getProducts, getProductById, getProductCategories, getProductBrands, updateProductStock,
        // Visits
        getVisits, getTodayVisitByCustomerId, getActiveVisitByCustomerId, getActiveVisit,
        saveVisit, updateVisit, completeVisit,
        getTodayRouteIds, getOverdueRouteCustomers, isModernTradeUser,
        // Stockists & Sales Period
        getStockists, getStockistById, getActiveStockist, setActiveStockist,
        getNearestStockists, formatDistanceMeters, haversineMeters,
        getActiveSalesPeriod,
        // Invoices
        getInvoices, getInvoicesByCustomerId, getTodayInvoices,
        saveInvoice, completeInvoice,
        // Collections / AR
        getCollections, getCollectionsByCustomerId,
        getOutstandingByCustomerId, saveCollection, completeCollection,
        // Sync Queue
        getSyncQueue, addToSyncQueue, clearSyncQueue, clearAllSyncQueue, processQueue, ensureDemoSyncQueue,
        getDownloadStatus, runDownloadFromServer, setLastDownload, ensureDemoDownloadStatus,
        isQueueItemDone, retryQueueItem, clearSuccessfulQueue,
        // KPI & Dashboard
        getTodayKpi, getKpiByDate, getKpiByMonth, getKpiByWeek,
        getDailyChartData, getMonthlyChartData,
        getDashboardToday, getTopProducts, getTopCustomers,
        getTopProductsByPeriod, getTopCustomersByPeriod,
        getISOWeek,
        // Dev Tools
        resetAndReseed,
        // Utilities
        formatRupiah, formatTime, formatDate, todayStr
    };

    console.log('[SfaStore] Ready. Customers:', getCustomers().length, '| Products:', getProducts().length, '| Queue:', getSyncQueue().length);

})(window);
