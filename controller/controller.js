import bcrypt from "bcrypt";
import userModel from "../model/user_model.js";
import bookModel from "../model/book_model.js";
import cartModel from "../model/cart_model.js";
import {cartUtils} from "../public/js/cart_utils.js";

class StoreController {

    static showHome = async (req,res) => {
        try {
            const books = await bookModel.find()
            const userId = req.session.userId;
            const cart = await cartModel
                .findOne({userId: userId})
                .populate('items.bookId')
                .lean();
            const totalItems = cart ? cartUtils.countTotalItems(cart) : 0;
            const subTotal = cart ? cartUtils.calculateSubtotal(cart) : 0;
            const cartCount = cart ? cart.items.length : 0;
            res.render("home", {'books': books , 'totalItems': totalItems, 'subTotal': subTotal, 'cartCount': cartCount});
        } catch (error) {
            console.log("Error loading books:", error);
            res.render("home", { books: [] });
        }
    };

    static showLogin = (req,res) => {
        const myMsg = req.session.msg;
        delete req.session.msg;
        res.render('login', {msg: myMsg});
    }

    static showRegister = (req,res) => {
        const myMsg = req.session.msg;
        delete req.session.msg;
        res.render('register', {msg: myMsg});
    }

    static logOutUser = (req,res) => {
        req.session.destroy(() => res.redirect('/'));
    }

    static registerUser = async (req, res) => {
        try {
            const {firstName, lastName, email, password, phone, address, province, city, postalCode} = req.body;

            const existingUser = await userModel.findOne({ email: email });

            if (existingUser) {
                req.session.msg = 'Email already registered';
                return res.redirect('/register');
            }

            const hashed = await bcrypt.hash(password, 10);

            await userModel.create({
                firstName,
                lastName,
                email,
                password: hashed,
                userType: "customer",
                phone,
                address: `${address},${city},${province},${postalCode}`
            });

            return res.redirect('/login');

        } catch (error) {
            console.log("Error registering user:", error);
            res.redirect('/register');
        }
    };

    static loginUser = async(req,res) => {
        try {
            const loginUser = req.body;

            const storedUser = await userModel.findOne({ email: loginUser.email });
            
            if (!storedUser) {
                req.session.msg = 'Email not found please register first';
                return res.redirect('/register');
            }

            const comparePassword = await bcrypt.compare(loginUser.password, storedUser.password);
            if (!comparePassword) {
                req.session.msg = 'Password does not match';
                return res.redirect('/login');
            }
            
            req.session.validUser = true;
            req.session.userId = storedUser._id.toString();
            req.session.userType = storedUser.userType;
            res.redirect('/home')            
            
        } catch(error) {
            console.log('There was an error: ',error);
        }
    }
}

export default StoreController;