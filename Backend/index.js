const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const dbConfig = require("./db.config");
const cors = require("cors");
const { initialize } = require("./apiController"); // Adjust the path as needed

const app = express();
const port = process.env.PORT || 5000;

// Configuration
const dbName = "ProGraphing";
const excelFilePath = "./db_schema.xlsx";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api", routes);

// Connect to the database and initialize tables
dbConfig
  .connectToDb()
  .then(async () => {
    console.log("Database connected successfully.");

    try {
      // Call initialize to set up tables
      await initialize(dbName, excelFilePath);
      console.log("Tables initialized successfully.");
    } catch (error) {
      console.error("Error initializing tables:", error);
    }

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
