import Citizen from '../models/Citizen.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import generateToken from '../utils/generateToken.js';
export const registerCitizen = async (req, res) => {
  try {
    const { name, email, phone, sector, houseNumber } = req.body;
    const houseId = `${sector}-${houseNumber}`;
    const existing = await Citizen.findOne({ $or: [{ email }, { houseId }] });
    if (existing) {
      return res.status(400).json({ message: 'Citizen with same email or houseId already exists' });
    }

    const randomPassword = crypto.randomBytes(4).toString('hex'); 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const citizen = await Citizen.create({
      name,
      email,
      phone,
      sector,
      houseNumber,
      houseId,
      password: hashedPassword,
      isVerified: true  
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

const htmlTemplate = `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-user-plus" style="color: #4d9de0; margin-right: 8px;"></i> Welcome to CivicConnect
    </h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0;">
      Hello <strong style="color: #ff6b35;">${name}</strong>,
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #ddd; margin-bottom: 25px;">
      You've been successfully registered as a citizen for <strong style="color: #4d9de0;">Sector ${sector}</strong>.
    </p>

    <!-- Credentials Box -->
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
      <h3 style="color: #4d9de0; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Your Account Credentials</h3>
      <div style="background: #252525; padding: 15px; border-radius: 6px;">
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">House ID:</span> <span style="color: #fff;">${houseId}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Email:</span> <span style="color: #fff;">${email}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Password:</span> <span style="color: #fff;">${randomPassword}</span></p>
      </div>
    </div>

    <!-- Security Note -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0; margin: 25px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px;">
        <strong style="color: #ff6b35;">Important:</strong> 
        Please change this temporary password immediately after your first login.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://civicconnect-nfew.onrender.com" style="background: linear-gradient(to right, #ff6b35, #ff8c42); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(255,107,53,0.3);">
        Log In Now
      </a>
    </div>

    <!-- Additional Info -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">Getting Started:</h4>
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Complete your profile after logging in</li>
        <li style="margin-bottom: 8px;">Explore community features in your sector</li>
        <li>Report any issues through the support portal</li>
      </ul>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Citizen Registration System
    </p>
    <p style="margin: 5px 0 0; color: #666; font-size: 12px;">
      For any issue reply to this email.
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to CivicConnect - Citizen Registration',
      html: htmlTemplate
    });

    res.status(201).json({
      message: 'Citizen registered and email sent successfully',
      citizen: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone,
        houseId: citizen.houseId,
        sector: citizen.sector,
        isVerified: citizen.isVerified
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during citizen registration' });
  }
};

export const loginCitizen = async (req, res) => {
  const { email, password } = req.body;

  try {
    const citizen = await Citizen.findOne({ email });

    if (!citizen) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, citizen.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(citizen._id, 'citizen');

    res.status(200).json({
      message: 'Login successful',
      token,
      citizen: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        sector: citizen.sector,
        houseNumber: citizen.houseNumber,
        houseId: citizen.houseId,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
export const forgotPasswordCitizen = async (req, res) => {
  const { email } = req.body;

  try {
    const citizen = await Citizen.findOne({ email });

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    citizen.resetPasswordToken = token;
    citizen.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await citizen.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `https://civicconnect-nfew.onrender.com/reset-password/${token}`; 
    const htmlTemplate = `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-key" style="color: #4d9de0; margin-right: 8px;"></i> Password Reset Request
    </h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0;">
      We received a request to reset your <strong style="color: #4d9de0;">CivicConnect</strong> account password.
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #ddd; margin-bottom: 25px;">
      Click the button below to securely reset your password. 
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: linear-gradient(to right, #ff6b35, #ff8c42); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(255,107,53,0.3);">
        Reset Your Password
      </a>
    </div>

    <!-- Security Note -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0; margin: 25px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px;">
        <strong style="color: #ff6b35;">Security Note:</strong> 
        If you didn't request this password reset, please ignore this email or contact our support team immediately.
      </p>
    </div>

    <!-- Additional Info -->
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">Need help?</h4>
      <p style="color: #ddd; font-size: 14px; margin: 8px 0;">
        Contact our support team at <a href="mailto:civicconnectpvt@gmail.com" style="color: #ff6b35; text-decoration: none;">civicconnectpvt@gmail.com</a>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Account Security Team
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      to: email,
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      subject: 'Reset Your CivicConnect Password',
      html: htmlTemplate
    });

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

export const resetPasswordCitizen = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const citizen = await Citizen.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!citizen) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    citizen.password = hashedPassword;
    citizen.resetPasswordToken = undefined;
    citizen.resetPasswordExpires = undefined;

    await citizen.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const htmlTemplate = `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-check-circle" style="color: #4d9de0; margin-right: 8px;"></i> Password Updated Successfully
    </h2>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #1a1a1a; display: inline-block; padding: 15px; border-radius: 50%; border: 3px solid #4d9de0;">
        <i class="fas fa-check" style="color: #4d9de0; font-size: 36px;"></i>
      </div>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0; text-align: center;">
      Your CivicConnect password has been <strong style="color: #4d9de0;">successfully updated</strong>.
    </p>

    <!-- Security Note -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0; margin: 30px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px; text-align: center;">
        <strong style="color: #ff6b35;">Security Confirmation:</strong> 
        This change was completed on ${new Date().toLocaleString()}
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background: linear-gradient(to right, #4d9de0, #6bb9f0); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(77,157,224,0.3);">
        Log In to Your Account
      </a>
    </div>

    <!-- Additional Info -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px; text-align: center;">Account Security Tips</h4>
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Never share your password with anyone</li>
        <li style="margin-bottom: 8px;">Enable two-factor authentication for extra security</li>
        <li>Regularly update your password every 3-6 months</li>
      </ul>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Account Security Team
    </p>
    <p style="margin: 5px 0 0; color: #666; font-size: 12px;">
      If you didn't make this change, contact us immediately at <a href="mailto:civicconnectpvt@gmail.com" style="color: #ff6b35; text-decoration: none;">civicconnectpvt@gmail.com</a>
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      to: citizen.email,
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      subject: 'Password Reset Confirmation',
      html: htmlTemplate
    });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCitizenProfile = async (req, res) => {
  try {
    // The protect middleware adds the citizen to req.citizen
    const citizen = await Citizen.findById(req.citizen._id)
      .select('-password -resetPasswordToken -resetPasswordExpires'); // Exclude sensitive fields

    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone,
        sector: citizen.sector,
        houseNumber: citizen.houseNumber,
        houseId: citizen.houseId,
        isVerified: citizen.isVerified,
        createdAt: citizen.createdAt,
        updatedAt: citizen.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching citizen profile' 
    });
  }
};
