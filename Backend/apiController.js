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
    // Load the Excel file
    const workbook = xlsx.readFile(excelFilePath);

    // Use the specified database
    const db = mongoose.connection.useDb(dbName);

    // Iterate over each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        console.error(
          `Sheet "${sheetName}" must have at least two rows (header and data).`
        );
        continue;
      }

      const [headerRow, ...dataRows] = rows;

      // Extract column definitions from the header row
      const schemaDefinition = {};
      for (const column of headerRow) {
        const columnParts = column.split(",");
        const [columnName, type, defaultValue] = columnParts.map((part) =>
          part.trim()
        );

        if (!columnName || !type) {
          console.error(
            `Invalid column definition in sheet "${sheetName}":`,
            column
          );
          continue;
        }

        // Map Excel type to MongoDB field type
        const mongooseType = mapExcelTypeToMongooseType(type);

        if (!mongooseType) {
          console.error(
            `Unsupported type "${type}" for column "${columnName}" in sheet "${sheetName}".`
          );
          continue;
        }

        schemaDefinition[columnName] = {
          type: mongooseType,
          default: defaultValue || undefined,
        };
      }

      // Create schema and model
      const schema = new mongoose.Schema(schemaDefinition, {
        timestamps: { createdAt: "InsertedDateTime", updatedAt: false },
      });

      const model = db.model(sheetName, schema);

      // Insert data rows into the collection
      const documents = dataRows.map((row) => {
        const document = {};
        headerRow.forEach((header, index) => {
          const columnName = header.split(",")[0].trim();
          document[columnName] =
            row[index] !== undefined ? row[index] : undefined;
        });
        return document;
      });

      await model.insertMany(documents);
      console.log(
        `Created table "${sheetName}" with ${documents.length} rows.`
      );
    }
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
};

/**
 * Map Excel data type to Mongoose data type
 * @param {string} excelType - Type from Excel
 * @returns {Function|undefined} Mongoose type
 */
const mapExcelTypeToMongooseType = (excelType) => {
  switch (excelType.toLowerCase()) {
    case "bit":
      return Boolean;
    case "byte":
      return Number;
    case "uint16":
    case "int16":
    case "int32":
    case "uint32":
      return Number;
    case "string":
      return String;
    case "date":
      return Date;
    default:
      return undefined;
  }
};

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
