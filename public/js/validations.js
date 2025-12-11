function validateName(name) {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
}

function validatePostalCode(postalCode) {
    const postalCodeRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
    return postalCodeRegex.test(postalCode);
}

function validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    // Check if it's 16 digits
    return /^\d{16}$/.test(cleanNumber);
}

function validateExpiryDate(expiryDate) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;

    if (!expiryRegex.test(expiryDate)) {
        return false;
    }

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryYear < currentYear) {
        return false;
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
        return false;
    }

    return true;
}

function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function calculateTotals() {
    let subtotal = 0;

    // Get all cart items
    const cartItems = document.querySelectorAll('[id^="quantity-"]');

    cartItems.forEach(function(quantityElement) {
        const bookId = quantityElement.id.replace('quantity-', '');
        const quantity = parseInt(quantityElement.textContent);
        const itemSubtotalElement = document.getElementById('itemSubtotal-' + bookId);

        if (itemSubtotalElement) {
            const itemSubtotal = parseFloat(itemSubtotalElement.textContent.replace('$', ''));
            subtotal += itemSubtotal;
        }
    });

    const taxes = subtotal * 0.13;
    const total = subtotal + taxes;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('taxes').textContent = '$' + taxes.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function updateQuantity(bookId, change, stock) {
    const quantityElement = document.getElementById('quantity-' + bookId);
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + change;

    // Validate quantity
    if (newQuantity < 1 || newQuantity > stock) {
        return;
    }

    // Update quantity display
    quantityElement.textContent = newQuantity;

    // Get the item price from the current subtotal
    const itemSubtotalElement = document.getElementById('itemSubtotal-' + bookId);
    const itemPrice = parseFloat(itemSubtotalElement.textContent.replace('$', '')) / currentQuantity;

    // Calculate new subtotal for this item
    const newSubtotal = itemPrice * newQuantity;
    itemSubtotalElement.textContent = '$' + newSubtotal.toFixed(2);

    // Recalculate totals
    calculateTotals();

    // TODO: Make AJAX call to update cart in backend
    // updateCartInBackend(bookId, newQuantity);
}

function toggleAddressFields() {
    const checkbox = document.getElementById('useRegisteredAddress');
    const fields = ['firstName', 'lastName', 'address', 'city', 'province', 'postalCode'];

    fields.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        field.disabled = checkbox.checked;

        if (!checkbox.checked) {
            // Clear fields when unchecking
            field.value = '';
        } else {
            // Restore user data when checking (if available)
            const defaultValue = field.defaultValue;
            if (defaultValue) {
                field.value = defaultValue;
            }
        }
    });
}