import sqlite3 from 'sqlite3';
sqlite3.verbose();
let sql

const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the test database.');
})

//sql1 = `CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name, salary)`
//sql = `INSERT INTO employees (name, salary) VALUES ('Zain', 1000)`;
// db.run(sql, [] , (err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     else console.log('Row inserted');
// })

sql = `SELECT COUNT(*) FROM employees WHERE work_year=2020`;
db.all(sql, [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    rows.forEach((row) => {
        console.log(row);
    });
});

// sql = 'DELETE FROM employees WHERE id = ?';
// db.run(sql, [1], (err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Row deleted');
// });