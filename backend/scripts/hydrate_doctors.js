import mongoose from 'mongoose';
import User from '../src/models/User.js';
import SubDepartment from '../src/models/SubDepartment.js';
import Department from '../src/models/Department.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/axonx";

async function hydrate() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected for global Specialist hydration...");

    const depts = await Department.find();
    const subDepts = await SubDepartment.find();
    const hospitals = await User.find({ role: 'hospital' });

    if (hospitals.length === 0) {
        console.log("No hospitals found. Cannot hydrate doctors.");
        process.exit();
    }

    console.log(`Starting hydration for ${hospitals.length} hospitals and ${subDepts.length} sub-departments...`);

    // To prevent massive redundancy, let's ensure each hospital has at least 2 doctors for every sub-dept.
    // This will create ~3200 doctors, which is manageable.
    
    for (const hosp of hospitals) {
        console.log(`Hydrating Node: ${hosp.name}`);
        for (const sub of subDepts) {
            const count = await User.countDocuments({ 
                role: 'doctor', 
                subDepartmentId: sub._id,
                hospitalId: hosp._id
            });

            if (count < 2) {
                const needed = 2 - count;
                for (let i = 0; i < needed; i++) {
                    const name = `Dr. ${sub.name.split(' ')[0]} ${i + 1 + count} (${hosp.name.split(' ')[0]})`;
                    const username = `dr_${hosp._id.toString().slice(-4)}_${sub._id.toString().slice(-4)}_${i + count}`;
                    
                    await User.create({
                        name,
                        username,
                        email: `${username}@axonx.med`,
                        password: 'password123',
                        role: 'doctor',
                        departmentId: sub.departmentId,
                        subDepartmentId: sub._id,
                        hospitalId: hosp._id,
                        gender: i % 2 === 0 ? 'Male' : 'Female',
                        dob: new Date(1975 + i, 5, 15),
                        isActive: true,
                        avatar: `https://i.pravatar.cc/150?u=${username}`
                    });
                }
            }
        }
    }

    console.log("Global Clinical Hydration Complete.");
    process.exit();
}

hydrate().catch(err => { console.error(err); process.exit(1); });
