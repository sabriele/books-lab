/* eslint-disable no-console */
const app = require("./app");
const mongoose = require("mongoose");

const isInProduction = process.env.NODE_ENV === "production";
const notInProduction = process.env.NODE_ENV !== "production";

if (notInProduction) require("dotenv").config();

const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

mongoose.connect(mongodbUri, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", err => {
  console.error(console, "connection error:", err);
});
db.once("open", () => {
  console.log("Succesfully connected to the database.");
  app.listen(port, () => {
    if (isInProduction) {
      console.log(`App is now running on Heroku with port number ${port}`);
    } else {
      console.log(`App is now running on http://localhost:${port}`);
    }
  });
});
