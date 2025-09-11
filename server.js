import 'dotenv/config';
import express from "express";
import { createClient } from "@libsql/client";
import cors from "cors";

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

app.get("/",(request,response) =>{
  response.send("Working")
})

export default app;
