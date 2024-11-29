import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {timestamps: true});


userSchema.pre('save',async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password =await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.generateToken = function() {
    return jwt.sign({_id: this._id.toString()}, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRY});
}
export const User = mongoose.model("User", userSchema);