import mongoose from 'mongoose';
import User from '../models/User.js';
import ResearchPaper from '../models/ResearchPaper.js';
import Department from '../models/Department.js';
import SubDepartment from '../models/SubDepartment.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axonx';

const paperTemplates = [
    { title: "Neural Logic in Clinical Diagnosis", cat: "Neurology", pdf: "NEURAL_LOGIC.PDF" },
    { title: "Cardiovascular Resilience Models", cat: "Cardiology", pdf: "CARDIO_MODELS.PDF" },
    { title: "Oncology Precision Data", cat: "Oncology", pdf: "ONCO_PRECISION.PDF" },
    { title: "Epidemiological Trends 2026", cat: "Public Health", pdf: "EPIDEM_2026.PDF" },
    { title: "Orthopedic Motion Dynamics", cat: "Sports Medicine", pdf: "ORTHO_MOTION.PDF" },
    { title: "Alzheimer Detection Artifact", cat: "Geriatrics", pdf: "ALZ_DETECTION.PDF" }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Synchronizing with AxonX Network...");

        const allUsers = await User.find();
        const nonAdmins = allUsers.filter(u => u.role !== 'admin');
        const doctors = allUsers.filter(u => u.role === 'doctor');
        const depts = await Department.find();
        const subs = await SubDepartment.find();

        if (doctors.length === 0 || depts.length === 0) {
            console.log("Deployment Blocked: Core identity nodes missing.");
            process.exit(1);
        }

        // Wipe existing archival data
        await ResearchPaper.deleteMany({});
        await Like.deleteMany({});
        await Comment.deleteMany({});

        console.log(`Node Purge Complete. Regenerating for ${doctors.length} investigators...`);

        for (const doctor of doctors) {
            // 1-3 papers per doctor
            const numPapers = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numPapers; i++) {
                const template = paperTemplates[Math.floor(Math.random() * paperTemplates.length)];
                const dept = depts[Math.floor(Math.random() * depts.length)];
                const sub = subs.find(s => s.departmentId === dept._id || s.departmentId?.[0]?._id === dept._id) || subs[0];

                const paper = new ResearchPaper({
                    title: `${doctor.name}: ${template.title} Vol.${i+1}`,
                    abstract: `Advanced clinical investigation into ${template.cat} protocols within the institutional network. This manuscript explores diagnostic accuracy and procedural success rates.`,
                    category: template.cat,
                    pdfUrl: `/uploads/research/${template.pdf}`,
                    publisherId: doctor._id,
                    departmentId: dept._id,
                    subDeptId: sub?._id,
                    status: i === 0 ? 'Approved' : 'Pending' // Some approved, most pending
                });

                await paper.save();

                // Interactions from ALL other non-admins
                const likers = nonAdmins.filter(u => u._id.toString() !== doctor._id.toString()).sort(() => 0.5 - Math.random()).slice(0, 10);
                
                await Like.insertMany(likers.map(u => ({ userId: u._id, targetId: paper._id })));

                const commenters = nonAdmins.filter(u => u._id.toString() !== doctor._id.toString()).sort(() => 0.5 - Math.random()).slice(0, 5);
                await Comment.insertMany(commenters.map(u => ({ 
                    userId: u._id, 
                    targetId: paper._id, 
                    content: `Expert validation from ${u.role} node: Findings mirror observed outcomes in sector-4.${Math.floor(Math.random()*9)}.` 
                })));

                console.log(`Propagated Node: ${paper.title} [Status: ${paper.status}]`);
            }
        }

        console.log("Global Research Repository Synchronized.");
        process.exit(0);
    } catch (error) {
        console.error("Network Sync Error:", error.message);
        process.exit(1);
    }
};

seed();
