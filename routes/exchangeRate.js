const express = require("express");
const router = express.Router();
const { addClient } = require("../services/exchangeRateService");

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    response: res,
  };

  // 클라이언트 추가
  addClient(newClient);
});

module.exports = router;
