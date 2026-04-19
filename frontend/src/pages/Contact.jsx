import React, { useState } from 'react';
import { 
    Mail, Phone, MapPin
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        inquiryType: 'General Support',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.email || !formData.message) {
            toast.error("Please provide required fields");
            return;
        }

        try {
            setLoading(true);
            const name = `${formData.firstName} ${formData.lastName}`.trim();
            const payload = {
                name,
                email: formData.email,
                subject: formData.inquiryType,
                message: formData.message
            };
            const { data } = await axios.post(`${BASE_URL}/support/queries`, payload);
            if (data.success) {
                toast.success("Inquiry submitted successfully");
                setFormData({ firstName: '', lastName: '', email: '', inquiryType: 'General Support', message: '' });
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to submit inquiry.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 px-4 font-sans text-slate-800">
            <div className="max-w-[1000px] mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1e293b]">
                        Get in <span className="text-[#14b8a6]">Touch</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-[#64748b] text-[0.95rem] font-medium leading-relaxed">
                        Whether you're a medical institution looking to partner, or a practitioner needing support, our team is here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
                    
                    {/* Left Column: Form Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <h2 className="text-xl font-bold text-[#1e293b] mb-8">Send us a message</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.7rem] font-bold text-[#475569]">First Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John" 
                                        className="w-full px-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ring-[#14b8a6]/20 transition-all text-sm placeholder:text-slate-400 text-slate-700"
                                        value={formData.firstName}
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.7rem] font-bold text-[#475569]">Last Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Doe" 
                                        className="w-full px-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ring-[#14b8a6]/20 transition-all text-sm placeholder:text-slate-400 text-slate-700"
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[0.7rem] font-bold text-[#475569]">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="john.doe@hospital.com" 
                                    className="w-full px-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ring-[#14b8a6]/20 transition-all text-sm placeholder:text-slate-400 text-slate-700"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[0.7rem] font-bold text-[#475569]">Inquiry Type</label>
                                <input 
                                    type="text" 
                                    placeholder="General Support" 
                                    className="w-full px-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ring-[#14b8a6]/20 transition-all text-sm placeholder:text-slate-700 text-slate-700"
                                    value={formData.inquiryType}
                                    onChange={e => setFormData({...formData, inquiryType: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[0.7rem] font-bold text-[#475569]">Message</label>
                                <textarea 
                                    rows="4" 
                                    placeholder="How can we help you?" 
                                    className="w-full px-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ring-[#14b8a6]/20 transition-all resize-none text-sm placeholder:text-slate-400 text-slate-700"
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3.5 mt-2 bg-[#14b8a6] text-white rounded-xl font-bold text-[0.8rem] hover:bg-[#0f766e] transition-colors"
                            >
                                {loading ? "Submitting..." : "Submit Inquiry"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Contact Detail Cards */}
                    <div className="space-y-5">
                        {/* Headquarters */}
                        <div className="bg-[#f0f7ff] p-7 rounded-[20px] flex items-start gap-4 border border-[#e0effe]/50 text-left">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <MapPin size={14} className="text-[#f43f5e]" />
                            </div>
                            <div>
                                <h3 className="text-[0.95rem] font-bold text-[#0f172a] mb-1.5">Our Headquarters</h3>
                                <p className="text-[0.8rem] text-[#475569] leading-relaxed">
                                    123 Healthway Boulevard<br/>
                                    Suite 400, Future Plaza<br/>
                                    Sample City, ST 12345<br/>
                                    Generic Country
                                </p>
                            </div>
                        </div>

                        {/* Email Directory */}
                        <div className="bg-[#f0fdf4] p-7 rounded-[20px] flex items-start gap-4 border border-[#dcfce7]/50 text-left">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <Mail size={14} className="text-[#a855f7]" />
                            </div>
                            <div className="w-full">
                                <h3 className="text-[0.95rem] font-bold text-[#0f172a] mb-3">Email Directory</h3>
                                <div className="space-y-2.5 text-[0.8rem] text-[#64748b] w-full">
                                    <div className="flex items-center"><span className="w-[100px]">Support:</span><span className="font-bold text-[#334155]">support@axonx.in</span></div>
                                    <div className="flex items-center"><span className="w-[100px]">Partnerships:</span><span className="font-bold text-[#334155]">partners@axonx.in</span></div>
                                    <div className="flex items-center"><span className="w-[100px]">Press:</span><span className="font-bold text-[#334155]">media@axonx.in</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Lines */}
                        <div className="bg-[#f5f3ff] p-7 rounded-[20px] flex items-start gap-4 border border-[#ede9fe]/50 text-left">
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                <Phone size={14} className="text-[#f43f5e]" />
                            </div>
                            <div>
                                <h3 className="text-[0.95rem] font-bold text-[#0f172a] mb-1.5">Phone Lines</h3>
                                <p className="text-[0.8rem] text-[#475569] mb-3 leading-relaxed">
                                    Our support lines are open Monday to Friday, 9:00 AM -<br className="hidden sm:block"/> 6:00 PM IST.
                                </p>
                                <p className="text-[0.85rem] font-bold text-[#334155] tracking-wide">+91 80 4123 5678</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
