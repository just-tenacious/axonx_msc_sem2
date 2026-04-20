import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standardized Admin Pagination Component
 * Used across all administrative tables for consistent UX.
 */
const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
}) => {
    if (totalPages <= 1) return null;

    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[0.62rem] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                Registry Coverage: <span className="text-blue-500">{startItem} - {endItem}</span> of {totalItems} entries
            </p>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                >
                    <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1.5 px-1">
                    {/* Show limited pages if too many, but for now keeping it simple as per existing designs */}
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-9 h-9 rounded-xl font-black text-[0.65rem] transition-all ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white shadow-lg scale-110' 
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-100'
                            }`}
                        >
                            {(i + 1).toString().padStart(2, '0')}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
