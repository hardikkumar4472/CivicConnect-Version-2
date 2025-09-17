import Issue from '../models/issue.js';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { Parser } from 'json2csv';
import SectorHead from '../models/SectorHead.js';
import Feedback from '../models/Feedback.js';

export const reportIssue = async (req, res) => {
  try {
    const { category, description, imageUrl, latitude, longitude } = req.body;
    const citizen = req.citizen;
    let address = '';
    if (latitude && longitude) {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json'
        },
        headers: {
          'User-Agent': 'CivicConnect/1.0 (civicconnectpvt@gmail.com)'
        }
      });
      address = response.data.display_name || 'Address not found';
    }
    const newIssue = new Issue({
      citizen: citizen._id,
      sector: citizen.sector,
      houseId: citizen.houseId,
      category,
      description,
      imageUrl,
      latitude,
      longitude,
      address
    });

    await newIssue.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  layout: "portrait",
  bufferPages: true
});
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      await transporter.sendMail({
        from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
        to: citizen.email,
        subject: 'Issue Report Receipt - CivicConnect',
        html: `<p><div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <!-- Header with image -->
  <div style="background: #1a1a1a; text-align: center; padding: 20px 0;">
    <img src="https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg" alt="CivicConnect Header" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>

  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="text-align: center; color: #4d9de0; margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <i class="fas fa-check-circle" style="color: #4d9de0; margin-right: 8px;"></i> Issue Reported Successfully
    </h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #f0f0f0;">
      Dear <strong style="color: #ff6b35;">${citizen.name}</strong>,
    </p>
    
    <p style="font-size: 15px; line-height: 1.6; color: #ddd; margin-bottom: 25px;">
      Your issue has been reported successfully to the authorities. Our team will review it shortly and take appropriate action.
    </p>

    <!-- Receipt Box -->
    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 25px 0;">
      <h3 style="color: #4d9de0; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Your Issue Receipt</h3>
      <div style="background: #252525; padding: 15px; border-radius: 6px;">
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Reference ID:</span> <span style="color: #fff;">${(`CC-${Date.now().toString().slice(-6)}`)}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Date Reported:</span> <span style="color: #fff;">${new Date().toLocaleString()}</span></p>
        <p style="margin: 10px 0;"><span style="color: #ff6b35; font-weight: bold;">Status:</span> <span style="color: #4d9de0;">Under Review</span></p>
      </div>
    </div>

    <!-- Next Steps Note -->
    <div style="background: rgba(77, 157, 224, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4d9de0; margin: 25px 0;">
      <p style="margin: 0; color: #aaa; font-size: 14px;">
        <strong style="color: #ff6b35;">Next Steps:</strong> 
        You'll receive updates on your issue via email. You can also check status in your CivicConnect dashboard.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background: linear-gradient(to right, #ff6b35, #ff8c42); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; transition: all 0.3s; box-shadow: 0 2px 10px rgba(255,107,53,0.3);">
        View Your Issues
      </a>
    </div>

    <!-- Additional Info -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #333;">
      <h4 style="color: #4d9de0; margin-bottom: 12px; font-size: 16px;">Need Help?</h4>
      <ul style="color: #ddd; font-size: 14px; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Contact support at civicconnectpvt@gmail.com</li>
        <li style="margin-bottom: 8px;">Visit our FAQ section for common questions</li>
        <li>Check our response time guidelines for different issue types</li>
      </ul>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #333;">
    <p style="margin: 0; color: #aaa; font-size: 13px;">
      &copy; ${new Date().getFullYear()} <span style="color: #4d9de0;">CivicConnect</span> | Citizen Support System
    </p>
  </div>
</div>`,
        attachments: [
          {
            filename: `CivicConnect-Issue-${newIssue._id}.pdf`,
            content: pdfBuffer
          }
        ]
      });
      res.status(201).json({
        message: 'Issue reported successfully',
        issue: newIssue
      });
    });




// Colors
const primaryColor = "#4d9de0";
const accentColor = "#ff6b35";
const textColor = "#f0f0f0";
const blackBg = "#000000";

// Set black background for all pages
doc.on('pageAdded', () => {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(blackBg);
});

// Initial page background
doc.rect(0, 0, doc.page.width, doc.page.height).fill(blackBg);

// Add CivicConnect header image
// const imageUrll = 'https://i.ibb.co/WWMvn2mY/civic-connect-header.jpg';
// const imageX = 50;
// const imageY = 40;
// const imageWidth = doc.page.width - 100;

// doc.image('assets/image.png', imageX, imageY, { 
//   width: imageWidth,
//   cover: [imageWidth, 60] // Maintain aspect ratio
// });
doc.fontSize(24)
   .fill(primaryColor)
   .font('Helvetica-Bold')
   .text('ISSUE REPORT RECEIPT', 50, 110, { align: 'center' });

doc.moveTo(50, 140)
   .lineTo(doc.page.width - 50, 140)
   .lineWidth(2)
   .stroke(accentColor);

doc.fontSize(12)
   .fill(textColor)
   .font('Helvetica')
   .text('ISSUE DETAILS', 50, 160, { underline: true });

doc.roundedRect(50, 180, doc.page.width - 100, 120, 8)
   .fill('#1a1a1a')
   .stroke(primaryColor);

doc.fontSize(14)
   .fill(accentColor)
   .text('Reference Number:', 60, 190)
   .fill(textColor)
   .text(`CC-${Date.now().toString().slice(-6)}`);

doc.fontSize(12)
   .fill(accentColor)
   .text('Date Reported:', 60, 215)
   .fill(textColor)
   .text(new Date().toLocaleString(), 180, 215)
   .fill(accentColor)
   .text('Status:', 60, 235)
   .fill(primaryColor)
   .font('Helvetica-Bold')
   .text('Under Review', 180, 235);

// Citizen information section
doc.fontSize(12)
   .fill(textColor)
   .font('Helvetica')
   .text('CITIZEN INFORMATION', 50, 320, { underline: true });

const citizenInfo = [
  { label: 'Name:', value: citizen.name },
  { label: 'Email:', value: citizen.email },
  { label: 'Sector:', value: citizen.sector },
  { label: 'House ID:', value: citizen.houseId }
];

let y = 340;
citizenInfo.forEach(info => {
  doc.fill(accentColor).text(info.label, 60, y);
  doc.fill(textColor).text(info.value, 180, y);
  y += 20;
});

// Issue details section
doc.fontSize(12)
   .fill(textColor)
   .text('ISSUE DESCRIPTION', 50, 420, { underline: true });

const issueDetails = [
  { label: 'Category:', value: category },
  { label: 'Description:', value: description },
  { label: 'Location:', value: address }
];

y = 440;
issueDetails.forEach(detail => {
  doc.fill(accentColor).text(detail.label, 60, y);
  
  if (detail.label === 'Description:') {
    doc.fill(textColor)
       .text(detail.value, 180, y, { 
         width: doc.page.width - 230,
         lineGap: 5
       });
    y += doc.heightOfString(detail.value, { width: doc.page.width - 230 }) + 10;
  } else {
    doc.fill(textColor).text(detail.value, 180, y);
    y += 20;
  }
});

// Footer
doc.fontSize(10)
   .fill('#666')
   .text('This is an official receipt from CivicConnect', 50, doc.page.height - 60, { 
     align: 'center',
     width: doc.page.width - 100
   })
   .text(`© ${new Date().getFullYear()} CivicConnect | All rights reserved`, 50, doc.page.height - 40, { 
     align: 'center',
     width: doc.page.width - 100
   });

// Finalize the PDF
doc.end();

  } catch (err) {
    console.error('Error reporting issue:', err);
    res.status(500).json({ message: 'Server error while reporting issue' });
  }
};


export const getMyIssues = async (req, res) => {
  try {
    const citizenId = req.citizen._id;
    const issues = await Issue.find({ citizen: citizenId }).sort({ createdAt: -1 });
    
    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error fetching citizen issues:', error);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
};

export const getSectorIssues = async (req, res) => {
  try {
    const sector = req.sectorHead.sector;

    const issues = await Issue.find({ sector })
      .sort({ createdAt: -1 })
      .populate('citizen', 'name email houseId')
      .select('-__v'); // Exclude version key but include comments

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error fetching sector issues:', error);
    res.status(500).json({ message: 'Server error while fetching sector issues' });
  }
};


export const forceCloseIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = req.sectorHead.sector;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.sector !== sector) {
      return res.status(403).json({ message: 'Unauthorized: Issue is outside your sector' });
    }

    if (issue.status === 'Closed') {
      return res.status(400).json({ message: 'Issue is already closed' });
    }

    issue.status = 'Closed';
    await issue.save();

    res.status(200).json({ message: 'Issue closed successfully', issue });
  } catch (err) {
    console.error('Error closing issue:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const exportIssues = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Build query based on optional filters
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const issues = await Issue.find(query).populate('citizen', 'name email').lean();

    if (!issues.length) {
      return res.status(404).json({ message: 'No issues found for export' });
    }

    const fields = [
      { label: 'Reference Number', value: 'referenceNumber' },
      { label: 'Category', value: 'category' },
      { label: 'Description', value: 'description' },
      { label: 'Status', value: 'status' },
      { label: 'Citizen Name', value: 'citizen.name' },
      { label: 'Citizen Email', value: 'citizen.email' },
      { label: 'Sector', value: 'sector' },
      { label: 'Created At', value: row => new Date(row.createdAt).toLocaleString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(issues);

    res.header('Content-Type', 'text/csv');
    res.attachment('civicconnect-issues.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting issues:', error);
    res.status(500).json({ message: 'Failed to export issues' });
  }
};



export const getCitizenIssues = async (req, res) => {
  try {
    const citizenId = req.citizen._id;

    // Fetch issues for this citizen
    const issues = await Issue.find({ citizen: citizenId }).sort({ createdAt: -1 });

    // For each issue, check if feedback exists
    const issuesWithFeedback = await Promise.all(
      issues.map(async (issue) => {
        const feedback = await Feedback.findOne({ citizen: citizenId, issue: issue._id });
        return {
          ...issue.toObject(),
          hasFeedback: !!feedback, // true if feedback exists
        };
      })
    );

    res.json(issuesWithFeedback);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues", error: error.message });
  }
};


export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('citizen', 'name email phone');

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Server error while updating issue status' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const sectorHeadID = req.user?.id; // from auth middleware

    if (!sectorHeadID) {
      return res.status(401).json({ message: 'Unauthorized - Sector Head not authenticated' });
    }

    const sectorHead = await SectorHead.findById(sectorHeadID);
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // ✅ Push comment with required fields
    issue.comments.push({
      text,
      author: sectorHead.name,       // string (name or email works)
      authorType: 'Sector Head',     // must match enum
      createdAt: new Date()
    });

    await issue.save();

    res.status(200).json({ message: "Comment added successfully", issue });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};
