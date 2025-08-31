import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {generate} from './llm.js'; // Import the result function from llm.js
const app = express();
app.use(cors()); // Enable CORS for all routes
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

app.post('/chat',async(req,res)=>{
    const {message} = req.body;
    console.log("Received message:", message);
    const llmResult = await generate(message);//result from   llm.js
    res.json({ message: llmResult });
})
const PORT = process.env.PORT || 18298;
app.listen(PORT,()=>{
    console.log(`Server is running on port:${PORT}`);
})
