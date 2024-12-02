const express = require("express");
const router = express.Router();
const apiController = require("./apiController");

// Route to initialize the database using an Excel file
router.post("/initialize", async (req, res) => {
  const { dbName, excelFilePath } = req.body;
  if (!dbName || !excelFilePath) {
    return res.status(400).json({
      success: false,
      message: "dbName and excelFilePath are required.",
    });
  }
  const result = await apiController.initialize(dbName, excelFilePath);
  res.status(result.success ? 200 : 500).json(result);
});

// Route to save raw data into a specified table
router.post("/saveRawData", async (req, res) => {
  const { tableName, SID, hexString } = req.body;
  if (!tableName || !SID || !hexString) {
    return res.status(400).json({
      success: false,
      message: "tableName, SID, and hexString are required.",
    });
  }
  const result = await apiController.saveRawData(tableName, SID, hexString);
  res.status(result.success ? 200 : 500).json(result);
});

// Route to fetch table and column names
router.get("/tables/:dbName", apiController.getTableAndColumnNames);

// Route to fetch column values by time interval
router.post("/columns/values", apiController.getColumnValuesByTimeInterval);

module.exports = router;
