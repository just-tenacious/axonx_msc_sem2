import ContactQuery from '../models/ContactQuery.js';

// Create a new inquiry (Public Contact Form)
export const createQuery = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newQuery = new ContactQuery({ name, email, subject, message });
        await newQuery.save();
        res.status(201).json({ success: true, message: 'Institutional inquiry logged successfully', data: newQuery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Retrieve all inquiries (Admin Contact Dashboard)
export const getAllQueries = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        const queries = await ContactQuery.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: queries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update inquiry status (Mark as Responded and Save Response)
export const updateQueryStatus = async (req, res) => {
    try {
        const { status, response } = req.body;
        const updateData = { status };
        if (response) updateData.response = response;

        const query = await ContactQuery.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!query) return res.status(404).json({ success: false, message: 'Contact artifact not found' });
        res.status(200).json({ success: true, message: `Status transitioned to ${status}`, data: query });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
