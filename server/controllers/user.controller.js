import { User } from "../models/user.model.js";

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};

const registerUser = async (req,res)=>{
    try {
        const {username,email,password} = req.body;
        const existedUser = await User.findOne({email: email.toLowerCase()});

        if(existedUser){
            return res.status(400).json({message:"User already exists"});
        }

        await User.create({username,email: email.toLowerCase(),password});

        const user = await User.findOne({email: email.toLowerCase()}).select("-password");
        const token = user.generateToken();
        res.status(201)
        .cookie("token",token,{httpOnly:true,  maxAge: 1000 * 60 * 60 * 24 * 7})
        .json({user, token});
    } catch (error) {

        console.log(error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

const loginUser = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email: email.toLowerCase()});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        if(!user.isValidPassword(password)){
            return res.status(401).json({message:"Invalid password"});
        }
        user.password = undefined;
        const token = user.generateToken();
        res.status(200)
        .cookie("token",token,{httpOnly:true,  maxAge: 1000 * 60 * 60 * 24 * 7})
        .json({user:user, token});
    } catch (error) {
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

const getCurrentUser = async (req,res)=>{
    try {
        const user = req.user;
        user.password = undefined;
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

const logoutUser = async (req,res)=>{
    try {
        res
        .status(200)
        .clearCookie("token")
        .json({message:"Logged out successfully"});
    } catch (error) {
        
    }
}
export {getAllUsers,registerUser,loginUser,getCurrentUser, logoutUser};