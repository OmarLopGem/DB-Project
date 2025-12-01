/*!
* Start Bootstrap - Shop Homepage v5.0.6 (https://startbootstrap.com/template/shop-homepage)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-homepage/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project
async function downloadSalesReport() {
    try {
        // Muestra un mensaje de carga (opcional)
        console.log('Generating PDF...');

        // Haz la petición al backend
        const response = await fetch('http://localhost:9090/api/reports/sales/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startDate: '2024-11-01',
                endDate: '2024-11-30'
            })
        });

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error('Error generating PDF');
        }

        // Convierte la respuesta a blob
        const blob = await response.blob();

        // Crea un URL temporal para el blob
        const url = window.URL.createObjectURL(blob);

        // Crea un elemento <a> temporal para forzar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales-report.pdf';
        document.body.appendChild(a);
        a.click();

        // Limpia
        a.remove();
        window.URL.revokeObjectURL(url);

        console.log('PDF downloaded successfully!');

    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF');
    }
}