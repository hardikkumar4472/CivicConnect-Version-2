import citizenSchema from '../models/Citizen.js';
import nodemailer from 'nodemailer';
import Issue from '../models/issue.js';
import Citizen from '../models/Citizen.js';
import Feedback from '../models/Feedback.js';
import SectorHead from '../models/SectorHead.js';
import adminSchema from '../models/Admin.js';
import { Parser } from 'json2csv';

export const sendBroadcastEmail = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can send broadcasts' });
    }

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const citizens = await citizenSchema.find({ isVerified: true });
    const emails = citizens.map(citizen => citizen.email);
    const htmlTemplate = `
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
    
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0; margin: 0;">
        ${message.replace(/\n/g, '<br>')}
      </p>
    </div>

    <!-- CTA Button (if needed) -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://civicconnect-nfew.onrender.com" style="background: linear-gradient(to right, #4d9de0, #6bb9f0); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(77,157,224,0.3);">
        Visit CivicConnect
      </a>
    </div>

    <!-- Additional Info -->
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">Need help or have questions?</h4>
      <p style="color: #ddd; font-size: 14px; margin: 8px 0;">
        Contact our support team at <a href="mailto:civicconnectpvt@gmail.com" style="color: #ff6b35; text-decoration: none;">civicconnectpvt@gmail.com</a>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Community Team
    </p>
    <p style="margin: 5px 0 0; color: #666; font-size: 12px;">
      You're receiving this email as a registered member of CivicConnect.
    </p>
  </div>
</div>
`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CivicConnect Admin" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject,
      html: `${htmlTemplate}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Broadcast email sent successfully' });
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    res.status(500).json({ message: 'Failed to send broadcast email' });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    // Step 1: Fetch all issues with citizen details
    const issues = await Issue.find()
      .populate('citizen', 'name email phone sector houseId') // optional, include citizen info
      .sort({ createdAt: -1 }); // latest first

    // Step 2: Count issues by status
    const statusCounts = issues.reduce((acc, issue) => {
      const status = issue.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Step 3: Count total citizens
    const totalCitizens = await Citizen.countDocuments();

    // Step 4: Count total feedbacks
    const totalFeedbacks = await Feedback.countDocuments();

    res.status(200).json({
      totalIssues: issues.length,
      pendingIssues: statusCounts['Pending'] || 0,
      inProgressIssues: statusCounts['In Progress'] || 0,
      resolvedIssues: statusCounts['Resolved'] || 0,
      escalatedIssues: statusCounts['Escalated'] || 0,
      closedIssues: statusCounts['Closed'] || 0,
      totalCitizens,
      totalFeedbacks,
      issues // this is the full array of all issues with citizen info
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};

export const exportAllIssues = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can export issues' });
    }

    const issues = await Issue.find()
      .populate('citizen', 'name email sector houseNumber') 
      .populate('sectorHead', 'name email sector') 
      .lean();

    if (!issues.length) {
      return res.status(404).json({ message: 'No issues found to export' });
    }

    const exportData = issues.map(issue => ({
      IssueID: issue._id,
      Title: issue.title || '',
      Description: issue.description || '',
      Status: issue.status || '',
      Sector: issue.citizen?.sector || issue.sector || '',
      CitizenName: issue.citizen?.name || '',
      CitizenEmail: issue.citizen?.email || '',
      SectorHeadName: issue.sectorHead?.name || '',
      CreatedAt: issue.createdAt,
      UpdatedAt: issue.updatedAt
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(exportData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`all_issues_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting issues:', error);
    res.status(500).json({ message: 'Failed to export issues' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminSchema.findById(req.user.id).select("name email role");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
