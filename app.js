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

app.get("/loadMinutes", (req,res)=> {
    let db = openDB()
    let sql = `SELECT * FROM minutes
           ORDER BY -minuteID 
           LIMIT 1`;

    db.all(sql, [], (err, result) => {
        if (err) {
            throw err;
        }
        res.send({success:"success",result:result})
    });
    closeDB(db);
});
function openDB(){
// open the database
    let db = new sqlite3.Database('./db/Database0.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
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
