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
app.use(express.static('public'))

app.post("/saveMinutes", (req, res) => {
    let db = openDB();
    let minuteId;
    let actionId;
    // use transactions for safe roll back ? yes. come back and do. promisify?
    db.serialize(() => {
        db.run(`INSERT INTO minutes(dateTime,location,attendees,userAccess,createdOn,lastUpdated,committee) VALUES(?,?,?,?,?,?,?)`, [req.body.dateTime, req.body.location, req.body.attendees, req.body.attendees, req.body.timestamp, req.body.timestamp,req.body.committee], function (err) {
            if (err) {
                console.log("error inserting in to minutes" + err.message);
                res.send({error: err.message})
            }
            minuteId = this.lastID;
            console.log(`A row has been inserted into minutes with rowid ${this.lastID}`);
                console.log(itterate)
                db.run(`INSERT INTO actions(asignees, details,dueDate,createdOn,lastUpdated) VALUES(?,?,?,?,?)`, [req.body.assignees, req, body, actionDetails, req.body.dueDate, req.body.timestamp, req.body.timestamp], function (err) {
                    if (err) {
                        console.log("error inserting in to actions" + err.message);
                        res.send({error: err.message})
                    }
                    actionId = this.lastID
                    console.log(`A row has been inserted into actions with rowid ${this.lastID}`);
                        db.run(`INSERT INTO agendaItems(relatedMinute,itemDetails,relatedActionPoint,notes,followupDate,createdOn, lastUpdated) VALUES(?,?,?,?,?,?,?)`, [minuteId, req.body.itemDetails, actionId, req.body.notes, req.body.followupDate, req.body.timestamp, req.body.timestamp], function (err) {
                            if (err) {
                                console.log("error inserting in to agendaItems" + err.message);
                                res.send({error: err.message})
                            }
                            console.log(`A row has been inserted into agendaItems with rowid ${this.lastID}`);
                        });


                });

        });
    });
    closeDB(db);
    res.send({success:"success"})
});

app.post("/loadSelectableMinutes", (req,res)=> {
    let username = req.body.username + '%';

    console.log(username)
    let db = openDB()
    let sql = `SELECT * FROM minutes m INNER JOIN agendaItems aI on m.id = aI.relatedMinute inner join actions a on aI.relatedActionPoint = a.id where m.userAccess LIKE (?) ORDER BY -m.createdOn`;

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
