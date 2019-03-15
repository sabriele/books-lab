/* eslint-disable no-console */
const app = require("./app");
const port = process.env.PORT || 8080;
const isInProduction = process.env.NODE_ENV === "production";

app.listen(port, () => {
  if (isInProduction) {
    console.log(`App is now running on Heroku with port number ${port}`);
  } else {
    console.log(`App is now running on http://localhost:${port}`);
  }
});
