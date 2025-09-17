// console.log("Server is starting now.....")

// console.log("object")
import chalk from "chalk";
import express from "express";
import mongoose from "mongoose";
import { userModel } from "./model/userSchema.js";
import bcrypt from "bcryptjs";

const app = express();

// body parser middleware
app.use(express.json());

const PORT = 2401;

const MONOGODB_URI = `mongodb+srv://nabeel:nabeel12345@cluster0.eej9cwx.mongodb.net/`


mongoose.connect(MONOGODB_URI).then((res) => {
    console.log(chalk.bgBlue.bold.italic("MongoDB is connected now..."));
})
.catch((err) => {
    console.log(chalk.bgRed.bold.italic(err));
})


// sign up api

app.post("/api/signup", async (req, res) => {


  try{
      const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message: "Required fields are missing",
            status: false,
        });

    }

    const encrayptPassword = await bcrypt.hash(password,10)
    console.log(encrayptPassword)

    const userobj = {
        name,
        email,
        password: encrayptPassword,
    };
    
 // create data on mongo db
    const saveData = await userModel.create(userobj);


    res.status(200).json({
        message: "Create user successfully",
        saveData,
    });
    } catch(err){
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
  }
  
})

// login api

app.post("/api/login", async (req,res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message:"Required Fields Are Missing",
                status: false,
            });

        }

        const getData = await userModel.findOne({email});
        if(!getData){
            return res.status(400).json({
                message:"Invalid Credentials",
                status: false,
            });
        }

        const comparePassword = await bcrypt.compare(password,getData.password);

        if(!comparePassword){
            return res.status(400).json({
                message:"Invalid Credentials",
                status: false,
            });
        }

        res.status(200).json({
            message: "Login Successfully.......",
            status: true,
        })



    }catch (erro) {
        res.status(500).json({
            message: "Internal Server Error",
            status: false,
        });
    }
});







app.get('/',(req,res) => {
    res.json({
        message:"Server is running now....."
    });
    
})

app.listen(PORT,() => {
    console.log(
        chalk.bgGreen.bold.italic(`Server is runing on http://localhost:${PORT}`)
    );
})


// try {
  //     const { firstName, lastName, email, password} = req.body;

  //     if(!firstName || !lastName || !email || !password){
  //         res.status(400).json({
  //             message: "Required Fields are missing",
  //             status: false,
  //         });

  //     }

  //     const en
  // }
// app.get("/",(req,res) => {
//     res.send("hi there, welcome to express js");
// })

// app.get("/about",(req,res) => {
//     res.send("hi there, welcome to about page");
// })    

// app.listen(2401,() => {
//     console.log("Server is running on port 2401");
// })