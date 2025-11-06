import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

export default function CustomerJobs({ user, setUser }) {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [showAddJobForm, setShowAddJobForm] = useState(false);
    const [newJobName, setNewJobName] = useState("");
    const [newJobDescription, setNewJobDescription] = useState("");
    const [hover, setHover] = useState(false);
    const [addJobHover, setAddJobHover] = useState(false);
    const [jobHover, setJobHover] = useState(null);

    useEffect(() => {
        if (user?.id && customerId) {
            fetchJobs();
            fetchCustomerName();
        }
    }, [user?.id, customerId]);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/customer/${customerId}/${user.id}`);
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    const fetchCustomerName = async () => {
        try {
            const res = await fetch(`${BASE_URL}/customers/${user.id}`);
            const data = await res.json();
            const customer = data.find(c => c.id === parseInt(customerId));
            setCustomerName(customer?.name || "Customer");
        } catch (err) {
            console.error("Error fetching customer name:", err);
        }
    };

    const handleAddJob = () => {
        setShowAddJobForm(true);
    };

    const handleCloseForm = () => {
        setShowAddJobForm(false);
        setNewJobName("");
        setNewJobDescription("");
    };

    const handleSubmitJob = async (e) => {
        e.preventDefault();
        if (newJobName.trim()) {
            try {
                const res = await fetch(`${BASE_URL}/jobs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        customer_id: parseInt(customerId),
                        name: newJobName.trim(),
                        description: newJobDescription.trim() || null,
                        status: "pending",
                    }),
                });
                const data = await res.json();

                if (res.ok) {
                    const newJob = {
                        id: data.jobId,
                        name: data.name,
                        description: newJobDescription.trim() || null,
                        status: "pending",
                        customer_id: parseInt(customerId),
                        user_id: user.id,
                    };
                    setJobs([newJob, ...jobs]);
                    handleCloseForm();
                } else {
                    console.error("Error adding job:", data.error);
                }
            } catch (err) {
                console.error("Error adding job:", err);
            }
        }
    };

    const handleJobClick = (jobId) => {
        navigate(`/customer/${customerId}/job/${jobId}`);
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
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: 16,
        },
        backButton: {
            appearance: "none",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#111827",
            transition: "background .12s, box-shadow .12s",
        },
        backButtonHover: {
            background: "#f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        },
        title: {
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
            transition: "background .12s, box-shadow .12s",
        },
        logoutBtnHover: {
            background: "#f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        },
        content: {
            padding: 24,
            maxWidth: 1200,
            margin: "0 auto",
        },
        box: {
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        boxTitle: {
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "2px solid #e5e7eb",
        },
        addJobButton: {
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
        addJobButtonHover: {
            background: "#4338ca",
            borderColor: "#4338ca",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
        },
        jobsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
        },
        jobCard: {
            appearance: "none",
            border: "2px solid #e5e7eb",
            background: "#ffffff",
            padding: "20px",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all .15s ease",
            textAlign: "left",
        },
        jobCardHover: {
            background: "#4f46e5",
            borderColor: "#4f46e5",
            color: "#ffffff",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
        },
        jobName: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
        },
        jobDescription: {
            fontSize: 14,
            opacity: 0.8,
            marginBottom: 12,
        },
        jobStatus: {
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: 4,
            display: "inline-block",
        },
        statusPending: {
            background: "#fef3c7",
            color: "#92400e",
        },
        statusInProgress: {
            background: "#dbeafe",
            color: "#1e40af",
        },
        statusCompleted: {
            background: "#d1fae5",
            color: "#065f46",
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 20px",
            color: "#6b7280",
            fontSize: 16,
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
        textarea: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
            minHeight: 100,
            resize: "vertical",
            fontFamily: "inherit",
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
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "in_progress":
                return styles.statusInProgress;
            case "completed":
                return styles.statusCompleted;
            default:
                return styles.statusPending;
        }
    };

    const formatStatus = (status) => {
        return status.replace("_", " ");
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            ...styles.backButton,
                            ...(hover ? styles.backButtonHover : {}),
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        ← Back
                    </button>
                    <div style={styles.title}>
                        {customerName} - Jobs
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setUser(null)}
                    style={styles.logoutBtn}
                >
                    Log out
                </button>
            </header>

            <main style={styles.content}>
                <div style={styles.box}>
                    <h2 style={styles.boxTitle}>Jobs for {customerName}</h2>
                    <button
                        onClick={handleAddJob}
                        style={{
                            ...styles.addJobButton,
                            ...(addJobHover ? styles.addJobButtonHover : {}),
                        }}
                        onMouseEnter={() => setAddJobHover(true)}
                        onMouseLeave={() => setAddJobHover(false)}
                    >
                        <span style={{ fontSize: 20 }}>+</span>
                        Add Job
                    </button>

                    {jobs.length === 0 ? (
                        <div style={styles.emptyState}>
                            No jobs yet. Click "Add Job" to create one!
                        </div>
                    ) : (
                        <div style={styles.jobsGrid}>
                            {jobs.map((job) => (
                                <button
                                    key={job.id}
                                    onClick={() => handleJobClick(job.id)}
                                    style={{
                                        ...styles.jobCard,
                                        ...(jobHover === job.id ? styles.jobCardHover : {}),
                                    }}
                                    onMouseEnter={() => setJobHover(job.id)}
                                    onMouseLeave={() => setJobHover(null)}
                                >
                                    <div style={{
                                        ...styles.jobName,
                                        color: jobHover === job.id ? "#ffffff" : "#111827"
                                    }}>
                                        {job.name}
                                    </div>
                                    {job.description && (
                                        <div style={styles.jobDescription}>
                                            {job.description}
                                        </div>
                                    )}
                                    <span style={{
                                        ...styles.jobStatus,
                                        ...getStatusStyle(job.status),
                                    }}>
                                        {formatStatus(job.status)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Job Modal */}
            {showAddJobForm && (
                <div style={styles.modalOverlay} onClick={handleCloseForm}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Add New Job</h2>
                        <form onSubmit={handleSubmitJob}>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="jobName">
                                    Job Name
                                </label>
                                <input
                                    id="jobName"
                                    type="text"
                                    value={newJobName}
                                    onChange={(e) => setNewJobName(e.target.value)}
                                    style={styles.input}
                                    placeholder="Enter job name"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="jobDescription">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="jobDescription"
                                    value={newJobDescription}
                                    onChange={(e) => setNewJobDescription(e.target.value)}
                                    style={styles.textarea}
                                    placeholder="Enter job description"
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
                                    Add Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

