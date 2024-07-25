const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const dbConfig = require("./db.config");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);

// Connect to the database
dbConfig
  .connectToDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
