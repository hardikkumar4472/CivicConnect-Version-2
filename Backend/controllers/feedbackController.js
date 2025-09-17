import Feedback from '../models/Feedback.js';
import Issue from '../models/issue.js';
export const submitFeedback = async (req, res) => {
  try {
    const citizenId = req.citizen._id;
    const { issueId, rating, comment } = req.body;

    // Check if the issue belongs to the citizen
    const issue = await Issue.findById(issueId);
    if (!issue || issue.citizen.toString() !== citizenId.toString()) {
      return res.status(403).json({ message: "Not authorized to give feedback" });
    }

    // Save feedback
    const feedback = new Feedback({ issue: issueId, citizen: citizenId, rating, comment });
    await feedback.save();
    await Issue.findByIdAndDelete(issueId);

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSectorWiseRatings = async (req, res) => {
  try {
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
        $group: {
          _id: "$citizenInfo.sector",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching sector-wise ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
};