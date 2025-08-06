const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware to serve static files (like style.css)
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✔ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Mongoose schema
const UserSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String
}, { timestamps: true });

const Users = mongoose.model("Users", UserSchema);

// ✅ Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/post', async (req, res) => {
  const { fullname, email, password, confirm } = req.body;

  if (password !== confirm) {
    return res.status(400).send("❌ Passwords do not match");
  }

  try {
    const user = new Users({ fullname, email, password });
    await user.save();
    console.log("✔ User saved to DB");
    res.send("✅ Form submission successful");
  } catch (error) {
    console.error("❌ Error saving user:", error);
    res.status(500).send("❌ Internal Server Error");
  }
});

// ✅ Admin Middleware (move it OUTSIDE the route)
function isAdmin(req, res, next) {
  const auth = req.query.auth;
  if (auth === 'adminpass123') {
    return next();
  } else {
    return res.status(401).send("❌ Unauthorized");
  }
}

// ✅ Admin route
app.get('/admin', isAdmin, async (req, res) => {
  try {
    const users = await Users.find().sort({ createdAt: -1 });

    let tableRows = users.map(user => `
      <tr>
        <td>${user.fullname}</td>
        <td>${user.email}</td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin - User Data</title>
        <style>
          body { background: #111; color: #fff; font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #555; padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>All Registered Users</h1>
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Submitted At</th>
          </tr>
          ${tableRows}
        </table>
      </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error("❌ Error in /admin:", error);
    res.status(500).send("❌ Internal Server Error");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
