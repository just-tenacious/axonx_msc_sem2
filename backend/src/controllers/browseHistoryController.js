import BrowseHistory from "../models/BrowseHistory.js";

/**
 * Log user activity artifact
 * Triggers when a user navigates to a significant clinical node.
 */
export const logActivity = async (req, res) => {
  try {
    const { userId, title, url, type } = req.body;
    
    if (!userId || !title || !url || !type) {
      return res.status(400).json({ 
        success: false, 
        error: "Activity manifest incomplete: Missing metrics" 
      });
    }

    const history = new BrowseHistory({
      userId,
      title,
      url,
      type
    });

    await history.save();
    res.status(201).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Retrieve user navigation artifacts
 */
export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await BrowseHistory.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(20); // Limit to recent 20 nodes
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  logActivity,
  getUserHistory
};
