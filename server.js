const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true
}));

// 🔗 MongoDB connect
mongoose.connect("YOUR_MONGODB_CONNECTION_STRING")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// 👤 User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// 📝 Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword
  });

  await newUser.save();

  res.send("Signup successful ✅");
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.send("User not found ❌");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Wrong password ❌");

  req.session.user = username;

  res.send("Login successful 🎉");
});

// 🔒 Dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.send("Please login first 🔐");
  }

  res.send(`Welcome ${req.session.user} 😎`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
