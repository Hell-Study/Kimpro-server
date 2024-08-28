const { investing } = require("investing-com-api");
const logger = require("../utils/logger");

const FETCH_INTERVAL = 60000;

class ExchangeRateService {
  constructor() {
    this.lastData = null;
    this.clients = new Set();
    this.isFetching = false;
    this.lastFetchTime = 0;
  }

  async fetchData() {
    const now = Date.now();
    if (this.isFetching || now - this.lastFetchTime < FETCH_INTERVAL) return;

    this.isFetching = true;
    this.lastFetchTime = now;

    try {
      const allData = await investing("currencies/usd-krw", "P1D", "PT1M", 60, {
        headless: "true",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        ignoreHTTPSErrors: true,
      });

      if (!allData || !Array.isArray(allData) || allData.length === 0) {
        logger.error("Invalid or empty data received");
        return;
      }

      const latestData = allData[allData.length - 1];
      if (
        !this.lastData ||
        latestData.price_close !== this.lastData.price_close
      ) {
        this.broadcastToClients(latestData);
        this.lastData = latestData;
      }
    } catch (err) {
      logger.error("Error fetching data:", err);
      this.broadcastError(err.message);

      setTimeout(() => this.fetchData(), 5000);
    } finally {
      this.isFetching = false;
    }
  }

  broadcastToClients(data) {
    for (const client of this.clients) {
      client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  broadcastError(message) {
    for (const client of this.clients) {
      client.response.write(`error: ${message}\n\n`);
    }
  }

  addClient(client) {
    this.clients.add(client);
    if (this.lastData) {
      client.response.write(`data: ${JSON.stringify(this.lastData)}\n\n`);
    } else {
      // 데이터가 없으면 즉시 가져오기
      this.fetchData();
    }

    const closeListener = () => {
      this.clients.delete(client);
      logger.info(
        `Client ${client.id} disconnected. Total clients: ${this.clients.size}`
      );
      client.response.removeListener("close", closeListener);
    };
    client.response.on("close", closeListener);
  }

  getClientsCount() {
    return this.clients.size;
  }

  startFetching() {
    this.fetchData();
    setInterval(() => this.fetchData(), FETCH_INTERVAL);
  }
}

const exchangeRateService = new ExchangeRateService();
exchangeRateService.startFetching();

module.exports = exchangeRateService;
