// Test user fixtures
export const testUsers = [
    {
        id: 1,
        username: 'testuser1',
        password: 'password123'
    },
    {
        id: 2,
        username: 'testuser2',
        password: 'password456'
    }
];

// Test appliance fixtures
export const testAppliances = [
    {
        id: 1,
        name: 'Refrigerator',
        brand: 'Samsung',
        model: 'RF28R7351SR',
        purchase_date: '2023-01-15',
        warranty_end: '2025-01-15'
    },
    {
        id: 2,
        name: 'Washing Machine',
        brand: 'LG',
        model: 'WM3900HWA',
        purchase_date: '2023-03-20',
        warranty_end: '2024-03-20'
    },
    {
        id: 3,
        name: 'Microwave',
        brand: 'Panasonic',
        model: 'NN-SN966S',
        purchase_date: '2023-06-10',
        warranty_end: '2024-06-10'
    }
];

// Test invoice fixtures
export const testInvoices = [
    {
        id: 1,
        appliance: 'Refrigerator',
        appliance_id: 1,
        invoice_number: 'INV-001',
        date: '2023-01-15',
        amount: 1299.99,
        store: 'Best Buy'
    },
    {
        id: 2,
        appliance: 'Washing Machine',
        appliance_id: 2,
        invoice_number: 'INV-002',
        date: '2023-03-20',
        amount: 899.99,
        store: 'Home Depot'
    }
];

// Test warranty fixtures
export const testWarranties = [
    {
        id: 1,
        appliance: 'Refrigerator',
        appliance_id: 1,
        start_date: '2023-01-15',
        end_date: '2025-01-15'
    },
    {
        id: 2,
        appliance: 'Washing Machine',
        appliance_id: 2,
        start_date: '2023-03-20',
        end_date: '2024-03-20'
    }
];

// Test maintenance fixtures
export const testMaintenance = [
    {
        id: 1,
        appliance: 'Refrigerator',
        appliance_id: 1,
        date: '2023-07-15',
        issue: 'Compressor noise',
        notes: 'Technician replaced the compressor fan'
    },
    {
        id: 2,
        appliance: 'Washing Machine',
        appliance_id: 2,
        date: '2023-08-10',
        issue: 'Door seal leak',
        notes: 'Replaced door gasket'
    }
];
