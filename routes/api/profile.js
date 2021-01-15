let express = require("express"),
  router = express.Router(),
  auth = require("../../middleware/auth"),
  Profile = require("../../models/Profile"),
  { check, validationResult } = require("express-validator"),
  User = require("../../models/User");

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   private

router.get("/me", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ message: "No profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("server error");
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ errors: x.array() });
    let {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    let profile = {};
    profile.user = req.user.id;
    if (company) profile.company = company;
    if (website) profile.website = website;
    if (location) profile.location = location;
    if (bio) profile.bio = bio;
    if (status) profile.status = status;
    if (githubusername) profile.githubusername = githubusername;
    if (skills) profile.skills = skills.split(",").map((skill) => skill.trim());
    profile.social = {};
    if (youtube) profile.social.youtube = youtube;
    if (twitter) profile.social.twitter = twitter;
    if (facebook) profile.social.facebook = facebook;
    if (instagram) profile.social.instagram = instagram;
    if (linkedin) profile.social.linkedin = linkedin;
    try {
      let p = await Profile.findOne({ user: req.user.id });

      //update
      if (p) {
        p = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profile },
          { new: true }
        );
        return res.json(p);
      }
      //create
      p = new Profile(profile);
      await p.save();
      res.json(p);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route    GET api/profile
// @desc     View all profiles
// @access   public

router.get("/", async (req, res) => {
  try {
    let p = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(p);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     View profile by user_id
// @access   public

router.get("/user/:user_id", async (req, res) => {
  try {
    let p = await Profile.findOne({ user: req.params.user_id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!p) return res.status(400).json({ message: "Profile not found" });
    res.json(p);
  } catch (err) {
    if (err.kind == "ObjectId")
      return res.status(400).json({ message: "profile not found" });
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route    DELETE api/profile
// @desc     Delete a user and his profile
// @access   private

router.delete("/", auth, async (req, res) => {
  try {
    await User.findOneAndRemove({ _id: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });
    res.json({ message: "user and profile removed" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route    PUT api/profile/experience
// @desc     Add experience to profile
// @access   private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ errors: x.array() });
    let { title, company, location, from, to, current, description } = req.body;
    let newExp = { title, company, location, from, to, current, description };
    try {
      let p = await Profile.findOne({ user: req.user.id });
      p.experience.unshift(newExp);
      await p.save();
      res.json(p);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route    DELETE api/profile/experience/:experience_id
// @desc     Delete experience from profile
// @access   private

router.delete("/experience/:experience_id", auth, async (req, res) => {
  try {
    let p = await Profile.findOne({ user: req.user.id });
    let index = p.experience
      .map((item) => item.id)
      .indexOf(req.params.experience_id);
    p.experience.splice(index, 1);
    await p.save();
    res.json(p);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    PUT api/profile/education
// @desc     Add education to profile
// @access   private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ errors: x.array() });
    let {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    let newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      let p = await Profile.findOne({ user: req.user.id });
      p.education.unshift(newEdu);
      await p.save();
      res.json(p);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("error message");
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let p = await Profile.findOne({ user: req.user.id });
    let index = p.education.map((item) => item.id).indexOf(req.params.edu_id);
    p.education.splice(index, 1);
    await p.save();
    res.json(p);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
