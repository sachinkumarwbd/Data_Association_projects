const express = require("express");
const app = express();
const usermodel = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const postmodel = require("./models/post");
const path = require("path");
const upload = require("./config/multerconfig");



app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});

app.post("/upload", isLoggedIn,  upload.single("image"), async (req, res) => {
  let user = await usermodel.findOne({ email: req.user.email },);
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect("/profile");
  
  
});





app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile",isLoggedIn,  async (req, res) => {
 let user = await usermodel.findOne({email:req.user.email}).populate("posts")
  console.log(user);
  res.render("profile",{user});
});


app.get("/like/:id",isLoggedIn,  async (req, res) => {
  let post = await postmodel.findOne({_id: req.params.id}).populate("user")
   

   if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
   }
   else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
   }


  
   await post.save();
   res.redirect("/profile");
 });


 app.get("/edit/:id",isLoggedIn,  async (req, res) => {
  let post = await postmodel.findOne({_id: req.params.id}).populate("user")
   res.render('edit',{post}) 
 });


 app.post("/update/:id",isLoggedIn,  async (req, res) => {
  let post = await postmodel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content})
   res.redirect('/profile',); 
 });


app.post("/post",isLoggedIn,  async (req, res) => {
  let user = await usermodel.findOne({email:req.user.email})

   let post = await postmodel.create({
    user: user._id,
    content: req.body.content

   })
   user.posts.push(post._id);
   await user.save();
   res.redirect("/profile");
 });

app.post("/register", async (req, res) => {
  let { name, password, email, age, username } = req.body;

  let user = await usermodel.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await usermodel.create({
        name,
        password: hash,
        email,
        age,
        username
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.send("register");
    })
);
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await usermodel.findOne({email});
  if(!user) return res.status(500).send("some thing went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    }
     else res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req,res, next) {
  console.log(req.cookies.token);
  if(req.cookies.token === "") res.redirect("/login")
  else {
    let data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
    next();
  }

 
}


app.listen(3000);
