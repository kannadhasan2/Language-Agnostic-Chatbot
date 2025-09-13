import 'dotenv/config';
import express from "express";
import { createClient } from "@libsql/client";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

const app = express();


app.use(express.json());
app.use(cors());

// Initialize Turso client
const db = createClient({
  url: 'libsql://language-agnostic-chatbot-kannadhasan2.aws-ap-south-1.turso.io',      
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTc1ODAwMTMsImlkIjoiMDJmYTQ1OTItM2RmOC00MmNmLWE3OWItMTgyZDE5MzAyYmM3IiwicmlkIjoiMDNhYmMwMTYtMmYyNS00MWJlLWFhY2UtYWM4YjNiNWU1ZDYxIn0.TNC2VeDemsRqodZ8hQBsed41higT5_HMb5s6f9eHA1PcXLg5oeZR5Jl2Zx5LZGrdyXFYs52zEVXyADf5SoezCQ'  
});

// Database Initialization
const initializeDB = async () => {
  try {
    // Create student table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prompts (
          user_id TEXT NOT NULL,
          prompt TEXT NOT NULL,
          response TEXT NOT NULL,
          datetime TEXT NOT NULL,
          PRIMARY KEY(user_id, datetime)
      );
    `);

    // Create books table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user (
          user_id TEXT PRIMARY KEY,
          user_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
      );
    `);

    console.log("✅ Database initialized successfully");

    // Start server only if running locally (not on Vercel)
    if (!process.env.VERCEL) {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    }

  } catch (e) {
    console.error("DB Initialization Error:", e.message);
    process.exit(1);
  }
};

initializeDB();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const jwtToken = authHeader && authHeader.split(" ")[1];

  if (!jwtToken) return res.status(401).send("Invalid JWT Token");

  jwt.verify(jwtToken, process.env.JWT_SECRET, (error, payload) => {
    if (error) return res.status(401).send("Invalid JWT Token");
    req.register_no = payload.register_no;
    next();
  });
};

// Test API
app.get("/",(request,response) =>{
  response.send("Working")
})

// Register API
app.post("/register", async (request, response) => {
  try {
    const { userId, userName, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password,5)
    const registerUserQuery = `
      INSERT INTO user (user_id, user_name, email, password)
      VALUES (?, ?, ?, ?)
    `;

    await db.execute({
      sql: registerUserQuery,
      args: [userId, userName, email, hashedPassword],
    });

    response.send({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    response.status(500).send({ error: "Failed to register user" });
  }
});


// Login API
app.post("/login",async (request,response)=>{
  const {email,password} = request.body 
  
  const dbUser = await db.execute({
    sql:"SELECT * FROM user WHERE email = ?",
    args:[email],
  })
  if (dbUser.rows.length === 0) return res.status(400).send("Invalid Email");
  const user = dbUser.rows[0];
  const isPasswordValid = await bcrypt.compare(password,user.password)
  if (isPasswordValid) {
    const jwtToken = jwt.sign({ email: email }, process.env.JWT_SECRET);
    response.send({ jwt_token: jwtToken });
  } else {
    response.status(400).send("Incorrect Password");
  }
})

export default app;
