import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
}, {timestamps: true});

export const File = mongoose.model("File", fileSchema);