const $ = selector => document.querySelector(selector);

async function handleClearCart(userId) {
    const confirmed = await showConfirm('Are you sure you want to empty your cart?');
    if (!confirmed) return;

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
            showToast('Success', 'Your cart has been emptied.', 'success');
        } else {
            console.error('Error clearing cart');
            showToast('Error', 'Could not clear cart. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

function handleViewCart(userId) {
    window.location.href = `/cart/${userId}`;
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
            showToast('Success', 'Book added to cart successfully!', 'success');
            document.getElementById('cart-badge-count').innerText = data.itemBadge.toString();
            document.getElementById('cart-total-items').innerText =  data.totalItems.toString();
            document.getElementById('cart-subtotal').innerText = data.subTotal.toString();
        } else {
            console.error('Error adding book to cart');
            showToast('Error','Could not add book to cart. Please try again.', 'error');
        }

    } catch (error) {
        console.error(error);
    }
}

// AUX METHODS
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        document.getElementById('confirmMessage').textContent = message;

        document.getElementById('confirmBtn').onclick = () => {
            modal.hide();
            resolve(true);
        };

        const cancelBtn = document.querySelector('#confirmModal [data-bs-dismiss="modal"]');
        const closeBtn = document.querySelector('#confirmModal .btn-close');

        cancelBtn.onclick = () => {
            modal.hide();
            resolve(false);
        };

        closeBtn.onclick = () => {
            modal.hide();
            resolve(false);
        };

        document.getElementById('confirmModal').addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        modal.show();
    });
}
function showToast(title, message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastEl);

    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;

    // Cambiar color según tipo
    toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'text-white');
    if (type === 'success') {
        toastEl.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toastEl.classList.add('bg-warning');
    }

    toast.show();
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

function downloadOrderPDF(orderId) {
    // Placeholder for PDF download functionality
    alert('PDF download feature coming soon!\nOrder ID: ' + orderId);

    // When you implement it, you can do something like:
    // window.location.href = '/orders/' + orderId + '/download-pdf';
}

async function sendCheckoutData(orderData) {
    try {
        const response = await fetch(`/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }catch (e) {
        throw e;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = $('#register-form');
    const loginForm = $('#login-form');
    const checkOutForm = $('#checkoutForm');

    if (registerForm) {
        registerForm.addEventListener('submit', validateRegistration);
        onInputChange(registerForm);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', validateLogin);
        onInputChange(loginForm);
    }

    if(checkOutForm){

        // Format card number with spaces
        document.getElementById('cardNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        // Format expiry date with slash
        document.getElementById('expiryDate').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        // Format postal code to uppercase
        document.getElementById('postalCode').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });

        // Only allow digits in CVV
        document.getElementById('cvv').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Calculate totals on page load
        calculateTotals();

        // Form submission handler
        document.getElementById('checkoutForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            let isValid = true;

            // Get form fields
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const address = document.getElementById('address');
            const city = document.getElementById('city');
            const province = document.getElementById('province');
            const postalCode = document.getElementById('postalCode');
            const paymentMethod = document.getElementById('paymentMethod');
            const cardHolderName = document.getElementById('cardHolderName');
            const cardNumber = document.getElementById('cardNumber');
            const expiryDate = document.getElementById('expiryDate');
            const cvv = document.getElementById('cvv');
            const userId = document.getElementById('userId').value;

            // Validate shipping fields (if not using registered address)
            const useRegisteredAddress = document.getElementById('useRegisteredAddress').checked;

            if (!useRegisteredAddress) {
                // Validate first name
                if (!validateName(firstName.value)) {
                    firstName.classList.add('is-invalid');
                    isValid = false;
                } else {
                    firstName.classList.remove('is-invalid');
                    firstName.classList.add('is-valid');
                }

                // Validate last name
                if (!validateName(lastName.value)) {
                    lastName.classList.add('is-invalid');
                    isValid = false;
                } else {
                    lastName.classList.remove('is-invalid');
                    lastName.classList.add('is-valid');
                }

                // Validate address
                if (address.value.trim().length < 5) {
                    address.classList.add('is-invalid');
                    isValid = false;
                } else {
                    address.classList.remove('is-invalid');
                    address.classList.add('is-valid');
                }

                // Validate city
                if (!validateName(city.value)) {
                    city.classList.add('is-invalid');
                    isValid = false;
                } else {
                    city.classList.remove('is-invalid');
                    city.classList.add('is-valid');
                }

                // Validate province
                if (province.value === '') {
                    province.classList.add('is-invalid');
                    isValid = false;
                } else {
                    province.classList.remove('is-invalid');
                    province.classList.add('is-valid');
                }

                // Validate postal code
                if (!validatePostalCode(postalCode.value)) {
                    postalCode.classList.add('is-invalid');
                    isValid = false;
                } else {
                    postalCode.classList.remove('is-invalid');
                    postalCode.classList.add('is-valid');
                }
            } else {
                // If using registered address, ensure fields are marked as valid
                [firstName, lastName, address, city, province, postalCode].forEach(function (field) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                });
            }

            // Validate payment method
            if (paymentMethod.value === '') {
                paymentMethod.classList.add('is-invalid');
                isValid = false;
            } else {
                paymentMethod.classList.remove('is-invalid');
                paymentMethod.classList.add('is-valid');
            }

            // Validate card holder name
            if (!validateName(cardHolderName.value)) {
                cardHolderName.classList.add('is-invalid');
                isValid = false;
            } else {
                cardHolderName.classList.remove('is-invalid');
                cardHolderName.classList.add('is-valid');
            }

            // Validate card number
            if (!validateCardNumber(cardNumber.value)) {
                cardNumber.classList.add('is-invalid');
                isValid = false;
            } else {
                cardNumber.classList.remove('is-invalid');
                cardNumber.classList.add('is-valid');
            }

            // Validate expiry date
            if (!validateExpiryDate(expiryDate.value)) {
                expiryDate.classList.add('is-invalid');
                isValid = false;
            } else {
                expiryDate.classList.remove('is-invalid');
                expiryDate.classList.add('is-valid');
            }

            // Validate CVV
            if (!validateCVV(cvv.value)) {
                cvv.classList.add('is-invalid');
                isValid = false;
            } else {
                cvv.classList.remove('is-invalid');
                cvv.classList.add('is-valid');
            }

            if (isValid) {
                // Form is valid, proceed with submission
                console.log('Form is valid, submitting...');

                // Prepare order data
                const orderData = {
                    userId: userId,
                    paymentInfo: {
                        paymentMethod: paymentMethod.value,
                        cardHolderName: cardHolderName.value,
                        cardNumber: cardNumber.value.replace(/\s/g, ''),
                        expiryDate: expiryDate.value,
                        cvv: cvv.value
                    }
                };

                await sendCheckoutData(orderData);

                showToast('Success', 'Your order has been placed successfully!', 'success');

                setTimeout(() => {
                    window.location.href = `/home`;
                }, 1200);
            } else {
                // Scroll to first invalid field
                const firstInvalid = document.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }
        });

    }
})