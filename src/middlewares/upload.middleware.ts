import multer from "multer";

// store the file inside RAM (buffer)
const storage = multer.memoryStorage();

// create the upload instance
export const upload = multer({
    storage,
    limits: {fileSize: 10*1024*1024} // 10 mb
})
