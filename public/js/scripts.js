const $ = selector => document.querySelector(selector);

async function handleClearCart(userId) {
    if (!confirm("Are you sure you want to empty your cart?")) return;

    try {
        const response = await fetch(`/cart/clear/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            document.getElementById('cart-badge-count').innerText = '0';
            document.getElementById('cart-subtotal').innerText = '0.00';
            document.getElementById('cart-total-items').innerText = '0';
            alert('Cart cleared successfully');
        } else {
            console.error('Error clearing cart');
            alert('Could not clear cart. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

function handleViewCart() {
    // Redirige a la vista del carrito o abre un modal
    window.location.href = '/cart';
}

async function handleAddCart(userId, bookId) {
    if (!userId || !bookId) {
        console.error("Missing userId or bookId");
        return;
    }

    try {
        const response = await fetch(`/cart/add/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookId
            })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('cart-badge-count').innerText = data.itemBadge.toString();
            document.getElementById('cart-total-items').innerText =  data.totalItems.toString();
            document.getElementById('cart-subtotal').innerText = data.subTotal.toString();
        } else {
            console.error('Error adding book to cart');
            alert('Could not add book to cart. Please try again.');
        }

    } catch (error) {
        console.error(error);
    }
}

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

const validateRegistration = event => {
    event.preventDefault();

    const firstName = $('#firstName');
    const lastName = $('#lastName');
    const email = $('#email');
    const password = $('#password');
    const repeatPassword = $('#repPassword');
    const address = $('#address');
    const province = $('#province');
    const city = $('#city');
    const postalCode = $('#postalCode');
    const phone = $('#phone');
    const phoneRegex = /^(\+?1)?[- ]?\(?[2-9]\d{2}\)?[- ]?\d{3}[- ]?\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const postalRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
    let isValid = true;

    if (!firstName.value.trim()) {
        isValid = false;
        firstName.classList.add('error-label');
        firstName.nextElementSibling.textContent = 'First Name is required';
    }
    if (!lastName.value.trim()) {
        isValid = false;
        lastName.classList.add('error-label');
        lastName.nextElementSibling.textContent = 'Last Name is required';
    }
    if (!emailRegex.test(email.value.trim())) {
        isValid = false;
        email.classList.add('error-label');
        email.nextElementSibling.textContent = 'Email is required and must be valid';
    }
    if (!password.value.trim() || password.value !== repeatPassword.value) {
        isValid = false;
        password.classList.add('error-label');
        password.nextElementSibling.textContent = 'Password is required and must be identical in Repeated Password';
    }
    if (!repeatPassword.value.trim()) {
        isValid = false;
        repeatPassword.classList.add('error-label');
        repeatPassword.nextElementSibling.textContent = 'Repeated Password is required';
    }
    if (!address.value.trim()) {
        isValid = false;
        address.classList.add('error-label');
        address.nextElementSibling.textContent = 'Address is required';
    }
    if (province.value == "") {
        isValid = false;
        province.classList.add('error-label');
        province.nextElementSibling.textContent = 'Province is required';
    }
    if (!city.value.trim()) {
        isValid = false;
        city.classList.add('error-label');
        city.nextElementSibling.textContent = 'City is required';
    }
    if (!postalRegex.test(postalCode.value.trim())) {
        isValid = false;
        postalCode.classList.add('error-label');
        postalCode.nextElementSibling.textContent = 'Postal is required and must be valid';
    }
    if (!phoneRegex.test(phone.value.trim())) {
        isValid = false;
        phone.classList.add('error-label');
        phone.nextElementSibling.textContent = 'Phone Number is required';
    }

    if (isValid) {
        console.log('Valid Form');
        event.target.submit();
    }
}

const validateLogin = event => {
    event.preventDefault();

    const email = $('#email');
    const password = $('#password');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    if (!emailRegex.test(email.value.trim())) {
        isValid = false;
        email.classList.add('error-label');
        email.nextElementSibling.textContent = 'Invalid email format';
    }
    if (!password.value.trim()) {
        isValid = false;
        password.classList.add('error-label');
        password.nextElementSibling.textContent = 'Password is required';
    }

    if (isValid) {
        console.log('Valid Form');
        event.target.submit();
    }
}

function onInputChange(form) {
    const inputs = form.querySelectorAll('input');
    const select = form.querySelector('#province');
    inputs.forEach(element => {
        element.addEventListener('input', () => {
            element.classList.remove('error-label');
            element.nextElementSibling.textContent = '*';
        });
    });
    if (select) {
        select.addEventListener('change', () => {
            select.classList.remove('error-label');
            select.nextElementSibling.textContent = '*';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = $('#register-form');
    const loginForm = $('#login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', validateRegistration);
        onInputChange(registerForm);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', validateLogin);
        onInputChange(loginForm);
    }
})