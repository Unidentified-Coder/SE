/* Import dependencies */
const express = require("express");

/* Create express instance */
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Use the pug template engine
app.set("view engine", "pug");
app.set("views", "./views");

// Add a static files location
app.use(express.static("static"));

console.log(process.env.MODE_ENV);

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

// Returns an array of cities from the database
app.get("/cities", (req, res) => {
  // Initialize sorting clauses
  let orderClauses = [];

  // Define valid sort options and corresponding SQL
  const sortOptions = {
      'population_asc': 'Population ASC',
      'population_desc': 'Population DESC',
      'name_asc': 'Name ASC',
      'name_desc': 'Name DESC'
  };

  // Check if sort parameter is provided and valid
  Object.keys(sortOptions).forEach(key => {
      if (req.query[key]) {
          orderClauses.push(sortOptions[key]);
      }
  });

  // Build the query with dynamic ORDER BY clause
  let query = "SELECT * FROM city";
  if (orderClauses.length > 0) {
      query += ` ORDER BY ${orderClauses.join(", ")}`;
  }

  // Execute the query
  db.execute(query, (err, rows, fields) => {
      if (err) {
          console.error("Error fetching cities:", err);
          return res.status(500).send("Internal Server Error");
      }
      console.log(`/cities: ${rows.length} rows`);
      return res.render("cities", { rows, fields });
  });
});



// Gives the route for the country in the sql database
app.get("/countries", (req, res) => {
  let sortOrder = "ASC"; // Default sorting order

  // Check if sort parameter is provided and valid
  if (req.query.sort && (req.query.sort.toLowerCase() === "asc" || req.query.sort.toLowerCase() === "desc")) {
    sortOrder = req.query.sort.toUpperCase();
  }

  const query = `SELECT * FROM country ORDER BY Population ${sortOrder}`;

  db.execute(query, (err, rows, fields) => {
    if (err) {
      console.error("Error fetching countries:", err);
      return res.status(500).send("Internal Server Error");
    }
    console.log(`/countries: ${rows.length} rows`);
    return res.render("countries", { rows, fields });
  });
});

// Gives the route for the country in the sql database
app.get("/countrylanguages", (req, res) => {
  db.execute("SELECT * FROM `countrylanguage`", (err, rows, fields) => {
    console.log(`/countrylanguages: ${rows.length} rows`);
    return res.send(rows);
  });
});

// Run server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});