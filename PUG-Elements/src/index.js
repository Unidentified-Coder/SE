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

// Dummy data to simulate database response, change it to get data from sql
const dummyData = [
  { ID: 1, Name: "Kabul", CountryCode: "AFG", District: "Kabol", Population: 1780000 },
  { ID: 2, Name: "Qandahar", CountryCode: "AFG", District: "Qandahar", Population: 237500 },
  { ID: 3, Name: "Herat", CountryCode: "AFG", District: "Herat", Population: 186800 },
  { ID: 4, Name: "Mazar-e-Sharif", CountryCode: "AFG", District: "Balkh", Population: 127800 },
  { ID: 5, Name: "Amsterdam", CountryCode: "NLD", District: "Noord-Holland", Population: 731200 }
];

/* Landing route */
app.get("/", (req, res) => {
  // Render the index1.pug template with the dummy data
  res.render("index1", { title: "My index page", heading: "My heading", data: dummyData });
});

/* Filter route */
app.get("/filter", (req, res) => {
  let filteredData = dummyData;

  // Apply filters based on query parameters
  if (req.query.filterByPopulation) {
    if (req.query.filterByPopulation === 'asc') {
      filteredData = filteredData.sort((a, b) => a.Population - b.Population);
    } else if (req.query.filterByPopulation === 'desc') {
      filteredData = filteredData.sort((a, b) => b.Population - a.Population);
    }
  }

  // Render the index1.pug template with the filtered data
  res.render("index1", { title: "My index page", heading: "My heading", data: filteredData });
});

// Run server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
