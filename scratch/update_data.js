import mongoose from 'mongoose';
import Department from '../backend/src/models/Department.js';
import SubDepartment from '../backend/src/models/SubDepartment.js';
import User from '../backend/src/models/User.js';
import Review from '../backend/src/models/Review.js';
import ResearchPaper from '../backend/src/models/ResearchPaper.js';
import Event from '../backend/src/models/Event.js';

const MONGODB_URI = 'mongodb://localhost:27017/axonx';

async function update() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Update Departments with long detailed content
  const depts = await Department.find();
  for (const dept of depts) {
    if (dept.name === 'Internal Medicine') {
        dept.description = "AxonX Internal Medicine Node provides comprehensive, long-term care for adults, specializing in the prevention, diagnosis, and treatment of complex diseases. Our clinical experts utilize advanced neural modeling to track patient recovery across multi-organ systems. We manage chronic conditions like hypertension, diabetes, and pulmonary disorders with a focus on holistic wellness and preventative diagnostics. Our department is equipped with state-of-the-art telemetry and is peer-reviewed by the Global Nodal Council.";
    } else {
        dept.description = `The ${dept.name} department at AxonX represents a pinnacle of clinical excellence, integrating multi-disciplinary approaches to treat ${dept.name.toLowerCase()} related conditions. With our advanced diagnostic suites and expert medical faculty, we ensure every patient receives a personalized recovery protocol. Our research-driven methodology ensures that we remain at the forefront of medical innovation, providing life-saving interventions and comprehensive health management for the entire community. Focus areas include advanced surgery, metabolic health, and robotic-assisted diagnostics.`;
    }
    await dept.save();
  }
  console.log('Departments updated');

  // 2. Update Sub-Departments with long detailed content
  const subDepts = await SubDepartment.find();
  for (const sub of subDepts) {
    sub.description = `The ${sub.name} sub-division operates as a specialized clinical node within the broader department architecture. It focuses on precision diagnostics for ${sub.name.toLowerCase()} disorders, utilizing high-resolution imaging and biochemical analysis. Our specialists are dedicated to advanced therapeutic pathways, ensuring that each intervention is backed by real-time telemetry and peer-reviewed research papers available in the AxonX digital library. We provide 24/7 emergency response and specialized outpatient care protocols designed for maximum patient efficacy.`;
    await sub.save();
  }
  console.log('Sub-Departments updated');

  // 3. Create some reviews for doctors to give them ratings
  const doctors = await User.find({ role: 'doctor' });
  const patients = await User.find({ role: 'patient' });
  
  if (doctors.length > 0 && patients.length > 0) {
    // Clear old reviews to start fresh
    await Review.deleteMany({});
    for (const doc of doctors) {
      for (let i = 0; i < 3; i++) {
        await Review.create({
          doctorId: doc._id,
          patientId: patients[0]._id,
          rating: 4 + Math.random(),
          comment: "Excellent clinical care and expert diagnosis."
        });
      }
    }
    console.log('Reviews/Ratings created');
  }

  // 4. Update Hospitals to ensure name/username/email are clear
  const hospitals = await User.find({ role: 'hospital' });
  for (const host of hospitals) {
    if (!host.name.includes('Hospital')) {
      host.name = host.name + ' Multi-Specialty Hospital';
    }
    await host.save();
  }
  console.log('Hospitals updated');

  await mongoose.disconnect();
  console.log('Disconnected');
}

update().catch(console.error);
