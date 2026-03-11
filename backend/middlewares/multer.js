import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,"./public/temp")
    },
    filename: function (req,file,cb){
        cb(null,file.originalname)
    }
})

//read article for multer add minor functionalities by yourself

export const upload = multer({
    storage,
})