import PDFDocument from 'pdfkit';

class PDFService {

    // Generic method to generate PDF
    generatePDF(data, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                // Capture PDF chunks
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                const title = options.title || 'Report';
                doc.fontSize(18).text(title, { align: 'center' });
                doc.moveDown();

                doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
                doc.moveDown();

                if (options.type === 'table') {
                    this._generateTable(doc, data, options);
                } else {
                    this._generateList(doc, data);
                }

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    generateInvoice(orderData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                this._generateInvoiceHeader(doc, orderData);

                this._generateCustomerInfo(doc, orderData);

                this._generateInvoiceTable(doc, orderData.items);

                this._generateInvoiceTotal(doc, orderData);

                this._generateInvoiceFooter(doc);

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    _generateInvoiceHeader(doc, order) {
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('INVOICE', 50, 50, { align: 'right' });

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Invoice Number: ${order.invoiceNumber}`, 50, 50)
            .text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`)
            .text(`Status: ${order.status.toUpperCase()}`)
            .moveDown();

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();

        doc.moveDown();
    }

    _generateCustomerInfo(doc, order) {
        const startY = doc.y;

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Bill To:', 50, startY);

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(order.userSnapshot.email, 50, doc.y)
            .text(order.userSnapshot.address, 50, doc.y, { width: 250 });

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Payment Details:', 320, startY);

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Method: ${order.paymentInfo.paymentMethod.toUpperCase()}`, 320, doc.y + 15)
            .text(`Card Holder: ${order.paymentInfo.cardHolderName}`, 320, doc.y)
            .text(`Card: ${order.paymentInfo.cardNumber}`, 320, doc.y)
            .text(`Expiry: ${order.paymentInfo.expiryDate}`, 320, doc.y);

        doc.moveDown(2);
    }

    _generateInvoiceTable(doc, items) {
        const tableTop = doc.y;
        const itemHeight = 30;

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#444444');

        this._generateTableRow(
            doc,
            tableTop,
            'Item',
            'Author',
            'Qty',
            'Unit Price',
            'Subtotal'
        );

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, tableTop + 20)
            .lineTo(550, tableTop + 20)
            .stroke();

        doc.font('Helvetica').fontSize(9);
        let y = tableTop + 30;

        items.forEach((item, index) => {
            this._generateTableRow(
                doc,
                y,
                item.title,
                item.author,
                item.quantity.toString(),
                `$${item.unitPrice.toFixed(2)}`,
                `$${item.subtotal.toFixed(2)}`
            );

            y += itemHeight;

            if (index < items.length - 1) {
                doc
                    .strokeColor('#eeeeee')
                    .lineWidth(0.5)
                    .moveTo(50, y - 5)
                    .lineTo(550, y - 5)
                    .stroke();
            }
        });

        doc.y = y + 10;
    }

    _generateTableRow(doc, y, item, author, qty, unitPrice, subtotal) {
        doc
            .fillColor('#444444')
            .text(item, 50, y, { width: 200, align: 'left' })
            .text(author, 250, y, { width: 120, align: 'left' })
            .text(qty, 370, y, { width: 40, align: 'center' })
            .text(unitPrice, 410, y, { width: 70, align: 'right' })
            .text(subtotal, 480, y, { width: 70, align: 'right' });
    }

    _generateInvoiceTotal(doc, order) {
        const totalY = doc.y + 10;

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(400, totalY)
            .lineTo(550, totalY)
            .stroke();

        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#000000')
            .text('TOTAL:', 400, totalY + 10, { width: 80, align: 'right' })
            .text(`$${order.totalAmount.toFixed(2)}`, 480, totalY + 10, { width: 70, align: 'right' });

        doc.moveDown(3);
    }

    _generateInvoiceFooter(doc) {
        doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#888888')
            .text(
                'Thank you for your purchase!',
                50,
                doc.page.height - 100,
                { align: 'center' }
            )
            .text(
                `Generated on ${new Date().toLocaleDateString()}`,
                50,
                doc.page.height - 85,
                { align: 'center' }
            );
    }

    _generateList(doc, data) {
        data.forEach((item, index) => {
            doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(item)}`);
            doc.moveDown(0.5);
        });
    }

    _generateTable(doc, data, options) {
        const columns = options.columns || Object.keys(data[0] || {});

        let x = 50;
        doc.fontSize(10).font('Helvetica-Bold');
        columns.forEach(col => {
            doc.text(col.toUpperCase(), x, doc.y, { width: 100, continued: false });
            x += 120;
        });

        doc.moveDown();
        doc.font('Helvetica');

        data.forEach(item => {
            x = 50;
            columns.forEach(col => {
                doc.text(item[col] || '', x, doc.y, { width: 100, continued: false });
                x += 120;
            });
            doc.moveDown(0.5);
        });
    }
}

export default new PDFService();