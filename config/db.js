let mongoose = require("mongoose"),
  config = require("config");

let dB = async () => {
  try {
    await mongoose.connect(config.get("mongoURI"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("db up");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = dB;
