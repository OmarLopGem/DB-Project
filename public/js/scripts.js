// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
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
        console.log('Generating PDF...');

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

        if (!response.ok) {
            throw new Error('Error generating PDF');
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales-report.pdf';
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);

        console.log('PDF downloaded successfully!');

    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF');
    }
}

async function handleDeleteBook(bookId) {
    const confirmed = await showConfirm('Are you sure you want to delete this book?');
    if (!confirmed) return;

    try {
        const response = await fetch(`/book/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Success', 'Book deleted successfully.', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } else {
            console.error('Error deleting book');
            showToast('Error', 'Could not delete book. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
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

async function downloadOrderPDF(orderId) {
    if (!orderId) {
        console.error('Order ID is required to download PDF');
        return;
    }

    showToast('Info', 'Generating PDF...', 'warning');

    try {
        const url = `/order/pdf/${orderId}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        showToast('Success', 'PDF downloaded successfully!', 'success');

    } catch (e) {
        console.error('PDF Download Error:', e);
        showToast('Error', 'Could not download PDF. Please try again.', 'error');
    }
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

async function handleManageBook(bookId) {
    window.location.href = `/book/${bookId || -1}`;
}

document.addEventListener('DOMContentLoaded', () => {

    let currentSize = parseInt(localStorage.getItem("fontSize")) || 16;

    document.documentElement.style.fontSize = currentSize + "px";

    function toggleFontSize() {
        if (currentSize === 16) currentSize = 18;
        else if (currentSize === 18) currentSize = 20;
        else currentSize = 16;
        document.documentElement.style.fontSize = currentSize + "px";
        localStorage.setItem("fontSize", currentSize);
    }

    window.toggleFontSize = toggleFontSize;
    
    const registerForm = $('#register-form');
    const loginForm = $('#login-form');
    const checkOutForm = $('#checkoutForm');
    const bookForm = $('#bookForm');


    if (registerForm) {
        registerForm.addEventListener('submit', validateRegistration);
        onInputChange(registerForm);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', validateLogin);
        onInputChange(loginForm);
    }

    if(checkOutForm){

        document.getElementById('cardNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        document.getElementById('expiryDate').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        document.getElementById('postalCode').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });

        document.getElementById('cvv').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        calculateTotals();

        document.getElementById('checkoutForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            let isValid = true;

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

            const useRegisteredAddress = document.getElementById('useRegisteredAddress').checked;

            if (!useRegisteredAddress) {
                if (!validateName(firstName.value)) {
                    firstName.classList.add('is-invalid');
                    isValid = false;
                } else {
                    firstName.classList.remove('is-invalid');
                    firstName.classList.add('is-valid');
                }

                if (!validateName(lastName.value)) {
                    lastName.classList.add('is-invalid');
                    isValid = false;
                } else {
                    lastName.classList.remove('is-invalid');
                    lastName.classList.add('is-valid');
                }

                if (address.value.trim().length < 5) {
                    address.classList.add('is-invalid');
                    isValid = false;
                } else {
                    address.classList.remove('is-invalid');
                    address.classList.add('is-valid');
                }

                if (!validateName(city.value)) {
                    city.classList.add('is-invalid');
                    isValid = false;
                } else {
                    city.classList.remove('is-invalid');
                    city.classList.add('is-valid');
                }

                if (province.value === '') {
                    province.classList.add('is-invalid');
                    isValid = false;
                } else {
                    province.classList.remove('is-invalid');
                    province.classList.add('is-valid');
                }

                if (!validatePostalCode(postalCode.value)) {
                    postalCode.classList.add('is-invalid');
                    isValid = false;
                } else {
                    postalCode.classList.remove('is-invalid');
                    postalCode.classList.add('is-valid');
                }
            } else {
                [firstName, lastName, address, city, province, postalCode].forEach(function (field) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                });
            }

            if (paymentMethod.value === '') {
                paymentMethod.classList.add('is-invalid');
                isValid = false;
            } else {
                paymentMethod.classList.remove('is-invalid');
                paymentMethod.classList.add('is-valid');
            }

            if (!validateName(cardHolderName.value)) {
                cardHolderName.classList.add('is-invalid');
                isValid = false;
            } else {
                cardHolderName.classList.remove('is-invalid');
                cardHolderName.classList.add('is-valid');
            }

            if (!validateCardNumber(cardNumber.value)) {
                cardNumber.classList.add('is-invalid');
                isValid = false;
            } else {
                cardNumber.classList.remove('is-invalid');
                cardNumber.classList.add('is-valid');
            }

            if (!validateExpiryDate(expiryDate.value)) {
                expiryDate.classList.add('is-invalid');
                isValid = false;
            } else {
                expiryDate.classList.remove('is-invalid');
                expiryDate.classList.add('is-valid');
            }

            if (!validateCVV(cvv.value)) {
                cvv.classList.add('is-invalid');
                isValid = false;
            } else {
                cvv.classList.remove('is-invalid');
                cvv.classList.add('is-valid');
            }

            if (isValid) {
                console.log('Form is valid, submitting...');

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
                const firstInvalid = document.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }
        });

    }

    if(bookForm){
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('title').value.trim();
            const author = document.getElementById('author').value.trim();
            const editor = document.getElementById('editor').value.trim();
            const year = parseInt(document.getElementById('year').value);
            const isbn = document.getElementById('isbn').value.trim();
            const price = parseFloat(document.getElementById('price').value);
            const stock = parseInt(document.getElementById('stock').value);
            const discount = document.getElementById('discount').value.trim();
            const cover = document.getElementById('cover').value.trim();
            const synopsis = document.getElementById('synopsis').value.trim();
            const bookId = document.getElementById('bookId').value;

            if (!title || !author || !editor || !isbn || !cover || !synopsis) {
                showToast('Warning', 'Please fill all required fields', 'warning');
                return;
            }

            if (price < 0) {
                showToast('Warning', 'Price cannot be negative', 'warning');
                return;
            }

            if (stock < 0) {
                showToast('Warning', 'Stock cannot be negative', 'warning');
                return;
            }

            if (discount && (parseFloat(discount) < 0 || parseFloat(discount) > 100)) {
                showToast('Warning', 'Discount must be between 0 and 100', 'warning');
                return;
            }

            if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
                showToast('Warning', 'Please enter a valid year', 'warning');
                return;
            }

            if (isNaN(price) || isNaN(stock)) {
                showToast('Warning', 'Price and stock must be valid numbers', 'warning');
                return;
            }

            try {
                new URL(cover);
            } catch (err) {
                showToast('Warning', 'Please enter a valid cover image URL', 'warning');
                return;
            }

            const bookData = {
                title: title,
                author: author,
                editor: editor,
                year: year,
                isbn: isbn,
                price: parseFloat(price.toFixed(2)),
                stock: stock,
                cover: cover,
                synopsis: synopsis
            };

            if (discount) {
                bookData.discount = parseFloat(discount);
            }

            console.log('Book data to send:', bookData);

            const url = '/book' + (bookId ? `/${bookId}` : '');
            const method = bookId ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    showToast('Success', data.message || 'Book saved successfully!', 'success');

                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error', 'Failed to save book. Please try again.', 'danger');
                });
        });
    }

})