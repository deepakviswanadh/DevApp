let jwt = require("jsonwebtoken"),
  config = require("config");

module.exports = (req, res, next) => {
  let token = req.header("x-auth-token");

  if (!token) return res.status(401).json({ message: "no token, auth denied" });

  try {
    let decoded = jwt.verify(token, config.get("jwtTokenSecret"));

    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ message: "invalid token" });
  }
};
