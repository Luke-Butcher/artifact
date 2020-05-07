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
    db.serialize(() => {
        db.run(`INSERT INTO minutes(dateTime,location,attendees,userAccess,createdOn,lastUpdated,committee) VALUES(?,?,?,?,?,?,?)`, [req.body.dateTime, req.body.location, req.body.attendees, req.body.attendees, req.body.timestamp, req.body.timestamp,req.body.committee], function (err) {
            if (err) {
                console.log("error inserting in to minutes" + err.message);
                res.send({error: err.message})
            }
            minuteId = this.lastID;
            console.log(`A row has been inserted into minutes with rowid ${this.lastID}`);
                db.run(`INSERT INTO actions(assignees, details,dueDate,createdOn,lastUpdated) VALUES(?,?,?,?,?)`, [req.body.assignees, req.body.details, req.body.dueDate, req.body.timestamp, req.body.timestamp], function (err) {
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
                            closeDB(db);

                        });


                });

        });
    });
    res.send({success:"success"})
});

app.post("/updateMinutes", (req, res) => {
    let db = openDB();
    db.serialize(() => {
        db.run(`UPDATE minutes set dateTime = ?,  location = ?,  attendees = ?,  userAccess = ?,  createdOn = ?,
                    lastUpdated = ?,  committee = ? 
                    where minuteID = ?`
, [req.body.dateTime, req.body.location, req.body.attendees, req.body.attendees, req.body.timestamp, req.body.timestamp,req.body.committee, req.body.minuteID],
            function (err) {
            if (err) {
                console.log("error updating minutes" + err.message);
                res.send({error: err.message})
            }
            console.log(`A row has been updated in minutes with rowid ${this.lastID}`);
            db.run(`update actions set assignees = ?, details = ?, dueDate = ?, createdOn = ?, lastUpdated = ? 
where actionID = ?`,
                [req.body.assignees, req.body.details, req.body.dueDate, req.body.timestamp, req.body.timestamp,req.body.actionID],
                function (err) {
                if (err) {
                    console.log("error updating in to actions" + err.message);
                    res.send({error: err.message})
                }
                console.log(`A row has been updated in actions with rowid ${this.lastID}`);
                db.run(`update agendaItems set relatedMinute = ?, itemDetails =?, relatedActionPoint = ?, 
                                    notes = ?, followupDate = ?, createdOn = ?, lastUpdated = ? 
                                    where agendaItemID = ?`,
                    [req.body.minuteID, req.body.itemDetails, req.body.actionID, req.body.notes, req.body.followupDate, req.body.timestamp, req.body.timestamp, req.body.agendaItemID],
                    function (err) {
                    if (err) {
                        console.log("error updating agendaItems" + err.message);
                        res.send({error: err.message})
                    }
                    console.log(`A row has been updated in agendaItems with rowid ${this.lastID}`);
                    closeDB(db);
                });
            });
        });
    });
    res.send({success:"success"})
});

app.post("/loadSelectableMinutes", (req,res)=> {
    let username = '%' + req.body.username + '%';
    let db = openDB()
    let sql = `SELECT * FROM minutes m
     left outer join agendaItems aI on m.minuteID = aI.relatedMinute
     left outer join actions a on aI.relatedActionPoint = a.actionID
where userAccess like (?)
ORDER BY -m.createdOn`;

    db.all(sql, [username], (err, result) => {
        if (err) {
            throw err;
        }
        res.send({success:"success",result:result})
    });
    closeDB(db);
});

app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let db = openDB();
    let sql = `SELECT * FROM users
           WHERE username = (?) AND password = (?)`;

    db.all(sql, [username, password], (err, result) => {
        if (err) {
            throw err;
        }
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
           WHERE username = (?) AND password = (?)`;

    db.all(sql, [username, password], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length === 1){
            res.send({userExists:true})
        } else {
            db.run(`INSERT INTO users(username,password,createdOn,lastUpdated) VALUES(?,?,?,?)`,
                [req.body.username,req.body.password,req.body.createdOn,req.body.createdOn], function(err) {
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
    closeDB(db);
});

function openDB(){
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
