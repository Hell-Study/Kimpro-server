const whitelist = ["https://kimpro.site"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
    } else if (
      whitelist.indexOf(origin) !== -1 ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"), false);
    }
  },
};

module.exports = corsOptions;
