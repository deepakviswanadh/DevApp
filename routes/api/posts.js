let express = require("express"),
  router = express.Router(),
  { check, validationResult } = require("express-validator"),
  auth = require("../../middleware/auth"),
  User = require("../../models/User"),
  Post = require("../../models/Post");

// @route    POST api/posts
// @desc     Create a post
// @access   private

router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ error: x.array() });
    try {
      let user = await User.findById(req.user.id);
      let newPost = new Post({
        text: req.body.text,
        name: user.name,
        user: req.user.id,
        avatar: user.avatar,
      });
      let post = await newPost.save();
      res.json(post);
    } catch (error) {
      res.status(500).send("server error");
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    let posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).send("server error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by id
// @access   private

router.get("/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.json({ message: "post not found" });
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") return res.json({ message: "post not found" });
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   private

router.delete("/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.json({ message: "post not found" });
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ message: "user not authorised" });
    await post.remove();
    res.json({ message: "post removed" });
  } catch (error) {
    if (err.kind === "ObjectId") return res.json({ message: "post not found" });
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   private

router.put("/like/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "post not found" });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ message: "post already liked" });
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "post not found" });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ message: "No likes on post" });
    let remove = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(remove, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Create a comment
// @access   private

router.post(
  "/comment/:id",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    let x = validationResult(req);
    if (!x.isEmpty()) return res.status(400).json({ error: x.array() });
    try {
      let user = await User.findById(req.user.id);
      let post = await Post.findById(req.params.id);
      let comment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
        avatar: user.avatar,
      };
      post.comments.unshift(comment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      res.status(500).send("server error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete a comment
// @access   private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "post doesnot exist" });
    let comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment)
      return res.status(404).json({ message: "commment doesnot exist" });
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ message: "user not authorised" });
    let index = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(index, 1);
    await post.save();
    res.send(post.comments);
  } catch (e) {
    console.log(e.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
