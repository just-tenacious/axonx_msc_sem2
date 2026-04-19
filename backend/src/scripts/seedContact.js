import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ContactQuery from '../models/ContactQuery.js';

dotenv.config();

const queries = [
    {
        name: "Dr. Vikram Sarabhai",
        email: "vikram.s@isro.gov.in",
        subject: "Neural Network Calibration Query",
        message: "I am observing high latency in the synaptic response module. Can the AxonX team verify the nodal synchronization parameters for the Neuro-Engineering department?",
        status: "Pending"
    },
    {
        name: "Patient Anjali Gupta",
        email: "anjali.g@gmail.com",
        subject: "Appointment Rescheduling",
        message: "I need to move my oncology screening from Monday to Thursday. The current portal doesn't allow self-service rescheduling for diagnostic clusters.",
        status: "Pending"
    },
    {
        name: "Researcher Rohan Mehta",
        email: "rohan.m@axonx.org",
        subject: "Manuscript Archival Error",
        message: "The PDF upload fails consistently for files larger than 15MB. Our molecular dataset paper is 18MB. Please increase the institutional limit.",
        status: "Responded",
        response: "We have updated the institutional node limits. You can now transmit artifacts up to 50MB. Secure transmission is now active for your account."
    },
    {
        name: "Hospital Admin Priya Das",
        email: "admin@lifeline.in",
        subject: "Institutional Node Integration",
        message: "We want to connect our patient history database to the AxonX global node. What are the secure transmission requirements?",
        status: "Pending"
    },
    {
        name: "Student Ishaan Sharma",
        email: "ishaan.s@medical.edu",
        subject: "Research Internship Inquiry",
        message: "Does AxonX offer nodal research positions for final year neurology students? My thesis focuses on EEG signal processing.",
        status: "Pending"
    }
];

const seedContact = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/axonx');
        console.log("Connected to AxonX Cloud Node");

        await ContactQuery.deleteMany({});
        await ContactQuery.insertMany(queries);

        console.log("Contact Registry Hydrated with 5 Nodal Artifacts");
        process.exit();
    } catch (error) {
        console.error("Hydration Failed:", error);
        process.exit(1);
    }
};

seedContact();
