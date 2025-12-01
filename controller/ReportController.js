import  pdfService from '../service/pdfService.js';


class ReportController {

    async sendPDF(res, data, fileName = 'report.pdf', options = {}) {
        try {
            const pdfBuffer = await pdfService.generatePDF(data, options);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.send(pdfBuffer);

        } catch (error) {
            res.status(500).json({ error: 'Error generating PDF: ' + error.message });
        }
    }
}

export default new ReportController();