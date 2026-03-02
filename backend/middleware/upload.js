import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to 'uploads' folder
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp + original file extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// single-file uploader with path normalization & URL
const upload = multer({ storage }).single("attachment_path");

// middleware that runs multer then converts path to full URL
export default function (req, res, next) {
  upload(req, res, function (err) {
    if (req.file) {
      const filename = req.file.filename || path.basename(req.file.path);
      const host = req.get("host");           
      const protocol = req.protocol;             
      const base = `${protocol}://${host}`;
      req.file.path = `${base}/uploads/${filename}`.replace(/\\/g, "/");
    }
    next(err);
  });
}