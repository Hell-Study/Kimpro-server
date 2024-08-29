const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const ExchangeRateService = require("./services/ExchangeRateService");
const logger = require("./utils/logger");

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(require("./config/corsOptions")));
app.use(morgan("combined"));

// env 파일 접근 제한
app.use((req, res, next) => {
  if (req.path.includes(".env")) {
    return res.status(403).send("Access Forbidden");
  }
  next();
});

const exchangeService = new ExchangeRateService();

exchangeService.on("error", (error) => {
  console.error("Error fetching rate:", error);
});

app.get("/exchange-rate", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendRate = (rate) => {
    res.write(`data: ${JSON.stringify(rate)}\n\n`);
  };

  // 현재 환율 정보가 있으면 바로 보내줌
  const currentRate = exchangeService.getLastRate();
  if (currentRate) sendRate(currentRate);

  exchangeService.on("newRate", sendRate);

  req.on("close", () => {
    exchangeService.removeListener("newRate", sendRate);
  });
});

exchangeService.start();

app.get("/", (req, res) => {
  res.send("Welcome to the Exchange Rate API server.");
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
