// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
export const cartUtils = {
    countUniqueItems: (cart) => {
        if (!cart || !cart.items) return 0;
        return cart.items.length;
    },

    countTotalItems: (cart) => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    calculateSubtotal: (cart) => {
        if (!cart || !cart.items) return "0.00";

        const total = cart.items.reduce((acc, item) => {
            const book = item.bookId;
            let finalPrice = book.price;

            if (book.discount && book.discount > 0) {
                const discountAmount = finalPrice * (book.discount / 100);
                finalPrice = finalPrice - discountAmount;
            }

            return acc + (finalPrice * item.quantity);
        }, 0);

        return total.toFixed(2);
    }


};

