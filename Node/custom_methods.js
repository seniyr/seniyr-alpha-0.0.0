const path  = require("path");
const { open } = require('sqlite'); // core module
const sqlite3 = require('sqlite3');// using this we connect to database



const start_sqlite_dbserver = async (filepath)=>{ // This is to initialise the connection to a sqlite databse using open method.
    db  =null
    filepath  = path.join(__dirname, filepath);
    

    try {
        db = await open ({  // this is basicly returns promise object so we need to conenct to it first.
            filename : filepath,
            driver :sqlite3.Database

        });

    console.log("database is ",db);
    // return db;
    }
    catch (e) {
        console.log(`Database error : ${db.message}`)
    }
    
    

};

exports.start_sqlite_dbserver = start_sqlite_dbserver;
