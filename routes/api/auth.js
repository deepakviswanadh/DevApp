let express = require("express"),
  auth = require("../../middleware/auth"),
  { check, validationResult } = require("express-validator"),
  jwt = require("jsonwebtoken"),
  config = require("config"),
  bcrypt = require("bcryptjs"),
  User = require("../../models/User"),
  router = express.Router();

// @route    GET api/auth
// @desc     Check user is loggedin/not
// @access   public
router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    POST api/auth
// @desc     Login user and get login token
// @access   public
router.post(
  "/",
  [
    check("email", "Valid email please").isEmail(),
    check("password", "Incorrect Password").exists(),
  ],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ errors: x.array() });
    let { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ message: "no user found" }] });
      }
      let match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ errors: [{ message: "invalid credentials" }] });
      }
      let payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtTokenSecret"),
        { expiresIn: 3600 },
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
