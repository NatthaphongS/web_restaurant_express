require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const rateLimitMiddleWare = require('./middlewares/rate-limit');
const notFoundMiddleWare = require('./middlewares/not-found');
const errorMiddleWare = require('./middlewares/error');
const authRoute = require('./routes/auth-route');
const menuRoute = require('./routes/menu-route');
const orderRoute = require('./routes/order-route');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.set('trust proxy');
app.use(rateLimitMiddleWare);
app.use(express.json());

app.use('/auth', authRoute);
app.use('/menu', menuRoute);
app.use('/order', orderRoute);

app.use(notFoundMiddleWare);
app.use(errorMiddleWare);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
