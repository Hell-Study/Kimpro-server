const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const exchangeRateRouter = require("./routes/exchangeRate");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors(require("./config/corsOptions")));
app.use(morgan("combined"));

app.use("/exchange-rate", exchangeRateRouter);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the API server. Use /exchange-rate to get exchange rate information."
  );
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
