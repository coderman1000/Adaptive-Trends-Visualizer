const mongoose = require("mongoose");

exports.connectToDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ABC", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    throw new Error("Database connection failed: " + error.message);
  }
};
