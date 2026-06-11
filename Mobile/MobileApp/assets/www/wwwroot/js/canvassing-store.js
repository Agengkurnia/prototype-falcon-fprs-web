/* ======================================================
   FALCON PROTOTYPE - CANVASSING LOCAL DATA STORE (JSON)
   Handles: Create, Read, Update, Delete for Canvassing V2
   Persisted using browser's localStorage
   ====================================================== */

const CanvassingStore = {
    STORAGE_KEY: 'falcon_canvassing_v2_data',

    // Get all records from storage
    getAll: function () {
        let data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            return this.initializeDummyData();
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing canvassing data, reinitializing...", e);
            return this.initializeDummyData();
        }
    },

    // Get a specific record by ID
    getById: function (id) {
        const list = this.getAll();
        return list.find(item => item.id === id) || null;
    },

    // Save a new record or update an existing one
    save: function (obj) {
        const list = this.getAll();
        
        // Calculate duration and progress
        if (obj.tanggalMulai && obj.tanggalSelesai) {
            const start = new Date(obj.tanggalMulai);
            const end = new Date(obj.tanggalSelesai);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1;
            obj.durationDays = diffDays;
        } else {
            obj.durationDays = 0;
        }

        if (obj.status === 'Completed') {
            obj.progressPct = 100;
        } else if (obj.status === 'Cancelled') {
            obj.progressPct = 0;
        } else if (obj.tanggalMulai && obj.tanggalSelesai) {
            const start = new Date(obj.tanggalMulai);
            const end = new Date(obj.tanggalSelesai);
            const diffTime = Math.abs(end - start);
            const now = new Date();
            if (now < start) {
                obj.progressPct = 0;
            } else if (now > end) {
                obj.progressPct = 100;
            } else {
                const elapsed = Math.abs(now - start);
                obj.progressPct = Math.min(100, Math.round((elapsed / diffTime) * 100));
            }
        } else {
            obj.progressPct = 0;
        }

        const index = list.findIndex(item => item.id === obj.id);
        if (index !== -1) {
            // Update
            // Merge item quantities with existing metrics (so we don't lose sales/return data)
            if (obj.items) {
                const existingItems = list[index].items || [];
                obj.items = obj.items.map(newItem => {
                    const existing = existingItems.find(ei => ei.produkCode === newItem.produkCode);
                    if (existing) {
                        return {
                            ...existing,
                            karton: newItem.karton,
                            box: newItem.box,
                            pcs: newItem.pcs
                        };
                    }
                    return newItem;
                });
            } else {
                obj.items = list[index].items;
            }
            list[index] = { ...list[index], ...obj };
        } else {
            // Create
            if (!obj.id) {
                obj.id = this.generateId();
            }
            if (!obj.status) {
                obj.status = 'Ongoing';
            }
            if (!obj.items) {
                obj.items = [];
            }
            list.unshift(obj); // Insert at the beginning (newest first)
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        return obj;
    },

    // Delete a record by ID
    delete: function (id) {
        let list = this.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        return true;
    },

    // Update status of a specific record
    updateStatus: function (id, status) {
        const item = this.getById(id);
        if (item) {
            item.status = status;
            if (status === 'Completed') {
                item.progressPct = 100;
            } else if (status === 'Cancelled') {
                item.progressPct = 0;
            }
            this.save(item);
            return true;
        }
        return false;
    },

    // Get numerical summary of all data
    getSummary: function () {
        const list = this.getAll();
        const summary = {
            total: list.length,
            ongoing: 0,
            completed: 0,
            cancelled: 0,
            draft: 0
        };

        list.forEach(item => {
            const status = (item.status || '').toLowerCase();
            if (status === 'ongoing') summary.ongoing++;
            else if (status === 'completed') summary.completed++;
            else if (status === 'cancelled') summary.cancelled++;
            else if (status === 'draft') summary.draft++;
        });

        return summary;
    },

    // Generate a unique ID (Format: CVS-26XXXXXX)
    generateId: function () {
        const list = this.getAll();
        let isUnique = false;
        let newId = '';
        while (!isUnique) {
            const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
            newId = 'CVS-26' + randomNum;
            isUnique = !list.some(item => item.id === newId);
        }
        return newId;
    },

    // Initialize 20 dummy records for prototyping
    initializeDummyData: function () {
        console.log("Initializing dummy data in localStorage...");
        const dummy = [];
        const gudangs = ['JAMBI', 'JAKARTA PUSAT', 'SURABAYA', 'BANDUNG', 'MEDAN'];
        const drivers = [
            { code: 'EMP-260500040', name: 'JAMBI' },
            { code: 'EMP-260400021', name: 'JAKARTA PUSAT' },
            { code: 'EMP-260300012', name: 'SURABAYA' },
            { code: 'EMP-260200055', name: 'BANDUNG' },
            { code: 'EMP-260100088', name: 'MEDAN' }
        ];
        
        // Let's create realistic date offsets
        for (let i = 1; i <= 20; i++) {
            const driverObj = drivers[(i - 1) % drivers.length];
            const helperObj = { code: 'EMP-260500041', name: 'BUDI' };
            const gudang = gudangs[(i - 1) % gudangs.length];
            
            // Status distribution: 1-12 Ongoing, 13-18 Completed, 19 Cancelled, 20 Draft
            let status = 'Ongoing';
            if (i > 12 && i <= 18) status = 'Completed';
            else if (i === 19) status = 'Cancelled';
            else if (i === 20) status = 'Draft';
            
            const pct = Math.floor(Math.random() * 60) + 20; // 20% to 80%
            const days = Math.floor(Math.random() * 100) + 50; // 50 to 150 days
            
            const startDate = new Date();
            // Start date is offset into the past
            startDate.setDate(startDate.getDate() - Math.floor((pct / 100) * days));
            startDate.setHours(8, 0, 0, 0);

            const endDate = new Date(startDate.getTime());
            endDate.setDate(startDate.getDate() + days);
            endDate.setHours(17, 0, 0, 0);
            
            const id = 'CVS-26' + String(100000 + i);
            
            dummy.push({
                id: id,
                driverCode: driverObj.code,
                driverName: driverObj.name,
                helperCode: helperObj.code,
                helperName: helperObj.name,
                gudang: gudang,
                tanggalMulai: startDate.toISOString().slice(0, 16),
                tanggalSelesai: endDate.toISOString().slice(0, 16),
                status: status,
                progressPct: status === 'Completed' ? 100 : (status === 'Cancelled' ? 0 : pct),
                durationDays: days,
                items: [
                    { 
                        produkCode: 'NBE14', 
                        produkName: 'BENECOL STRAW 100ML', 
                        karton: 100, 
                        box: 0, 
                        pcs: 0, 
                        soldKarton: status === 'Completed' ? 12 : 0, 
                        soldBox: status === 'Completed' ? 4 : 0, 
                        soldPcs: 0, 
                        retKarton: 0, 
                        retBox: 0, 
                        retPcs: 0, 
                        lostKarton: 0, 
                        lostBox: 0, 
                        lostPcs: 0 
                    },
                    { 
                        produkCode: 'FIT01', 
                        produkName: 'FITBAR CHOCOLATE', 
                        karton: 50, 
                        box: 12, 
                        pcs: 0, 
                        soldKarton: status === 'Completed' ? 45 : 15, 
                        soldBox: status === 'Completed' ? 3 : 2, 
                        soldPcs: 0, 
                        retKarton: status === 'Completed' ? 2 : 0, 
                        retBox: 0, 
                        retPcs: 0, 
                        lostKarton: 0, 
                        lostBox: 0, 
                        lostPcs: 0 
                    }
                ]
            });
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dummy));
        return dummy;
    }
};
