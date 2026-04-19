import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** Factory: creates a multer uploader that stores files in /uploads/<folder>/ */
const createUpload = (folder) => {
    const dir = path.join(__dirname, `../../uploads/${folder}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return multer({
        storage: multer.diskStorage({
            destination: (_, __, cb) => cb(null, dir),
            filename: (_, file, cb) => {
                const uid = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${folder.replace("/", "-")}-${uid}${path.extname(file.originalname)}`);
            }
        }),
        fileFilter: (_, file, cb) => {
            if (file.mimetype.startsWith("image/")) cb(null, true);
            else cb(new Error("Only image files are allowed"), false);
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
    }).single("image");
};

export const uploadDeptImage    = createUpload("departments");
export const uploadSubDeptImage = createUpload("sub-departments");
