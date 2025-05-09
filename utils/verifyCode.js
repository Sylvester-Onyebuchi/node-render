import jwt from 'jsonwebtoken'


export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
    res.cookie("token", token, {
        httpOnly: true,
        sameSite:"strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return token
}


export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Make sure this matches how you signed the token
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token." });
    }
};