import Issue from '../models/issue.js';
import Feedback from '../models/Feedback.js';
import SectorHead from '../models/SectorHead.js';

export const getSectorAnalytics = async (req, res) => {
  try {
    const sectorHead = await SectorHead.findById(req.user.id);
    if (!sectorHead) {
      return res.status(404).json({ message: 'Sector Head not found' });
    }
    const sector = sectorHead.sector;
    const issuesByCategory = await Issue.aggregate([
      { $match: { sector } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const mostReported = issuesByCategory.sort((a, b) => b.count - a.count)[0]?._id || 'N/A';
    const resolvedIssues = await Issue.aggregate([
      { $match: { sector, status: 'Closed' } },
      {
        $project: {
          diffInMs: { $subtract: ['$updatedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$diffInMs' }
        }
      }
    ]);

    const avgResolutionTime = resolvedIssues[0]?.avgTime
      ? (resolvedIssues[0].avgTime / (1000 * 60 * 60 * 24)).toFixed(2) + ' days'
      : 'N/A';

    const avgFeedback = await Feedback.aggregate([
      {
        $match: {
          sector,
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const avgRating = avgFeedback[0]?.avgRating?.toFixed(2) || 'N/A';

    res.status(200).json({
      totalIssues: issuesByCategory.reduce((acc, cur) => acc + cur.count, 0),
      issuesByCategory,
      mostReportedCategory: mostReported,
      avgResolutionTime,
      avgFeedbackRating: avgRating
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};
