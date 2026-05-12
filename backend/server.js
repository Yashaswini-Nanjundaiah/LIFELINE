const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("LifeLine Backend Running");
});

/* ---------------- GET ALL DISASTERS ---------------- */
app.get("/api/disasters", (req, res) => {
  db.query("SELECT * FROM disasters ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ---------------- ADD DISASTER ---------------- */
app.post("/api/disasters", (req, res) => {
  const { name, type, date, location, affected, status } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Name and Type required" });
  }

  const sql = `
    INSERT INTO disasters (name, type, date, location, affected, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, type, date, location, affected, status], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ success: true, id: result.insertId });
  });
});

/* ---------------- START SERVER ---------------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});