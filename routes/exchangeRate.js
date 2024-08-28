const express = require("express");
const router = express.Router();
const exchangeRateService = require("../services/exchangeRateService");

router.get("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const clientId = Date.now();
  const newClient = { id: clientId, response: res };

  exchangeRateService.addClient(newClient);
});

module.exports = router;
