// Jorge Omar Lopez Gemigniani 9049992
// Daniel Garrido Quinde 9042293
import bookModel from "../model/book_model.js";

export default class BookController {
    static async manageBookView(req, res) {
        try {
            const bookId = req.params.bookId;
            if (!bookId) {
                return res.status(400).send("Book ID is required");
            }
            if (bookId === "-1"){
                return res.render('manage_book', { book: null });
            }
            const book = await bookModel.findById(bookId);
            if (!book) {
                return res.status(404).send("Book not found");
            }
            res.render('manage_book', { book });
        } catch (e) {
            console.log("Error in manageBookView:", e);
            res.status(500).send("Internal Server Error");
        }
    }

    static async createBook(req, res) {
        try {
            const { title, author, editor, year, isbn, price, stock, cover, synopsis, discount } = req.body;

            // Validate required fields
            if (!title || !author || !editor || !year || !isbn || !price || stock === undefined || !cover || !synopsis) {
                return res.status(400).json({
                    success: false,
                    message: "All required fields must be provided"
                });
            }

            // Check if book with same ISBN already exists
            const existingBook = await bookModel.findOne({ isbn });
            if (existingBook) {
                return res.status(400).json({
                    success: false,
                    message: "A book with this ISBN already exists"
                });
            }

            // Validate data types and ranges
            if (price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price cannot be negative"
                });
            }

            if (stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock cannot be negative"
                });
            }

            if (discount && (discount < 0 || discount > 100)) {
                return res.status(400).json({
                    success: false,
                    message: "Discount must be between 0 and 100"
                });
            }

            // Create book data object
            const bookData = {
                title,
                author,
                editor,
                year: parseInt(year),
                isbn,
                price: parseFloat(price),
                stock: parseInt(stock),
                cover,
                synopsis
            };

            // Add discount only if provided
            if (discount) {
                bookData.discount = parseFloat(discount);
            }

            // Create new book
            const newBook = new bookModel(bookData);
            await newBook.save();

            return res.status(201).json({
                success: true,
                message: "Book created successfully",
                book: newBook
            });

        } catch (e) {
            console.log("Error in createBook:", e);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error: " + e.message
            });
        }
    }

    static async updateBook(req, res) {
        try {
            const bookId = req.params.bookId;
            const { editor, price, stock, cover, synopsis, discount } = req.body;

            // Validate book ID
            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: "Book ID is required"
                });
            }

            // Find existing book
            const existingBook = await bookModel.findById(bookId);
            if (!existingBook) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }

            // Validate editable fields
            if (!editor || price === undefined || stock === undefined || !cover || !synopsis) {
                return res.status(400).json({
                    success: false,
                    message: "All editable fields must be provided"
                });
            }

            // Validate data types and ranges
            if (price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price cannot be negative"
                });
            }

            if (stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock cannot be negative"
                });
            }

            if (discount !== null && discount !== undefined && discount !== "" && (discount < 0 || discount > 100)) {
                return res.status(400).json({
                    success: false,
                    message: "Discount must be between 0 and 100"
                });
            }

            // Update only editable fields (title, author, year, isbn remain unchanged)
            existingBook.editor = editor;
            existingBook.price = parseFloat(price);
            existingBook.stock = parseInt(stock);
            existingBook.cover = cover;
            existingBook.synopsis = synopsis;

            // Update discount - if empty/null, remove it
            if (discount !== null && discount !== undefined && discount !== "") {
                existingBook.discount = parseFloat(discount);
            } else {
                existingBook.discount = undefined;
            }

            // Save updated book
            await existingBook.save();

            return res.status(200).json({
                success: true,
                message: "Book updated successfully",
                book: existingBook
            });

        } catch (e) {
            console.log("Error in updateBook:", e);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error: " + e.message
            });
        }
    }

    static async deleteBook(req, res) {
        try {
            const bookId = req.params.bookId;

            if (!bookId) {
                return res.status(400).json({
                    success: false,
                    message: "Book ID is required"
                });
            }

            const deletedBook = await bookModel.findByIdAndDelete(bookId);

            if (!deletedBook) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Book deleted successfully"
            });

        } catch (e) {
            console.log("Error in deleteBook:", e);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error: " + e.message
            });
        }
    }
}