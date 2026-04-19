import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import SubDepartment from './src/models/SubDepartment.js';

const seed = async () => {
    await connectDB();
    console.log("Seeding hospital sub-departments...");
    
    const hospitals = await User.find({ role: 'hospital' });
    const subDepts = await SubDepartment.find({});
    
    if (subDepts.length === 0) {
        console.log("No sub-departments found to assign.");
        process.exit(0);
    }
    
    // Assign random 2-4 sub-departments to each hospital
    for (let i = 0; i < hospitals.length; i++) {
        const h = hospitals[i];
        const shuffled = [...subDepts].sort(() => Math.random() - 0.5);
        const count = Math.min(subDepts.length, 2 + (i % 3));
        const assigned = shuffled.slice(0, count).map(s => s._id);
        await User.findByIdAndUpdate(h._id, { subDepartments: assigned });
        console.log(`  ✅ ${h.name}: ${count} sub-depts assigned`);
    }
    
    console.log(`Seeded ${hospitals.length} hospitals!`);
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
