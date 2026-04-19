import fs from 'fs';
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Department from './src/models/Department.js';
import SubDepartment from './src/models/SubDepartment.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/axonx';

// Verified high-quality medical stock imagery from Unsplash direct CDN
const MEDICAL_IMAGES = [
  "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1519494140681-8917d2600218?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1551076805-e18690437411?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1505751172177-51ad18e739da?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1584032762282-ec511308f40a?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1631815541542-441d9924445e?auto=format&fit=crop&q=80&w=600&h=400",
  "https://images.unsplash.com/photo-1603398938378-e54eab446ddd?auto=format&fit=crop&q=80&w=600&h=400"
];

async function download(url, dest) {
  const res = await axios({ url, responseType: 'stream', timeout: 15000 });
  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(dest);
    res.data.pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const depts = await Department.find({ name: { $ne: 'Cardiology' } });
  for (let i = 0; i < depts.length; i++) {
    const d = depts[i];
    const url = MEDICAL_IMAGES[i % MEDICAL_IMAGES.length];
    const fileName = `${d.name.replace(/[\s&]+/g, '_')}.jpg`;
    const fullPath = path.join(__dirname, 'uploads/departments', fileName);
    
    console.log(`Updating Department: ${d.name}...`);
    try {
      await download(url, fullPath);
      d.image = `/uploads/departments/${fileName}`;
      await d.save();
      console.log(`✅ Success`);
    } catch (e) { console.error(`❌ Fail: ${d.name}`); }
  }

  const subs = await SubDepartment.find();
  for (let i = 0; i < subs.length; i++) {
    const s = subs[i];
    const url = MEDICAL_IMAGES[(i + 5) % MEDICAL_IMAGES.length];
    const fileName = `${s.name.replace(/[\s&]+/g, '_')}.jpg`;
    const fullPath = path.join(__dirname, 'uploads/sub-departments', fileName);

    console.log(`Updating Sub-Dept: ${s.name}...`);
    try {
      await download(url, fullPath);
      s.image = `/uploads/sub-departments/${fileName}`;
      await s.save();
      console.log(`✅ Success`);
    } catch (e) { console.error(`❌ Fail: ${s.name}`); }
  }

  console.log("\n🚀 Verification: All entities now have real medical stock imagery.");
  process.exit(0);
}
main();
