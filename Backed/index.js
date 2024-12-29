import express from "express";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import axios from "axios";

env.config();

const app = express();
const port = 3010;
const salt=3;

var calaries,protien,fat,carbohydrates;

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


db.connect((err) => {
    if (err) {
        console.log("Connection failed:");
    } else {
        console.log("Connection successful");
    }
});

app.use(express.static("fronted"));

app.get("/", async (req, res) => {

    console.log(percentage(20,50));
    res.render("HOME.ejs",{errorMessage:""});
    
});

app.post("/login", async(req,res)=>{
    console.log("loged");
    const username=req.body.userName;
    const password=req.body.password;
    
  try {
    const result = await db.query("SELECT * FROM login WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      bcrypt.compare(password,storedPassword,(err,result)=>{
        if(result){
          console.log(result);
          res.render("add.ejs",{name:username});
          
        }
        else{
          res.render("HOME.ejs",{errorMessage:"Incorrect password"});
        }
      })

      //if (res) {
        //res.render("secrets.ejs");
      //} else {
        //res.send("Incorrect Password");
      //}
    } else {
     res.render("HOME.ejs",{errorMessage:"user not found please click on register to create account"});
    }
  } 
  catch (err) {
    console.log(err);
  }
});


app.post("/register",async(req,res)=>{
  const username = req.body.userId;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM login WHERE username = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      res.render("HOME.ejs",{errorMessage:"user already exists. Try to login."});
    } else {
      bcrypt.hash(password,salt,async (err,hash)=>{
        if(err){
            res.render("HOME.ejs",{errorMessage:"oops server down"});
        }        
        else{
          const result = await db.query(
          "INSERT INTO login (username, password) VALUES ($1, $2)",
          [username,hash]
        );
        res.render("add.ejs",{name:username});
        console.log(result);
        }
      });
      
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/goal",async(req,res)=>{
  calaries=req.body.calaries;
  protien=req.body.protien;
  fat=req.body.fat;
  carbohydrates=req.body.carbohydrates;
  console.log(calaries,protien,carbohydrates,fat);

  res.render("add.ejs",{calaries:calaries,protien:protien,fat:fat,carbohydrates:carbohydrates});
});

function percentage(currentValue,totalValue){
  var p=(currentValue/totalValue)*100;
  return p;
}

app.get("/home",(req,res)=>{
  res.render("add.ejs",{calaries:calaries,protien:protien,fat:fat,carbohydrates:carbohydrates});
});

app.get("/help",(req,res)=>{
  res.render("help.ejs");
});

app.get("/history",(req,res)=>{
  res.render("history.ejs");
})

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
