import { Pool } from "pg";
import "dotenv/config";

const con = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

con.connect()
  .then(() => console.log(" Database connected"))
  .catch((err) => console.log(" DB Error:", err));

export default con;