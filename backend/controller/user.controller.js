import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookies from "../jwt/AuthToken.js";

// user registration code
export const register = async (req, res) => {
  try {
    // 1️⃣ Validate photo upload
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "User photo is required" });
    }

    const { photo } = req.files;
    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/avif",
      "image/webp",
    ];

    if (!allowedFormats.includes(photo.mimetype)) {
      return res.status(400).json({ message: "Invalid photo format" });
    }

    // 2️⃣ Validate form fields
    const { name, email, password, education, role, phone } = req.body;
    if (!name || !email || !password || !education || !role || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // 4️⃣ Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      photo.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary upload failed:", cloudinaryResponse.error);
      return res.status(500).json({ message: "Photo upload failed" });
    }

    // 5️⃣ Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Save user to MongoDB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      education,
      role,
      phone,
      photo: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });

    await newUser.save();

    // 7️⃣ Success response
    if (newUser) {
      const token = await createTokenAndSaveCookies(newUser._id, res);
      //  console.log(token);
      return res
        .status(201)
        .json({
          message: "User registered successfully",
          newUser,
          token: token,
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// user login code
export const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email }).select("+password");

    // invalid password 
    if (!user.password) {
      return res.status(400).json({ message: "User not found" });
    }

  //  match password 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({ message: "Password Wrong" });
    }

    //  match role
    if (user.role !== role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const token = await createTokenAndSaveCookies(user._id, res);
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// user logout code 
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "User Logout successful" });
  } catch (error) {
     res.status(500).json({ message: "Internal server error" });
  }
}
