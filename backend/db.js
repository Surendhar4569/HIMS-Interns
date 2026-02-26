import {Pool} from "pg"
import "dotenv/config"
const con=new Pool({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:process.env.password,
    database:process.env.database_name

    
})

con.connect()
.then(()=>{console.log("connected")})
.catch((err)=>{console.log(err)})

export default con;