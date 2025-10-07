import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    // 1️⃣ Validate photo upload
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "User photo is required" });
    }

    const { photo } = req.files;
    const allowedFormats = ["image/jpeg", "image/png", "image/avif", "image/webp"];

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
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 4️⃣ Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(photo.tempFilePath);

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
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        photo: newUser.photo.url,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
