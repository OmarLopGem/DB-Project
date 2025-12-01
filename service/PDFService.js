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
