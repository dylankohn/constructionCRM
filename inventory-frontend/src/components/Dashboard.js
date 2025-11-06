import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

export default function Dashboard({ user, setUser }) {
    const navigate = useNavigate();
    const [hover, setHover] = useState(false);
    const [customerHover, setCustomerHover] = useState(null);
    const [materialHover, setMaterialHover] = useState(null);
    const [addCustomerHover, setAddCustomerHover] = useState(false);
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);

    // Fetch customers and jobs from database on component mount
    useEffect(() => {
        if (user?.id) {
            fetchCustomers();
            fetchAllJobs();
        }
    }, [user?.id]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/customers/${user.id}`);
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const fetchAllJobs = async () => {
        try {
            // Fetch all customers first
            const customersRes = await fetch(`${BASE_URL}/customers/${user.id}`);
            const customersData = await customersRes.json();
            
            // Fetch jobs for each customer
            const allJobs = [];
            for (const customer of customersData) {
                const jobsRes = await fetch(`${BASE_URL}/jobs/customer/${customer.id}/${user.id}`);
                const jobsData = await jobsRes.json();
                // Add customer info to each job
                jobsData.forEach(job => {
                    allJobs.push({
                        ...job,
                        customerName: customer.name
                    });
                });
            }
            setJobs(allJobs);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            background: "#f5f7fb",
            margin: 0,
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 100,
        },
        welcome: {
            fontSize: 18,
            fontWeight: 600,
            color: "#111827",
        },
        logoutBtn: {
            appearance: "none",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#111827",
            transition: "background .12s, box-shadow .12s, transform .06s",
        },
        logoutBtnHover: {
            background: "#f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        },
        content: {
            padding: 24,
            maxWidth: 1400,
            margin: "0 auto",
        },
        gridContainer: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 24,
        },
        box: {
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            minHeight: 400,
        },
        boxTitle: {
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "2px solid #e5e7eb",
        },
        buttonGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
        },
        actionButton: {
            appearance: "none",
            border: "2px solid #e5e7eb",
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#111827",
            transition: "all .15s ease",
            textAlign: "center",
        },
        actionButtonHover: {
            background: "#4f46e5",
            borderColor: "#4f46e5",
            color: "#ffffff",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
        },
        materialButton: {
            appearance: "none",
            border: "2px solid #e5e7eb",
            background: "#ffffff",
            padding: "20px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            color: "#111827",
            transition: "all .15s ease",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        materialButtonHover: {
            background: "#10b981",
            borderColor: "#10b981",
            color: "#ffffff",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
        },
        addCustomerButton: {
            appearance: "none",
            border: "2px solid #4f46e5",
            background: "#4f46e5",
            padding: "16px 32px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
            transition: "all .15s ease",
            marginBottom: 24,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        addCustomerButtonHover: {
            background: "#4338ca",
            borderColor: "#4338ca",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        },
        modalContent: {
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            width: "90%",
            maxWidth: 500,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 24,
        },
        formGroup: {
            marginBottom: 20,
        },
        label: {
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 8,
        },
        input: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
        },
        inputFocus: {
            borderColor: "#4f46e5",
        },
        buttonGroup: {
            display: "flex",
            gap: 12,
            marginTop: 24,
        },
        submitButton: {
            flex: 1,
            appearance: "none",
            border: "none",
            background: "#4f46e5",
            padding: "12px 24px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
            transition: "background .15s",
        },
        submitButtonHover: {
            background: "#4338ca",
        },
        cancelButton: {
            flex: 1,
            appearance: "none",
            border: "2px solid #e5e7eb",
            background: "#ffffff",
            padding: "12px 24px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#111827",
            transition: "background .15s",
        },
        cancelButtonHover: {
            background: "#f3f4f6",
        },
    };

    const handleCustomerClick = (customerId) => {
        navigate(`/customer/${customerId}/jobs`);
    };

    const handleMaterialClick = (jobId, customerId) => {
        navigate(`/customer/${customerId}/job/${jobId}/materials`);
    };

    const handleAddCustomer = () => {
        setShowAddCustomerForm(true);
    };

    const handleCloseForm = () => {
        setShowAddCustomerForm(false);
        setNewCustomerName("");
    };

    const handleSubmitCustomer = async (e) => {
        e.preventDefault();
        if (newCustomerName.trim()) {
            try {
                const res = await fetch(`${BASE_URL}/customers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        user_id: user.id,
                        name: newCustomerName.trim() 
                    }),
                });
                const data = await res.json();
                
                if (res.ok) {
                    // Add the new customer to the list with the ID from the database
                    const newCustomer = {
                        id: data.customerId,
                        name: data.name,
                        user_id: user.id,
                    };
                    setCustomers([newCustomer, ...customers]);
                    handleCloseForm();
                    // Refresh jobs list in case there are jobs for the new customer
                    fetchAllJobs();
                } else {
                    console.error("Error adding customer:", data.error);
                }
            } catch (err) {
                console.error("Error adding customer:", err);
            }
        }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.welcome}>Welcome, {user?.username || "User"}</div>
                <button
                    type="button"
                    onClick={() => setUser(null)}
                    style={{ ...styles.logoutBtn, ...(hover ? styles.logoutBtnHover : {}) }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    aria-label="Log out"
                >
                    Log out
                </button>
            </header>

            <main style={styles.content}>
                <div style={styles.gridContainer}>
                    {/* Customer Pages Box */}
                    <div style={styles.box}>
                        <h2 style={styles.boxTitle}>Customer Pages</h2>
                        <button
                            onClick={handleAddCustomer}
                            style={{
                                ...styles.addCustomerButton,
                                ...(addCustomerHover ? styles.addCustomerButtonHover : {}),
                            }}
                            onMouseEnter={() => setAddCustomerHover(true)}
                            onMouseLeave={() => setAddCustomerHover(false)}
                        >
                            <span style={{ fontSize: 20 }}>+</span>
                            Add Customer
                        </button>
                        <div style={styles.buttonGrid}>
                            {customers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleCustomerClick(customer.id)}
                                    style={{
                                        ...styles.actionButton,
                                        ...(customerHover === customer.id ? styles.actionButtonHover : {}),
                                    }}
                                    onMouseEnter={() => setCustomerHover(customer.id)}
                                    onMouseLeave={() => setCustomerHover(null)}
                                >
                                    {customer.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Materials Box */}
                    <div style={styles.box}>
                        <h2 style={styles.boxTitle}>Job Materials</h2>
                        <div style={styles.buttonGrid}>
                            {jobs.length === 0 ? (
                                <div style={{ 
                                    gridColumn: "1 / -1", 
                                    textAlign: "center", 
                                    padding: "40px 20px",
                                    color: "#6b7280",
                                    fontSize: 14
                                }}>
                                    No jobs yet. Add a customer and create a job to get started!
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <button
                                        key={job.id}
                                        onClick={() => handleMaterialClick(job.id, job.customer_id)}
                                        style={{
                                            ...styles.materialButton,
                                            ...(materialHover === job.id ? styles.materialButtonHover : {}),
                                        }}
                                        onMouseEnter={() => setMaterialHover(job.id)}
                                        onMouseLeave={() => setMaterialHover(null)}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{job.name}</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>{job.customerName}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Customer Modal */}
            {showAddCustomerForm && (
                <div style={styles.modalOverlay} onClick={handleCloseForm}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Add New Customer</h2>
                        <form onSubmit={handleSubmitCustomer}>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="customerName">
                                    Customer Name
                                </label>
                                <input
                                    id="customerName"
                                    type="text"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    style={styles.input}
                                    placeholder="Enter customer name"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                >
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}