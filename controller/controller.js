import bcrypt from 'bcrypt';

class StoreController {

    static showHome = (req,res) => {
        res.render('home');
    };
}

export default StoreController;