require("dotenv").config();
const express = require("express");
const cors = require("cors");

const notFoundMiddleWare = require("./middlewares/not-found");
const errorMiddleWare = require("./middlewares/error");
const authRoute = require("./routes/auth-route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);

app.use(notFoundMiddleWare);
app.use(errorMiddleWare);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
