import chalk from "chalk";
import express from "express";
import mongoose from "mongoose";
import  userModel  from "./model/userSchema.js";
import bcrypt from "bcryptjs";
import cors from "cors";
import appointmentRouter from "./Routes/appointment.js";

const app = express();
const PORT = process.env.PORT || 2401;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`, req.body);
    next(); 
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nabeel:nabeel12345@cluster0.eej9cwx.mongodb.net/testdb";

mongoose.set('strictQuery', false);


app.use("/api/appointment", appointmentRouter);

app.get("/", (req, res) => {
    res.json({
        message: "Server is running now.....",
    });
});


app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Required fields are missing",
                status: false,
            });
        }

        const checkUser = await userModel.findOne({ email });
        if (checkUser) {
            return res.status(400).json({
                message: "Email already exists",
                status: false,
            });
        }
        
        const encPassword = await bcrypt.hash(password, 10);
        
        await userModel.create({
            name,
            email,
            password: encPassword,
        });
        
        res.status(200).json({
            message: "User created successfully",
            status: true,
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
            status: false
        });
    }
});


app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Required fields are missing",
                status: false,
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
                status: false,
            });
        }
        
        const comparePassword = await bcrypt.compare(password, user.password);
        
        if (!comparePassword) {
            return res.status(400).json({
                message: "Invalid credentials",
                status: false,
            });
        }
        
        res.status(200).json({
            message: "Logged in successfully",
            status: true,
            user,
        });
        
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    mongoose.connection.on('error', (err) => console.error('Mongo connection error:', err));
    mongoose.connection.once('open', () => console.log('MongoDB connection open'));
    console.log(chalk.bgBlue("MongoDB Connected"));

    app.listen(PORT, () => {
      console.log(chalk.bgGreen.bold(`Server running at http://localhost:${PORT}`));
    });
  } catch (err) {
    console.error(chalk.bgRed("MongoDB connection error:"), err.message);
    process.exit(1);
  }
}

startServer();