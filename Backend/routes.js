const express = require("express");
const router = express.Router();
const apiController = require("./apiController");

router.get("/tables/:dbName", apiController.getTableAndColumnNames);
router.post("/columns/values", apiController.getColumnValuesByTimeInterval);

module.exports = router;
