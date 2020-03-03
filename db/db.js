const sqlite3 = require('sqlite3').verbose();
// open the database
let db = new sqlite3.Database('Database0.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  else {
  console.log('Connected to Database0');}
});

db.serialize(() => {
  db.each(`SELECT minuteID as id,
                  minuteData as data
           FROM minutes`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.id + "\t" + row.data);
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});