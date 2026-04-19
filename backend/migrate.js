import connectDB from './src/config/db.js';
import Event from './src/models/Event.js';

const migrate = async () => {
    await connectDB();
    console.log("Migrating events...");
    const events = await Event.find({});
    for (let e of events) {
        if (!e.tagline) e.tagline = 'Advancing Innovation Together';
        if (!e.detailedDescription) e.detailedDescription = 'Join industry leaders and network with top specialists at our exclusive gathering. This event features keynote speakers, interactive workshops, and extensive networking opportunities across multiple clinical and research disciplines.';
        if (!e.image) e.image = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';
        if (!e.departments || e.departments.length === 0) e.departments = ['Cardiology', 'Neurology'];
        if (!e.subDepartments || e.subDepartments.length === 0) e.subDepartments = ['Clinical Research', 'Applied Therapeutics'];
        if (!e.category) e.category = 'Medical Conference';
        if (!e.location) e.location = 'Sample Address';
        await e.save();
    }
    console.log(`Migration complete for ${events.length} records!`);
    process.exit(0);
}
migrate();
