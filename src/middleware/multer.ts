import multer from "multer";
import AppError from "../library/errorClass";
import { responseStatusCodes } from "../library/interfaces";


  const upload = 
    multer({
      limits: { fileSize: 2000000 },
      fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
          return cb(
            new AppError({
              message: "Invalid file format, Please upload an Image",
              statusCode: responseStatusCodes.BAD_REQUEST,
            })
          );
        }
        cb(null, true);
      },
    });

export default upload;
