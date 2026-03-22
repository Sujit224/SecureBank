import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../api/axios';

const TransactionHistory = ({ accountNumber }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/transactions/${accountNumber}/history?page=${currentPage}&limit=${pageSize}`);
                // Check if response has items/total structure (backend pagination)
                if (res.data && res.data.items) {
                    setTransactions(res.data.items);
                    setTotalPages(Math.ceil(res.data.total / pageSize));
                } else if (Array.isArray(res.data)) {
                     // Fallback for non-paginated API (if executed before backend update fully propagates or cached)
                    setTransactions(res.data);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        return `status-badge ${status.toLowerCase()}`;
    };

    const renderPageNumbers = () => {
        const pages = [];
        // Simple pagination logic: show all if <= 7, else show 1...current...last
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        className={`page-number ${currentPage === i ? 'active' : ''}`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                );
            }
        } else {
             // Logic for many pages: 1, ..., current-1, current, current+1, ..., last
             pages.push(
                 <button key={1} className={`page-number ${currentPage === 1 ? 'active' : ''}`} onClick={() => handlePageChange(1)}>1</button>
             );
             
             if (currentPage > 3) {
                 pages.push(<span key="dots1" className="page-number">...</span>);
             }

             const start = Math.max(2, currentPage - 1);
             const end = Math.min(totalPages - 1, currentPage + 1);

             for (let i = start; i <= end; i++) {
                pages.push(
                    <button
                        key={i}
                        className={`page-number ${currentPage === i ? 'active' : ''}`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                );
             }

             if (currentPage < totalPages - 2) {
                pages.push(<span key="dots2" className="page-number">...</span>);
             }

             pages.push(
                 <button key={totalPages} className={`page-number ${currentPage === totalPages ? 'active' : ''}`} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
             );
        }
        return pages;
    };

    return (
        <div className="history-container animate-fade">
            <div className="history-card">
                
                {/* Header */}
                <div className="history-header">
                    <h2 className="history-title">Transaction History</h2>
                    <div className="history-actions">
                        <button className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
                            <Download size={18} style={{ marginRight: '8px' }} />
                            <span>Download as</span>
                            <ChevronDown size={16} style={{ marginLeft: '4px' }} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Account No</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Balance After</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((txn, index) => (
                                    <tr key={index}>
                                        <td style={{ color: 'var(--color-purple)', fontWeight: 500 }}>
                                            #{txn.transaction_id}
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {txn.account_no}
                                        </td>
                                        <td>
                                            {txn.transaction_type}
                                        </td>
                                        <td style={{ 
                                            fontWeight: 700, 
                                            color: (txn.transaction_type === 'DEPOSIT' || txn.transaction_type === 'RECEIVED') 
                                                ? 'var(--color-success)' 
                                                : 'var(--color-danger)'
                                        }}>
                                            {(txn.transaction_type === 'DEPOSIT' || txn.transaction_type === 'RECEIVED') ? '+' : '-'}
                                            ₹{txn.amount.toFixed(2)}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            ₹{txn.balance_after.toFixed(2)}
                                        </td>
                                        <td>
                                           {txn.description}
                                        </td>
                                        <td>
                                            <span className={getStatusClass(txn.status)}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(txn.timestamp).toLocaleString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                 {/* Pagination */}
                 <div className="pagination">
                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    
                    <div className="pagination-numbers">
                        {renderPageNumbers()}
                    </div>

                    <button 
                        className="pagination-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
