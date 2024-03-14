const { investing } = require("investing-com-api");

let lastData = null;
let clients = [];
let isFetching = false;

const fetchData = async () => {
  if (isFetching) return;

  isFetching = true;

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
      console.error("Invalid or empty data received");
      isFetching = false;
      return;
    }

    const latestData = allData[allData.length - 1];
    if (!lastData || latestData.price_close !== lastData.price_close) {
      clients.forEach((client) => {
        client.response.write(`data: ${JSON.stringify(latestData)}\n\n`);
      });
      lastData = latestData;
    }
  } catch (err) {
    console.error(err);
    clients.forEach((client) => {
      client.response.write(`error: ${err.message}\n\n`);
    });
  } finally {
    isFetching = false;
  }
};

const addClient = (client) => {
  clients.push(client);
  // 첫 연결 시 lastData가 있으면 즉시 데이터 전송
  if (lastData) {
    client.response.write(`data: ${JSON.stringify(lastData)}\n\n`);
  }

  // 클라이언트 연결 종료 시 배열에서 제거
  client.response.on("close", () => {
    clients = clients.filter((c) => c.id !== client.id);
    console.log(`Client ${client.id} disconnected`);
  });
};

// 첫 실행 및 주기적 데이터 업데이트
fetchData();
setInterval(fetchData, 40000);

module.exports = { addClient };
