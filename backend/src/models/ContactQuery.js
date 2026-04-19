import mongoose from 'mongoose';

const contactQuerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Responded'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ContactQuery = mongoose.model('ContactQuery', contactQuerySchema);
export default ContactQuery;