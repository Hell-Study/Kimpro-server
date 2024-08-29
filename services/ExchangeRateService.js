const yahooFinance = require("yahoo-finance2").default;
const EventEmitter = require("events");

class ExchangeRateService extends EventEmitter {
  constructor(symbol = "KRW=X", interval = 60000) {
    super();
    this.symbol = symbol;
    this.interval = interval;
    this.lastRate = null;
    this.intervalId = null;
  }

  async fetchRate() {
    try {
      const result = await yahooFinance.quote(this.symbol);
      const rate = {
        date: new Date(),
        rate: result.regularMarketPrice,
        price_close: result.regularMarketPrice,
      };

      if (!this.lastRate || rate.rate !== this.lastRate.rate) {
        this.lastRate = rate;
        this.emit("newRate", rate);
      }
    } catch (error) {
      this.emit("error", error);
    }
  }

  start() {
    this.fetchRate();
    this.intervalId = setInterval(() => this.fetchRate(), this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getLastRate() {
    return this.lastRate;
  }
}

module.exports = ExchangeRateService;
