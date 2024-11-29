import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const verifyJWT = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: "No user found" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ message: "Unauthorized" });
    }
};