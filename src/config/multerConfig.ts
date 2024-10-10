import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Membuat folder uploads jika belum ada
export const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Menggunakan folder uploads yang sudah ada
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Menggunakan nama file unik
  },
});

// Create the multer instance
export const upload = multer({ storage: storage });
