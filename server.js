/* eslint-disable no-console */
const app = require("./app");
const port = process.env.PORT || 8080;
const isInProduction = process.env.NODE_ENV === "production";

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/bookstore", { useNewUrlParser: true });

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
