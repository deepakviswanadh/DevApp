let express = require("express"),
  router = express.Router(),
  { check, validationResult } = require("express-validator"),
  gravatar = require("gravatar"),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  config = require("config"),
  User = require("../../models/User");

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Valid email please").isEmail(),
    check("password", "Password with length of 6 chars").isLength({ min: 6 }),
  ],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ error: x.array() });
    //console.log(req.body);
    let { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ error: [{ message: "user exists" }] });
      let avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({ name, email, avatar, password });

      let salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      let payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtTokenSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
