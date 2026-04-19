import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ContactQuery from '../models/ContactQuery.js';

dotenv.config();

const clearContactRegistry = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/axonx');
        console.log("Connected to AxonX Cloud Node");

        // Wipe out the seeded entries to give a clean slate
        await ContactQuery.deleteMany({});

        console.log("Contact Registry successfully cleared. The database collection is now empty.");
        process.exit();
    } catch (error) {
        console.error("Operation Failed:", error);
        process.exit(1);
    }
};

clearContactRegistry();
