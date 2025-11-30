import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

export default function JobDetails({ user, setUser }) {
    const { jobId, customerId } = useParams();
    const navigate = useNavigate();
    
    const [job, setJob] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedJob, setEditedJob] = useState({});
    const [loading, setLoading] = useState(true);
    const [saveHover, setSaveHover] = useState(false);
    const [cancelHover, setCancelHover] = useState(false);
    const [editHover, setEditHover] = useState(false);
    const [materialsHover, setMaterialsHover] = useState(false);
    const [savedAreas, setSavedAreas] = useState([]);
    const [hoveredArea, setHoveredArea] = useState(null);
    const [toolHover, setToolHover] = useState(false);

    useEffect(() => {
        if (user?.id && jobId) {
            fetchJobDetails();
            fetchCustomerName();
            fetchSavedAreas();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`);
            const data = await res.json();
            setJob(data);
            setEditedJob(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching job details:", err);
            setLoading(false);
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

    const fetchSavedAreas = async () => {
        try {
            const res = await fetch(`${BASE_URL}/areas/job/${jobId}/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setSavedAreas(data);
            }
        } catch (err) {
            console.error("Error fetching saved areas:", err);
        }
    };

    const handleDeleteArea = async (areaId) => {
        if (!window.confirm("Are you sure you want to delete this area?")) {
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/areas/${areaId}/${user.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchSavedAreas(); // Refresh the list
            } else {
                alert("Failed to delete area");
            }
        } catch (err) {
            console.error("Error deleting area:", err);
            alert("Error deleting area");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedJob(job);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedJob),
            });

            if (res.ok) {
                setJob(editedJob);
                setIsEditing(false);
            } else {
                console.error("Error updating job");
            }
        } catch (err) {
            console.error("Error updating job:", err);
        }
    };

    const handleChange = (field, value) => {
        setEditedJob({ ...editedJob, [field]: value });
    };

    const handleToolClick = () => {
        navigate('/tools/AreaCalculator');
    };

    const styles = {
        page: {
            minHeight: "100vh",
            fontFamily: "'DM Sans', sans-serif",
            background: "#f5f7fb",
            margin: 0,
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: "#234848",
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
            border: "1px solid #99CFCE",
            background: "transparent",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#99CFCE",
            transition: "background .12s",
        },
        title: {
            fontSize: 18,
            fontWeight: 600,
            color: "#ffffff",
        },
        headerRight: {
            display: "flex",
            gap: 12,
            alignItems: "center",
        },
        editButton: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#4DA3A2",
            background: "#ffffff",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#4DA3A2",
            transition: "all .15s",
        },
        editButtonHover: {
            background: "#4DA3A2",
            borderColor: "#4DA3A2",
            color: "#ffffff",
        },
        saveButton: {
            appearance: "none",
            border: "none",
            background: "#4DA3A2",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            transition: "background .15s",
        },
        saveButtonHover: {
            background: "#3d8a89",
        },
        cancelButton: {
            appearance: "none",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            background: "#ffffff",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#0F1F1F",
            transition: "all .15s",
        },
        cancelButtonHover: {
            background: "#f3f4f6",
            borderColor: "#99CFCE",
        },
        materialsButton: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#4DA3A2",
            background: "#ffffff",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#4DA3A2",
            transition: "all .15s",
        },
        materialsButtonHover: {
            background: "#4DA3A2",
            borderColor: "#4DA3A2",
            color: "#ffffff",
        },
        toolButton: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#4DA3A2",
            background: "#4DA3A2",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
            transition: "all .15s ease",
            marginBottom: 24,
            width: "25%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        toolButtonHover: {
            background: "#3d8a89",
            borderColor: "#4DA3A2",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(77, 163, 162, 0.4)",
        },
        logoutBtn: {
            appearance: "none",
            border: "1px solid #99CFCE",
            background: "transparent",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#99CFCE",
            transition: "background .12s",
        },
        content: {
            padding: 24,
            maxWidth: 1200,
            margin: "0 auto",
        },
        grid: {
            display: "grid",
            gap: 24,
        },
        section: {
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 700,
            color: "#0F1F1F",
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: "2px solid #99CFCE",
        },
        fieldGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
        },
        field: {
            marginBottom: 0,
        },
        label: {
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#234848",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        value: {
            fontSize: 16,
            color: "#0F1F1F",
            padding: "8px 0",
        },
        input: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
        },
        textarea: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
            minHeight: 100,
            resize: "vertical",
            fontFamily: "inherit",
        },
        select: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
            background: "#ffffff",
            cursor: "pointer",
        },
        statusBadge: {
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            textTransform: "capitalize",
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
        statusCancelled: {
            background: "#fee2e2",
            color: "#991b1b",
        },
        fullWidth: {
            gridColumn: "1 / -1",
        },
        areasGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 16,
        },
        areaCard: {
            background: "#f9fafb",
            padding: 16,
            borderRadius: 8,
            border: "2px solid #99CFCE",
            position: "relative",
            cursor: "pointer",
            transition: "all .15s ease",
        },
        areaCardHover: {
            background: "#E8F5F4",
            borderColor: "#4DA3A2",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(77, 163, 162, 0.2)",
        },
        areaCardName: {
            fontSize: 16,
            fontWeight: 600,
            color: "#0F1F1F",
            marginBottom: 8,
        },
        areaCardValue: {
            fontSize: 24,
            fontWeight: 700,
            color: "#4DA3A2",
            marginBottom: 4,
        },
        areaCardUnit: {
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 8,
        },
        areaCardDate: {
            fontSize: 12,
            color: "#6b7280",
        },
        deleteAreaButton: {
            position: "absolute",
            top: 8,
            right: 8,
            appearance: "none",
            border: "none",
            background: "transparent",
            color: "#991b1b",
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
            lineHeight: 1,
        },
        emptyAreas: {
            textAlign: "center",
            padding: 32,
            color: "#6b7280",
            fontSize: 14,
        },
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "in_progress":
                return styles.statusInProgress;
            case "completed":
                return styles.statusCompleted;
            case "cancelled":
                return styles.statusCancelled;
            default:
                return styles.statusPending;
        }
    };

    const formatCurrency = (value) => {
        if (!value) return "Not set";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ ...styles.page, display: "flex", justifyContent: "center", alignItems: "center" }}>
                Loading...
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{ ...styles.page, display: "flex", justifyContent: "center", alignItems: "center" }}>
                Job not found
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate(-1)}
                        style={styles.backButton}
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => navigate(`../`)}
                        style={styles.backButton}
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                        >
                            <path d="M12 3l9 8h-3v9h-12v-9h-3l9-8z" />
                        </svg>
                    </button>
                    <div style={styles.title}>{job.name}</div>
                </div>
                <div style={styles.headerRight}>
                    <button
                        onClick={() => navigate(`/customer/${customerId}/job/${jobId}/materials`)}
                        style={{
                            ...styles.materialsButton,
                            ...(materialsHover ? styles.materialsButtonHover : {}),
                        }}
                        onMouseEnter={() => setMaterialsHover(true)}
                        onMouseLeave={() => setMaterialsHover(false)}
                    >
                        📦 Materials
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            style={{
                                ...styles.editButton,
                                ...(editHover ? styles.editButtonHover : {}),
                            }}
                            onMouseEnter={() => setEditHover(true)}
                            onMouseLeave={() => setEditHover(false)}
                        >
                            Edit Job
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                style={{
                                    ...styles.cancelButton,
                                    ...(cancelHover ? styles.cancelButtonHover : {}),
                                }}
                                onMouseEnter={() => setCancelHover(true)}
                                onMouseLeave={() => setCancelHover(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    ...styles.saveButton,
                                    ...(saveHover ? styles.saveButtonHover : {}),
                                }}
                                onMouseEnter={() => setSaveHover(true)}
                                onMouseLeave={() => setSaveHover(false)}
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setUser(null)}
                        style={styles.logoutBtn}
                    >
                        Log out
                    </button>
                </div>
            </header>

            <main style={styles.content}>
                <div style={styles.grid}>
                    {/* Basic Information */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Basic Information</h2>
                        <div style={styles.fieldGrid}>
                            <div style={styles.field}>
                                <label style={styles.label}>Customer</label>
                                <div style={styles.value}>{customerName}</div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Status</label>
                                {isEditing ? (
                                    <select
                                        value={editedJob.status || "pending"}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                ) : (
                                    <span style={{ ...styles.statusBadge, ...getStatusStyle(job.status) }}>
                                        {job.status ? job.status.replace("_", " ") : "pending"}
                                    </span>
                                )}
                            </div>
                            <div style={{ ...styles.field, ...styles.fullWidth }}>
                                <label style={styles.label}>Description</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedJob.description || ""}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Job description"
                                    />
                                ) : (
                                    <div style={styles.value}>{job.description || "No description"}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedJob.address || ""}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Enter address"
                                    />
                                ) : (
                                    <div style={styles.value}>{job.address || "No address"}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Financial Information</h2>
                        <div style={styles.fieldGrid}>
                            <div style={styles.field}>
                                <label style={styles.label}>Quote Amount</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editedJob.quote_amount || ""}
                                        onChange={(e) => handleChange("quote_amount", e.target.value)}
                                        style={styles.input}
                                        placeholder="0.00"
                                    />
                                ) : (
                                    <div style={styles.value}>{formatCurrency(job.quote_amount)}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Budget</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editedJob.budget || ""}
                                        onChange={(e) => handleChange("budget", e.target.value)}
                                        style={styles.input}
                                        placeholder="0.00"
                                    />
                                ) : (
                                    <div style={styles.value}>{formatCurrency(job.budget)}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Actual Cost</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editedJob.actual_cost || ""}
                                        onChange={(e) => handleChange("actual_cost", e.target.value)}
                                        style={styles.input}
                                        placeholder="0.00"
                                    />
                                ) : (
                                    <div style={styles.value}>{formatCurrency(job.actual_cost)}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Payment Status</label>
                                {isEditing ? (
                                    <select
                                        value={editedJob.payment_status || "not_started"}
                                        onChange={(e) => handleChange("payment_status", e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="not_started">Not Started</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                ) : (
                                    <div style={styles.value}>
                                        {job.payment_status ? job.payment_status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not Started"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Timeline</h2>
                        <div style={styles.fieldGrid}>
                            <div style={styles.field}>
                                <label style={styles.label}>Start Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedJob.start_date || ""}
                                        onChange={(e) => handleChange("start_date", e.target.value)}
                                        style={styles.input}
                                    />
                                ) : (
                                    <div style={styles.value}>{formatDate(job.start_date)}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Estimated Completion</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedJob.estimated_completion || ""}
                                        onChange={(e) => handleChange("estimated_completion", e.target.value)}
                                        style={styles.input}
                                    />
                                ) : (
                                    <div style={styles.value}>{formatDate(job.estimated_completion)}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>End Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedJob.end_date || ""}
                                        onChange={(e) => handleChange("end_date", e.target.value)}
                                        style={styles.input}
                                    />
                                ) : (
                                    <div style={styles.value}>{formatDate(job.end_date)}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location & Contact */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Location & Contact</h2>
                        <div style={styles.fieldGrid}>
                            <div style={{ ...styles.field, ...styles.fullWidth }}>
                                <label style={styles.label}>Job Site Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedJob.job_site_address || ""}
                                        onChange={(e) => handleChange("job_site_address", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Enter job site address"
                                    />
                                ) : (
                                    <div style={styles.value}>{job.job_site_address || "Not provided"}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Contact Person</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedJob.contact_person || ""}
                                        onChange={(e) => handleChange("contact_person", e.target.value)}
                                        style={styles.input}
                                        placeholder="Contact name"
                                    />
                                ) : (
                                    <div style={styles.value}>{job.contact_person || "Not provided"}</div>
                                )}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Contact Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedJob.contact_phone || ""}
                                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                                        style={styles.input}
                                        placeholder="Phone number"
                                    />
                                ) : (
                                    <div style={styles.value}>{job.contact_phone || "Not provided"}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Planning & Notes */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Planning & Notes</h2>
                        <div style={styles.fieldGrid}>
                            <div style={{ ...styles.field, ...styles.fullWidth }}>
                                <label style={styles.label}>Planning Notes</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedJob.planning_notes || ""}
                                        onChange={(e) => handleChange("planning_notes", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Enter planning notes, schedules, requirements..."
                                    />
                                ) : (
                                    <div style={styles.value}>{job.planning_notes || "No planning notes"}</div>
                                )}
                            </div>
                            <div style={{ ...styles.field, ...styles.fullWidth }}>
                                <label style={styles.label}>Materials Notes</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedJob.materials_notes || ""}
                                        onChange={(e) => handleChange("materials_notes", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Enter materials needed, inventory notes..."
                                    />
                                ) : (
                                    <div style={styles.value}>{job.materials_notes || "No materials notes"}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Saved Areas Section */}
                    <div style={styles.section}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ ...styles.sectionTitle, marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
                                Calculated Areas
                            </h2>
                            <button 
                                onClick={handleToolClick}
                                style={{
                                    ...styles.toolButton, 
                                    ...(toolHover ? styles.toolButtonHover : {}),
                                }}
                                onMouseEnter={() => setToolHover(true)}
                                onMouseLeave={() => setToolHover(false)}
                            >
                                Area Calculator
                            </button>
                        </div>
                        {savedAreas.length > 0 ? (
                            <div style={styles.areasGrid}>
                                {savedAreas.map((area) => (
                                    <div 
                                        key={area.id} 
                                        style={{
                                            ...styles.areaCard,
                                            ...(hoveredArea === area.id ? styles.areaCardHover : {}),
                                        }}
                                        onClick={() => {
                                            // Parse shape_data if it's a string
                                            const shapeData = typeof area.shape_data === 'string' 
                                                ? JSON.parse(area.shape_data) 
                                                : area.shape_data;
                                            
                                            navigate('/tools/AreaCalculator', {
                                                state: {
                                                    areaData: {
                                                        ...area,
                                                        shape_data: shapeData
                                                    }
                                                }
                                            });
                                        }}
                                        onMouseEnter={() => setHoveredArea(area.id)}
                                        onMouseLeave={() => setHoveredArea(null)}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteArea(area.id);
                                            }}
                                            style={styles.deleteAreaButton}
                                            title="Delete area"
                                        >
                                            ✕
                                        </button>
                                        <div style={styles.areaCardName}>{area.area_name}</div>
                                        <div style={styles.areaCardValue}>
                                            {parseFloat(area.area_value).toFixed(2)}
                                        </div>
                                        <div style={styles.areaCardUnit}>{area.unit}</div>
                                        <div style={styles.areaCardDate}>
                                            {new Date(area.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyAreas}>
                                No areas calculated yet. Use the Area Calculator tool to add measurements.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

