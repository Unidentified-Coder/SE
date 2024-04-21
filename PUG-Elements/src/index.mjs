/* Import dependencies */
import express from "express";
import mysql from "mysql2/promise";
import DatabaseService from "./services/database.service.mjs";

/* Create express instance */
const app = express();
const port = 3000;

/* Add form data middleware */
app.use(express.urlencoded({ extended: true }));

// Use the pug template engine
app.set("view engine", "pug");
app.set("views", "./views");

// Add a static files location
app.use(express.static("static"));

console.log(process.env.MODE_ENV);

const db = await DatabaseService.connect();

// Landing route
app.get("/", (req, res) => {
    res.render("index");
});

// About route
app.get("/about", (req, res) => {
    res.render("about", { info: "Currently this is a project handed down to us and we are just experimenting on how good our coding skills are ..." });
});

app.get("/cities", async (req, res) => {
    let sortOrder = ""; // Default sorting order (no sorting)

    // Check if sort parameter is provided and valid
    if (req.query.sort) {
        if (req.query.sort.toLowerCase() === "asc") {
            sortOrder = "ASC";
        } else if (req.query.sort.toLowerCase() === "desc") {
            sortOrder = "DESC";
        }
    }

    let query = "SELECT * FROM city";

    // Append ORDER BY clause if sortOrder is valid
    if (sortOrder) {
        query += ` ORDER BY Population ${sortOrder}`;
    }

    try {
        const [rows, fields] = await db.conn.execute(query);
        return res.render("cities", { rows, fields });
    } catch (error) {
        console.error("Error fetching cities:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/cities/:Id", async (req, res) => {
    const cityId = req.params.id;
    const city = await db.getCity(cityId);
    return res.render("city", { city });
});

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
    const [rows, fields] = await db.getCities();
    return res.send(rows);
});

app.get("/countries", async (req, res) => {
    let sortOrder = ""; // Default sorting order (no sorting)
    let sortField = "Population"; // Default field to sort by

    // Check if sort parameter is provided and valid
    if (req.query.sort) {
        if (req.query.sort.toLowerCase() === "asc") {
            sortOrder = "ASC";
        } else if (req.query.sort.toLowerCase() === "desc") {
            sortOrder = "DESC";
        }
    }

    let query = "SELECT * FROM country";

    // Append ORDER BY clause if sortOrder is valid
    if (sortOrder) {
        query += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    try {
        const [rows, fields] = await db.conn.execute(query);
        return res.render("countries", { rows, fields });
    } catch (error) {
        console.error("Error fetching countries:", error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/countries/:Code", async (req, res) => {
    const countryCode = req.params.id;
    const country = await db.getCountry(countryCode);
    return res.render("country", { country });
});

// Returns JSON array of countries
app.get("/api/countries", async (req, res) => {
    const [rows, fields] = await db.getCountries();
    return res.send(rows);
});

app.get("/countrylanguages", async (req, res) => {
    const [rows, fields] = await db.getCountrylanguages();
    return res.render("countrylanguages", { rows, fields });
});

app.get("/countrylanguages/:Language", async (req, res) => {
    const countrylanguageLanguage = req.params.id;
    const countrylanguages = await db.getCountrylanguage(countrylanguageLanguage);
    return res.render("countrylanguages", { countrylanguages });
});

// Returns JSON array of country languages
app.get("/api/countrylanguages", async (req, res) => {
    const [rows, fields] = await db.getCountrylanguages();
    return res.send(rows);
});

/* Authentication */

// Register
app.get("/register", (req, res) => {
    res.render("register");
});

// Login
app.get("/login", (req, res) => {
    res.render("login");
});

// Account
app.get("/account", async (req, res) => {
    const { auth, userId } = req.session;

    if (!auth) {
        return res.redirect("/login");
    }

    const sql = `SELECT id, email FROM user WHERE user.id = ${userId}`;
    const [results, cols] = await conn.execute(sql);
    const user = results[0];

    res.render("account", { user });
});

app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
        const sql = `INSERT INTO user (email, password) VALUES ('${email}', '${hashed}')`;
        const [result, _] = await conn.execute(sql);
        const id = result.insertId;
        req.session.auth = true;
        req.session.userId = id;
        return res.redirect("/account");
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.sqlMessage);
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).send("Missing credentials");
    }

    const sql = `SELECT id, password FROM user WHERE email = '${email}'`;
    const [results, cols] = await conn.execute(sql);

    const user = results[0];

    if (!user) {
        return res.status(401).send("User does not exist");
    }

    const { id } = user;
    const hash = user?.password;
    const match = await bcrypt.compare(password, hash);

    if (!match) {
        return res.status(401).send("Invalid password");
    }

    req.session.auth = true;
    req.session.userId = id;

    return res.redirect("/account");
});


// Run server!
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});