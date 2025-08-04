import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { ICloudeneryResponse, IUploadFile } from "../app/interfaces/file";
// Configuration
cloudinary.config({
  cloud_name: "drvenvkge",
  api_key: "486623841955928",
  api_secret: "zfP8tomF_gNlTCMibwgsfs7rxw8", // Click 'View API Keys' above to copy your API secret
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload an image
const uploadToCloudenery = (
  file: IUploadFile
): Promise<ICloudeneryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file?.path,

      (error: Error, result: ICloudeneryResponse) => {
        fs.unlinkSync(file.path);
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadToCloudenery,
};
