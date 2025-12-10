const express = require("express");
const config = require("./src/configs/config");
const db = require('./src/configs/db');

const authRoutes = require('./src/routes/authRoutes');
const fetchRoutes = require('./src/routes/fetchRoutes');
const postRoutes = require('./src/routes/postRoutes');
const packageRoutes = require('./src/routes/packagesRoutes');
const bookingRoutes = require('./src/routes/bookinRoutes');
const otpRoutes = require('./src/routes/otpRoutes');
const {pageNotFound} = require('./src/routes/errorRoutes');

const app = express();
app.use(express.json());

db.connect();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fetch', fetchRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/otp', otpRoutes);
// At last
app.use(pageNotFound);
const server = app.listen(config.PORT, () => {
    console.log(`Server is running on port http://localhost:${config.PORT}`);
})