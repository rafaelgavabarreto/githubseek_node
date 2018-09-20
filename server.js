"use strict";
const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const morgan      = require('morgan');

const cookieSession = require("cookie-session");

app.use(cookieSession({
  name: 'user_id',
  secret: "mylittlesecret"
}));

app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

const indexRoutes = require("./routes/index");
app.use("/", indexRoutes());

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
