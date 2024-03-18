/* Import dependencies */
const express = require("express");
const mysql = require("mysql2");

/* Create express instance */
const app = express();
const port = 3000;

//Use the pug template engine
app.set("view engine", "pug");
app.set("views","./views");

app.set("view engine", "pug")

//Add a static files location
app.use(express.static("static"));


/* Setup database connection */
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});

/* Landing route */
app.get("/",(req, res) => {
  res.render("index1",
    { 'title': 'My index page', 'heading': 'My heading' });
});

// Sample API route
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/gallery", req, res => {
  res.render("gallery");
});

app.get("/cities", (req, res) => {
  db.execute("SELECT * FROM `city`", (err, rows, fields) => {
    console.log(`/cities: ${rows.length} rows`);
    return res.send(rows);
  });
});

app.get("/cities", async (req, res) => {
  try{
    const [rows, fields]= await db.execute("SELECT * FROM `city`");
    return res.render("cities",{rows, fields});
  }catch(err){
    console.error(err);
  }
});

app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT * FROM `city`");
  return res.send(rows);
})

//Dinamic route example
app.get("/city/:id", function (req, res) {
  //req.params contains any parametres in the request
  //We can examinit in the console for debugging purpose
  console.log(req, res);
  //Retrive the name paramentre and use it in a dinamic generated 
  res.send("Id is " + req.params.id);

});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
