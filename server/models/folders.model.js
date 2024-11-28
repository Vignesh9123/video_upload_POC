import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    name:String,
    files:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File"
        }
    ]
},{timestamps: true});

export const Folder = mongoose.model("Folder", folderSchema); 