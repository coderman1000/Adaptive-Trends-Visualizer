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
    // Read the Excel file
    const workbook = xlsx.readFile(excelFilePath);

    // Get all sheet names
    const sheetNames = workbook.SheetNames;

    // Connect to the specified database
    const db = mongoose.connection.useDb(dbName);

    // Iterate over each sheet
    for (const sheetName of sheetNames) {
      // Parse the sheet
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Check for required columns in the Excel sheet
      if (
        !sheetData.length ||
        !("ColumnName" in sheetData[0]) ||
        !("Type" in sheetData[0]) ||
        !("DefaultValue" in sheetData[0])
      ) {
        console.warn(
          `Sheet "${sheetName}" is missing required columns (ColumnName, Type, DefaultValue). Skipping...`
        );
        continue;
      }

      // Construct the schema for the MongoDB collection
      const schemaDefinition = {};
      sheetData.forEach((row) => {
        const columnName = row["ColumnName"];
        const type = mapTypeToMongoose(row["Type"]);
        const defaultValue = row["DefaultValue"];

        if (!type) {
          console.warn(
            `Invalid type "${row["Type"]}" for column "${columnName}". Skipping this column.`
          );
          return;
        }

        schemaDefinition[columnName] = {
          type: type,
          default: parseDefaultValue(type, defaultValue),
        };
      });

      // If no valid columns are found, skip creating the collection
      if (Object.keys(schemaDefinition).length === 0) {
        console.warn(
          `No valid columns found in sheet "${sheetName}". Skipping collection creation.`
        );
        continue;
      }

      // Create a Mongoose schema and model
      const schema = new mongoose.Schema(schemaDefinition, {
        timestamps: false,
      });
      await db.model(sheetName, schema); // Register the model

      console.log(
        `Created collection "${sheetName}" with schema:`,
        schemaDefinition
      );
    }

    console.log("All sheets processed successfully.");
  } catch (error) {
    console.error("Error initializing tables:", error);
  }
};

// Helper function to map Excel data types to Mongoose types
function mapTypeToMongoose(type) {
  switch (type.toLowerCase()) {
    case "bit":
      return Boolean;
    case "byte":
      return Number;
    case "uint16":
    case "int16":
    case "float":
    case "double":
      return Number;
    case "char":
      return String;
    default:
      return null; // Invalid type
  }
}

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

    res.json(result);
  } catch (error) {
    common.handleError(res, error);
  }
};
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
    console.log("Result:", result);

    res.json(result);
  } catch (error) {
    common.handleError(res, error);
  }
};
