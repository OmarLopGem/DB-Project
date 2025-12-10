import express from 'express';
import session from 'express-session';
import router from './routes/router.js';
import MongoStore from 'connect-mongo';
import connectDB from './config/connection.js';

const app = express();
const port = '9090';

connectDB();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended:true }));
app.use(express.static('public'));
app.use(express.json());


app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://j-omar:LOGjor1602@cluster0.rmdoztf.mongodb.net/NewPages",
        dbName: "NewPages",
        collectionName: "sessions"
    })
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use('/', router);

app.listen(port, () => {
    console.log('Server is listening port: ' + port);
})