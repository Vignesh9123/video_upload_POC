import express from "express";
import cors from "cors";
import {v4 as uuidv4} from "uuid";
import multer from "multer";
import dotenv from "dotenv";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import { Folder } from "./models/folders.model.js";
import { File } from "./models/files.model.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use('/uploads', express.static('uploads'));
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage});
app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/folders', async(req, res) => {
    const folders = await Folder.find()
    res.json(folders);
})

app.get('/files/:folderId', async(req, res) => {
    const folderId = req.params.folderId;
    const folder = await Folder.findById(folderId).populate('files');
    res.json(folder.files);
})
app.post('/upload', upload.single('file'), async(req, res) => {
    console.log(req.body);
    console.log(req.file);
    const localPath = req.file.path;
    const filename = req.file.filename;
    let storedFolder = await Folder.findOne({name:req.body.folderName});
    if(!storedFolder){
        storedFolder = await Folder.create({
            name:req.body.folderName,
            files:[]
        })
        await storedFolder.save();
    }
    
    await cloudinary.uploader.upload(localPath, {
        resource_type: 'auto',
    }).then((result) => {
        fs.unlinkSync(localPath);
        File.create({
            name:filename,
            path:result.playback_url
        }).then((file)=>{
            storedFolder.files.push(file._id);
            storedFolder.save().then(()=>{
                res.json({
                    message: 'File uploaded successfully',
                    url: result.playback_url
                })
            })
        })
        
    }).catch((err)=>{
        console.log(err)
    });
})

mongoose.connect(
    process.env.MONGO_URI+'/SkillConnectDemo'
).then(
    ()=>{
        console.log('Connected to MongoDB');
        app.listen(3000, () => console.log('Server running on port 3000'));
    }
).catch((err)=>{
    console.log(err)
})