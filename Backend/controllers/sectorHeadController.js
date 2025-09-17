import SectorHead from '../models/SectorHead.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import generateToken from '../utils/generateToken.js';
import Issue from '../models/issue.js';
import Citizen from '../models/Citizen.js';
import Feedback from '../models/Feedback.js';
export const registerSectorHead = async (req, res) => {
  try {
    const { name, sector, email } = req.body;

    const existing = await SectorHead.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Sector Head already exists' });
    }
    const randomPassword = crypto.randomBytes(6).toString('hex'); 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const sectorHead = await SectorHead.create({
      name,
      sector,
      email,
      password: hashedPassword,
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
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>
  
  <div style="padding: 30px;">
    <h1 style="text-align: center; color: #ff6b35; margin-bottom: 25px; font-size: 28px;">Welcome to CivicConnect, ${name}!</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #f0f0f0;">
      You're appointed as <span style="color: #4d9de0; font-weight: bold;">Sector Head</span> for 
      <span style="color: #ff6b35; font-weight: bold;">${sector}</span>.
    </p>
    
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
      <h3 style="color: #4d9de0; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Your Login Credentials</h3>
      <div style="background: #252525; padding: 15px; border-radius: 6px;">
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Email:</span> <span style="color: #fff;">${email}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Password:</span> <span style="color: #fff;">${randomPassword}</span></p>
      </div>
      <p style="color: #aaa; font-size: 13px; margin-top: 15px;">
        <i>For security, change your password after login.</i>
      </p>
    </div>
    
    <p style="font-size: 15px; line-height: 1.6; color: #ddd;">
      For help, reach out to <a href="mailto:civicconnectpvt@gmail.com" style="color: #4d9de0;">our support team</a>.
    </p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://civicconnect-nfew.onrender.com" style="background: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Dashboard</a>
    </div>
  </div>

  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} CivicConnect | Empowering Citizens Through Technology
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to CivicConnect - Sector Head Onboarding',
      html: htmlTemplate,
    });

    res.status(201).json({
      message: 'Sector Head registered and email sent successfully',
      sectorHead: {
        id: sectorHead._id,
        name: sectorHead.name,
        email: sectorHead.email,
        sector: sectorHead.sector,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering Sector Head' });
  }
};

export const loginSectorHead = async (req, res) => {
  try {
    const { email, password } = req.body;

    const sectorHead = await SectorHead.findOne({ email });
    if (!sectorHead) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, sectorHead.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(sectorHead._id, 'sectorHead');
    res.status(200).json({
      message: 'Login successful',
      token,
      sectorHead: {
        id: sectorHead._id,
        name: sectorHead.name,
        email: sectorHead.email,
        sector: sectorHead.sector,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPasswordSectorHead = async (req, res) => {
  const { email } = req.body;

  try {
    const sectorHead = await SectorHead.findOne({ email });
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    sectorHead.resetPasswordToken = token;
    sectorHead.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await sectorHead.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink = `https://civicconnect-nfew.onrender.com/sector-head/reset-password/${token}`; // adjust frontend link

    const message = `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #ff6b35; margin-bottom: 25px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      Password Reset Request
    </h2>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: #f0f0f0;">
      We received a request to reset your CivicConnect account password. Click the button below to proceed:
    </p>
    
    <!-- Reset Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: #ff6b35; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s;">
        Reset My Password
      </a>
    </div>
    
    <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0;">
      <p style="margin: 0; color: #aaa; font-size: 14px; text-align: center;">
        <strong style="color: #ff6b35;">Important:</strong> This link will expire in <span style="color: #fff;">1 hour</span>.
        If you didn't request this, please ignore this email.
      </p>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #ddd; margin-top: 30px;">
      For security reasons, we recommend:
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px;">
        <li>Creating a strong, unique password</li>
        <li>Not sharing your password with anyone</li>
        <li>Updating your password regularly</li>
      </ul>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Security Team
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      to: email,
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      subject: 'Reset Your CivicConnect Password',
      html: message
    });

    res.json({ message: 'Reset email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const resetPasswordSectorHead = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const sectorHead = await SectorHead.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!sectorHead) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    sectorHead.password = hashedPassword;
    sectorHead.resetPasswordToken = undefined;
    sectorHead.resetPasswordExpires = undefined;

    await sectorHead.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const htmlMessage = `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-check-circle" style="color: #4d9de0; margin-right: 8px;"></i> Password Successfully Reset
    </h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0;">
      Hello <strong style="color: #ff6b35;">${sectorHead.name}</strong>,
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #ddd; margin-bottom: 25px;">
      Your <strong style="color: #4d9de0;">CivicConnect</strong> credentials have been securely updated.
    </p>

    <!-- Credentials Box -->
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
      <h3 style="color: #4d9de0; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Your Updated Credentials</h3>
      <div style="background: #252525; padding: 15px; border-radius: 6px;">
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Email:</span> <span style="color: #fff;">${sectorHead.email}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Password:</span> <span style="color: #fff;">xxxxx</span></p>
      </div>
    </div>

    <!-- Security Note -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0; margin: 25px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px;">
        <strong style="color: #ff6b35;">Security Recommendation:</strong> 
        Please change this temporary password after logging in by visiting your account settings.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background: linear-gradient(to right, #ff6b35, #ff8c42); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(255,107,53,0.3);">
        Access Your Dashboard
      </a>
    </div>

    <!-- Additional Security Tips -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">Password Best Practices:</h4>
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Use a combination of letters, numbers, and symbols</li>
        <li style="margin-bottom: 8px;">Avoid using personal information or common words</li>
        <li>Consider using a password manager for better security</li>
      </ul>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Security & Compliance Team
    </p>
    <p style="margin: 5px 0 0; color: #666; font-size: 12px;">
      This email was sent to ${sectorHead.email} as part of your account security notifications.
    </p>
  </div>
</div>
`;

    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: sectorHead.email,
      subject: 'Your CivicConnect Password Was Reset',
      html: htmlMessage
    });

    res.json({ message: 'Password reset successful and confirmation email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getSectorHeadDetails = async (req, res) => {
  try {
    const sectorHead = await SectorHead.findById(req.user.id).select("-password");

    if (!sectorHead) {
      return res.status(404).json({ message: "Sector Head not found" });
    }

    res.json(sectorHead);
  } catch (err) {
    console.error("Error fetching sector head details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSectorDashboardSummary = async (req, res) => {
  try {
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }

    const sector = sectorHead.sector;

    // Count issues by status
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      escalatedIssues,
      closedIssues,
      totalCitizens,
      issuesByCategory
    ] = await Promise.all([
      Issue.countDocuments({ sector }),
      Issue.countDocuments({ sector, status: 'Pending' }),
      Issue.countDocuments({ sector, status: 'In Progress' }),
      Issue.countDocuments({ sector, status: 'Resolved' }),
      Issue.countDocuments({ sector, status: 'Escalated' }),
      Issue.countDocuments({ sector, status: 'Closed' }),
      Citizen.countDocuments({ sector }),
      Issue.aggregate([
        { $match: { sector } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    res.status(200).json({
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      escalatedIssues,
      closedIssues,
      totalCitizens,
      issuesByCategory
    });
  } catch (error) {
    console.error('Error fetching sector dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};

export const getAllIssuesInSector = async (req, res) => {
  try {
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }

    const sector = sectorHead.sector;

    const issues = await Issue.find({ sector }).sort({ createdAt: -1 });

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error fetching sector issues:', error);
    res.status(500).json({ message: 'Failed to fetch issues for sector' });
  }
};
export const sendBroadcastEmailSectorHead = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Both subject and message are required' 
      });
    }

    // Get the sector head's details to verify their sector
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ 
        success: false,
        message: 'Sector Head not found' 
      });
    }

    const sector = sectorHead.sector;

    // Find all verified citizens ONLY in the sector head's registered sector
    const citizens = await Citizen.find({
      sector: sector,  // Strictly match the sector head's sector
      isVerified: true,
      email: { $exists: true, $ne: '' } // Ensure email exists and is not empty
    }).select('email name sector');

    // Additional verification that all recipients are in the correct sector
    const invalidRecipients = citizens.filter(c => c.sector !== sector);
    if (invalidRecipients.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Security violation: Attempt to send to citizens outside your sector'
      });
    }

    if (!citizens || citizens.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No verified citizens with valid emails found in your sector' 
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // For development only (remove in production)
      }
    });

    // Prepare email with enhanced security headers
    const mailOptions = {
      from: `"${sectorHead.name} (${sector} Sector Head)" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, 
      bcc: citizens.map(c => c.email), 
      subject: `[${sector}  ${subject}`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-bullhorn" style="color: #4d9de0; margin-right: 8px;"></i> ${subject}
    </h2>
    
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin-bottom: 25px;">
      <p style="font-size: 15px; line-height: 1.6; color: #ddd; margin: 0;">
        ${message.replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- Sender Information -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px; text-align: center;">
        <strong style="color: #ff6b35;">Message from:</strong> ${sectorHead.name}, 
        <strong style="color: #ff6b35;">Sector Head for</strong> ${sector}
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background: linear-gradient(to right, #ff6b35, #ff8c42); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(255,107,53,0.3);">
        View in Dashboard
      </a>
    </div>

    <!-- Additional Information -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">About This Message:</h4>
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">This is an official communication from your Sector Head</li>
        <li style="margin-bottom: 8px;">Please follow any instructions provided in the message</li>
        <li>Contact your Sector Head directly if you need clarification</li>
      </ul>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Community Engagement Platform
    </p>
    <p style="margin: 5px 0 0; color: #666; font-size: 12px;">
      You're receiving this because you're a verified citizen registered in ${sector} sector.
    </p>
  </div>
</div>
      `,
      headers: {
        'X-Sector-Head-ID': sectorHead._id.toString(),
        'X-Sector': sector,
        'X-Broadcast-Type': 'sector-announcement'
      }
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Log the broadcast activity with more details
    const broadcastLog = await BroadcastLog.create({
      senderId: sectorHead._id,
      senderName: sectorHead.name,
      senderRole: 'sectorHead',
      sector: sector,
      subject,
      message,
      recipientCount: citizens.length,
      messageId: info.messageId,
      sentAt: new Date(),
      recipientSectors: [sector], // Enforce single sector
      status: 'completed'
    });

    res.status(200).json({ 
      success: true,
      message: `Broadcast sent to ${citizens.length} citizens in ${sector} sector`,
      logId: broadcastLog._id
    });

  } catch (error) {
    console.error('Error sending sector broadcast:', error);
    
    // Log failed attempt
    if (req.user && req.user._id) {
      await BroadcastLog.create({
        senderId: req.user._id,
        senderRole: 'sectorHead',
        sector: req.user.sector,
        subject: req.body.subject || 'Unknown',
        message: req.body.message || 'Unknown',
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Broadcast Email Sent Successfully',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};
export const getCitizensWithIssuesBySector = async (req, res) => {
  try {
    // Get the sector head's ID from the authenticated request
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ 
        success: false,
        message: 'Sector Head not found' 
      });
    }

    const { sector } = sectorHead;

    // Find all citizens in this sector
    const citizens = await Citizen.find({ 
      sector: sector 
    }).select('-password'); // Exclude password field

    if (!citizens || citizens.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No citizens found in this sector' 
      });
    }

    // For each citizen, find their associated issues
    const citizensWithIssues = await Promise.all(
      citizens.map(async (citizen) => {
        const issues = await Issue.find({ 
          raisedBy: citizen._id 
        }).sort({ createdAt: -1 }); // Sort by newest first

        return {
          ...citizen._doc,
          issues: issues || [],
          totalIssues: issues.length,
          openIssues: issues.filter(i => i.status === 'open').length,
          resolvedIssues: issues.filter(i => i.status === 'closed').length,
          pendingIssues: issues.filter(i => i.status === 'pending').length
        };
      })
    );

    // Sort citizens by total issues (descending)
    citizensWithIssues.sort((a, b) => b.totalIssues - a.totalIssues);

    // Calculate summary statistics for the entire sector
    const totalCitizens = citizensWithIssues.length;
    const totalIssues = citizensWithIssues.reduce((sum, citizen) => sum + citizen.totalIssues, 0);
    const totalOpenIssues = citizensWithIssues.reduce((sum, citizen) => sum + citizen.openIssues, 0);
    const totalResolvedIssues = citizensWithIssues.reduce((sum, citizen) => sum + citizen.resolvedIssues, 0);
    const totalPendingIssues = citizensWithIssues.reduce((sum, citizen) => sum + citizen.pendingIssues, 0);

    res.status(200).json({
      success: true,
      sector,
      summary: {
        totalCitizens,
        totalIssues,
        totalOpenIssues,
        totalResolvedIssues,
        totalPendingIssues,
        resolutionRate: totalIssues > 0 
          ? Math.round((totalResolvedIssues / totalIssues) * 100) 
          : 0
      },
      citizens: citizensWithIssues
    });

  } catch (error) {
    console.error('Error fetching citizens with issues:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch citizens and their issues',
      error: error.message 
    });
  }
};
export const getSectorWiseRatings = async (req, res) => {
  try {
    // 1. Get current sector head
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }

    const sector = sectorHead.sector;

    // 2. Aggregation: Join with citizens and filter by sector
    const ratings = await Feedback.aggregate([
      {
        $lookup: {
          from: "citizens",
          localField: "citizen",
          foreignField: "_id",
          as: "citizenInfo"
        }
      },
      { $unwind: "$citizenInfo" },
      {
        $match: {
          "citizenInfo.sector": sector,
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$citizenInfo.sector",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // Handle empty or missing data
    if (ratings.length === 0) {
      return res.status(200).json({
        sector,
        averageRating: "N/A",
        totalRatings: 0
      });
    }

    const result = {
      sector,
      averageRating: ratings[0].averageRating.toFixed(2),
      totalRatings: ratings[0].totalRatings
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching sector-wise ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
};
