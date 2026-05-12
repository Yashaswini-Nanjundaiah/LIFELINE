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


/* ---------------- GET ALL RELIEF CAMPS ---------------- */
app.get("/api/relief-camps", (req, res) => {
  const sql = `
    SELECT rc.*, d.name AS disaster_name
    FROM relief_camps rc
    LEFT JOIN disasters d ON rc.disaster_id = d.id
    ORDER BY rc.camp_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ---------------- ADD RELIEF CAMP ---------------- */
app.post("/api/relief-camps", (req, res) => {
  const {
    camp_id,
    name,
    location,
    capacity,
    occupancy,
    status,
    coordinator,
    disaster_id
  } = req.body;

  if (!camp_id || !name) {
    return res.status(400).json({
      error: "Camp ID and Name required"
    });
  }

  const sql = `
    INSERT INTO relief_camps
    (camp_id, name, location, capacity, occupancy, status, coordinator, disaster_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      camp_id,
      name,
      location,
      capacity,
      occupancy,
      status,
      coordinator,
      disaster_id
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Relief camp added"
      });
    }
  );
});

/* ---------------- START SERVER ---------------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
