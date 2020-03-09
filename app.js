const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/pages/index.html');
});

app.post("/saveMinutes", (req, res) => {
    let db = openDB();
    db.run(`INSERT INTO minutes(minuteData,timestamp) VALUES(?,?)`, [req.body.data,req.body.timestamp], function(err) {
        if (err) {
            console.log(err.message);
            res.send({error:err.message})
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
    closeDB(db);
    res.send({success:"success"})
});

app.post("/loadSelectableMinutes", (req,res)=> {
    let username = req.body.username + '%';

    console.log(username)
    let db = openDB()
    let sql = `SELECT * FROM minutes
           WHERE userAccess LIKE (?)
           ORDER BY -timestamp 
           `;

    db.all(sql, [username], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result)
        res.send({success:"success",result:result})
    });
    closeDB(db);
});

app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let db = openDB();
    let sql = `SELECT * FROM users
           WHERE username LIKE (?) AND password = (?)`;

    db.all(sql, [username, password], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        if (result.length === 1){
            res.send({userExists:true,username:username})
        } else {
            res.send({userExists:false})
        }
    });
    closeDB(db);});
app.post("/signup", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let db = openDB();
    let sql = `SELECT * FROM users
           WHERE username LIKE (?) AND password = (?)`;

    db.all(sql, [username, password], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        if (result.length === 1){
            res.send({userExists:true})
        } else {
            db.run(`INSERT INTO users(username,password,createdOn,lastUpdated) VALUES(?,?,?,?)`, [req.body.username,req.body.password,req.body.createdOn,req.body.createdOn], function(err) {
                if (err) {
                    console.log(err.message);
                    res.send({error:err.message})
                } else {
                    res.send({userExists:false});
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                }
            });
        }
    });
    closeDB(db);});
function openDB(){
// open the database
    let db = new sqlite3.Database('./db/Database0.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            db.get("PRAGMA foreign_keys = ON")
            console.log('Connected to Database0');}
    });
    return db
}

function closeDB(db) {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('connection closed');
    });
}
