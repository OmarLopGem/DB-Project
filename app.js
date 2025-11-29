import express from 'express';
import router from './routes/router.js';

const app = express();
const port = '9090';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended:true }));
app.use(express.static('public'));

app.use('/', router);

app.listen(port, () => {
    console.log('Server is listening');
})