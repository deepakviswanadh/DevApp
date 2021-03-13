let express = require("express"),
  http = require("http"),
  Db = require("./config/db");
// const bodyParser = require("body-parser");

let app = express(),
  server = http.createServer(app);

// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({ extended: false }));

Db();

//routes

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
server.listen(process.env.PORT || 5000, process.env.IP, () => {
  console.log("5000 up");
});
