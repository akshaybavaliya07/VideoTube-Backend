import multer from "multer"

const storage = multer.diskStorage({
    destination: function (_, _, cb) {
      cb(null, './public/temp');
    },
    filename: function (_, file, cb) {
      cb(null, Date.now() + file.filename);
    }
})
  
export const upload = multer({ storage })
