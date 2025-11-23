const express = require("express");
const config = require("./src/configs/config");
const db = require('./src/configs/db');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(express.json());

db.connect();

app.use('/api/v1/auth', authRoutes);

const server = app.listen(config.PORT, () => {
    console.log(`Server is running on port http://localhost:${config.PORT}`);
})