// const mysql = require("mysql2/promise"); // promise 객체를 반환해줄수 있는애
import mysql from "mysql2/promise"

const pool = mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"1234",
    database:"block"
})

export {pool}