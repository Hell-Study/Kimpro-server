const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const exchangeRateRouter = require("./routes/exchangeRate");
const exchangeRateService = require("./services/exchangeRateService");
const logger = require("./utils/logger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors(require("./config/corsOptions")));
app.use(morgan("combined"));

app.use((req, res, next) => {
  if (req.path.includes(".env")) {
    return res.status(403).send("Access Forbidden");
  }
  next();
});

app.use("/exchange-rate", exchangeRateRouter);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the API server. Use /exchange-rate to get exchange rate information."
  );
});

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    clientsCount: exchangeRateService.getClientsCount(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

app.use((req, res) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

app.use((err, req, res, next) => {
  logger.error("Server Error:", err);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
