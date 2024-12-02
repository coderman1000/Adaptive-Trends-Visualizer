const mongoose = require("mongoose");
const common = require("./common");
const xlsx = require("xlsx");

/**
 * Initialize tables based on Excel file
 * @param {string} dbName - Database name
 * @param {string} excelFilePath - Path to the Excel file
 */
exports.initialize = async (dbName, excelFilePath) => {
  try {
    const workbook = xlsx.readFile(excelFilePath);
    const sheetNames = workbook.SheetNames;
    const db = mongoose.connection.useDb(dbName);

    // Delete all existing collections
    const collections = await db.db.listCollections().toArray();
    await Promise.all(
      collections.map(async (collection) =>
        db.db.collection(collection.name).drop()
      )
    );
    console.log(`All collections in "${dbName}" deleted successfully.`);

    for (const sheetName of sheetNames) {
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Validate required columns
      if (
        !sheetData.length ||
        !("ColumnName" in sheetData[0]) ||
        !("Type" in sheetData[0])
      ) {
        console.warn(
          `Sheet "${sheetName}" is missing required columns (ColumnName, Type). Skipping...`
        );
        continue;
      }

      // Construct schema
      const schemaDefinition = {};

      sheetData.forEach((row) => {
        const columnName = row["ColumnName"];
        const type = mapTypeToMongoose(row["Type"]);
        const defaultValue = row["DefaultValue"];

        if (!type) {
          console.warn(
            `Invalid type "${row["Type"]}" for column "${columnName}". Skipping column.`
          );
          return;
        }

        schemaDefinition[columnName] = {
          type: type,
          default: parseDefaultValue(type, defaultValue),
        };
      });

      // Add the "InsertedDateTime" column explicitly with +5 hrs
      schemaDefinition["InsertedDateTime"] = {
        type: Date,
        default: () => {
          const now = new Date();
          now.setHours(now.getHours() + 5);
          return now;
        },
      };

      if (Object.keys(schemaDefinition).length === 0) {
        console.warn(
          `No valid columns found in sheet "${sheetName}". Skipping collection creation.`
        );
        continue;
      }

      // Define schema and create model
      const schema = new mongoose.Schema(schemaDefinition, {
        strict: true,
        timestamps: false,
      });
      const model = db.model(sheetName, schema);

      // Insert a sample document to ensure collection is created
      await model.create({});
      console.log(
        `Created collection "${sheetName}" with schema:`,
        schemaDefinition
      );
    }

    console.log("Database initialized successfully.");
    return { success: true, message: "Database initialized successfully." };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, message: "Failed to initialize database.", error };
  }
};

exports.saveRawData = async (tableName, SID, hexString) => {
  try {
    // Validate inputs
    if (!tableName || typeof tableName !== "string") {
      return { success: false, message: "Invalid tableName provided." };
    }
    if (!Number.isInteger(SID)) {
      return { success: false, message: "SID must be an integer." };
    }
    if (!hexString || typeof hexString !== "string") {
      return { success: false, message: "hexString must be a valid string." };
    }

    // Dynamically get the model
    const Model = mongoose.model(tableName);
    if (!Model) {
      return {
        success: false,
        message: `No model found for tableName: ${tableName}`,
      };
    }

    // Calculate InsertedDateTime (now + 5 hours)
    const insertedDateTime = new Date();
    insertedDateTime.setHours(insertedDateTime.getHours() + 5);

    // Create a new document
    const newDocument = new Model({
      SID,
      hexString,
      InsertedDateTime: insertedDateTime,
    });

    // Save the document to the database
    const result = await newDocument.save();
    return { success: true, message: "Data saved successfully.", data: result };
  } catch (error) {
    // Handle specific errors
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error.",
        details: error.errors,
      };
    }
    if (error.name === "MongoError") {
      return {
        success: false,
        message: "Database error.",
        details: error.message,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred.",
      details: error.message,
    };
  }
};

/**
 * Fetch table and column names
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.getTableAndColumnNames = async (req, res) => {
  try {
    const dbName = req.params.dbName;
    const db = mongoose.connection.useDb(dbName);
    const collections = await db.db.listCollections().toArray();

    const result = await Promise.all(
      collections.map(async (collection) => {
        const collectionInfo = await db.collection(collection.name).findOne();
        if (collectionInfo) {
          const columns = Object.keys(collectionInfo).filter(
            (column) => column !== "_id" && column !== "InsertedDateTime"
          );
          return {
            tableName: collection.name,
            columns: columns,
          };
        } else {
          return {
            tableName: collection.name,
            columns: [],
          };
        }
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching table and column names:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch table and column names.",
      error: error.message,
    });
  }
};

/**
 * Fetch column values by time interval
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.getColumnValuesByTimeInterval = async (req, res) => {
  try {
    const { dbName, collectionName, columns, startTime, endTime } = req.body;
    const db = mongoose.connection.useDb(dbName);

    // Convert startTime and endTime to ISO string format
    const startTimeStr = new Date(startTime).toISOString();
    const endTimeStr = endTime ? new Date(endTime).toISOString() : null;

    // Build the query object based on the presence of endTime
    let query;
    if (endTimeStr) {
      // Case 1: endTime is provided
      query = {
        InsertedDateTime: {
          $gte: startTimeStr,
          $lte: endTimeStr,
        },
      };
    } else {
      // Case 2: endTime is not provided
      query = {
        InsertedDateTime: {
          $gte: startTimeStr,
        },
      };
    }

    // Create projection object
    const projection = columns.reduce(
      (proj, col) => ({ ...proj, [col]: 1 }),
      {}
    );
    // Include InsertedDateTime and exclude _id from the projection
    projection.InsertedDateTime = 1;
    projection._id = 0;

    console.log("Query:", JSON.stringify(query));
    console.log("Projection:", JSON.stringify(projection));

    // Find documents without applying projection to debug
    const rawResult = await db.collection(collectionName).find(query).toArray();
    console.log("Raw Result:", rawResult);

    // Apply projection and find documents
    const result = await db
      .collection(collectionName)
      .find(query)
      .project(projection)
      .toArray();

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching column values by time interval:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch column values.",
      error: error.message,
    });
  }
};

/**
 * Map Excel data types to Mongoose types
 */
function mapTypeToMongoose(type) {
  switch (type.toLowerCase()) {
    case "bit":
      return Boolean;
    case "byte":
    case "uint16":
    case "int16":
    case "float":
    case "double":
      return Number;
    case "string":
      return String;
    default:
      return null;
  }
}

/**
 * Parse default values based on type
 */
function parseDefaultValue(type, value) {
  switch (type) {
    case Boolean:
      return value === "true" || value === "1";
    case Number:
      return Number(value);
    case String:
      return value.toString();
    default:
      return null;
  }
}
