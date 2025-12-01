
import reportController from './reportController.js';

const generateSalesReport = async (req, res) => {
    try {


        const sales = [
            {
                product: 'Laptop HP',
                quantity: 5,
                price: 899.99,
                total: 4499.95,
                date: '2024-11-15'
            },
            {
                product: 'Mouse Logitech',
                quantity: 20,
                price: 25.50,
                total: 510.00,
                date: '2024-11-16'
            },
            {
                product: 'Keyboard Mechanical',
                quantity: 10,
                price: 129.99,
                total: 1299.90,
                date: '2024-11-17'
            },
            {
                product: 'Monitor 27"',
                quantity: 8,
                price: 349.99,
                total: 2799.92,
                date: '2024-11-18'
            },
            {
                product: 'Webcam HD',
                quantity: 15,
                price: 79.99,
                total: 1199.85,
                date: '2024-11-19'
            }
        ];

        const reportData = sales.map(sale => ({
            product: sale.product,
            quantity: sale.quantity.toString(),
            price: `$${sale.price.toFixed(2)}`,
            total: `$${sale.total.toFixed(2)}`,
            date: sale.date
        }));

        await reportController.sendPDF(
            res,
            reportData,
            'sales-report.pdf',
            {
                title: 'Sales Report',
                type: 'table',
                columns: ['product', 'quantity', 'price', 'total', 'date']
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateInventoryReport = async (req, res) => {
    try {
        const products = [
            {name: 'USB Cable', stock: 5, price: 9.99},
            {name: 'HDMI Cable', stock: 3, price: 15.99},
            {name: 'Power Adapter', stock: 7, price: 24.99},
            {name: 'Phone Case', stock: 2, price: 12.99},
            {name: 'Screen Protector', stock: 8, price: 7.99}
        ];

        const reportData = products.map(p => ({
            name: p.name,
            stock: p.stock.toString(),
            price: `$${p.price.toFixed(2)}`
        }));

        await reportController.sendPDF(
            res,
            reportData,
            'low-stock-inventory.pdf',
            {
                title: 'Low Stock Products Report',
                type: 'table',
                columns: ['name', 'stock', 'price']
            }
        );

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};



export default {
    generateSalesReport,
    generateInventoryReport
};