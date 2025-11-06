import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

export default function JobMaterials({ user, setUser }) {
    const { jobId, customerId } = useParams();
    const navigate = useNavigate();
    
    const [materials, setMaterials] = useState([]);
    const [jobName, setJobName] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [formData, setFormData] = useState({
        material_name: "",
        description: "",
        quantity: "",
        unit: "",
        unit_cost: "",
        status: "needed",
        location: "",
        supplier: "",
        order_date: "",
        expected_delivery: "",
        actual_delivery: "",
        notes: ""
    });
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        if (user?.id && jobId) {
            fetchMaterials();
            fetchJobName();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, jobId]);

    useEffect(() => {
        // Calculate total cost whenever materials change
        const total = materials.reduce((sum, material) => sum + (parseFloat(material.total_cost) || 0), 0);
        setTotalCost(total);
    }, [materials]);

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`${BASE_URL}/materials/job/${jobId}/${user.id}`);
            const data = await res.json();
            setMaterials(data);
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    };

    const fetchJobName = async () => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`);
            const data = await res.json();
            setJobName(data.name || "Job");
        } catch (err) {
            console.error("Error fetching job name:", err);
        }
    };

    const resetForm = () => {
        setFormData({
            material_name: "",
            description: "",
            quantity: "",
            unit: "",
            unit_cost: "",
            status: "needed",
            location: "",
            supplier: "",
            order_date: "",
            expected_delivery: "",
            actual_delivery: "",
            notes: ""
        });
        setEditingMaterial(null);
    };

    const handleAdd = () => {
        resetForm();
        setShowAddForm(true);
    };

    const handleEdit = (material) => {
        setFormData({
            material_name: material.material_name,
            description: material.description || "",
            quantity: material.quantity || "",
            unit: material.unit || "",
            unit_cost: material.unit_cost || "",
            status: material.status || "needed",
            location: material.location || "",
            supplier: material.supplier || "",
            order_date: material.order_date || "",
            expected_delivery: material.expected_delivery || "",
            actual_delivery: material.actual_delivery || "",
            notes: material.notes || ""
        });
        setEditingMaterial(material);
        setShowAddForm(true);
    };

    const handleClose = () => {
        setShowAddForm(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            user_id: user.id,
            job_id: parseInt(jobId),
            customer_id: parseInt(customerId),
        };

        try {
            if (editingMaterial) {
                // Update existing material
                const res = await fetch(`${BASE_URL}/materials/${editingMaterial.id}/${user.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    await fetchMaterials();
                    handleClose();
                }
            } else {
                // Add new material
                const res = await fetch(`${BASE_URL}/materials`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    await fetchMaterials();
                    handleClose();
                }
            }
        } catch (err) {
            console.error("Error saving material:", err);
        }
    };

    const handleDelete = async (materialId) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        
        try {
            const res = await fetch(`${BASE_URL}/materials/${materialId}/${user.id}/${jobId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchMaterials();
            }
        } catch (err) {
            console.error("Error deleting material:", err);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
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
            transition: "background .12s",
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
            transition: "background .12s",
        },
        content: {
            padding: 24,
            maxWidth: 1400,
            margin: "0 auto",
        },
        topSection: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            padding: 24,
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        totalCost: {
            fontSize: 24,
            fontWeight: 700,
            color: "#10b981",
        },
        addButton: {
            appearance: "none",
            border: "2px solid #10b981",
            background: "#10b981",
            padding: "12px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
            transition: "all .15s ease",
        },
        tableContainer: {
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        th: {
            background: "#f9fafb",
            padding: "16px",
            textAlign: "left",
            fontSize: 13,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "2px solid #e5e7eb",
        },
        td: {
            padding: "16px",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 14,
            color: "#111827",
        },
        statusBadge: {
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "capitalize",
        },
        statusNeeded: {
            background: "#fee2e2",
            color: "#991b1b",
        },
        statusOrdered: {
            background: "#fef3c7",
            color: "#92400e",
        },
        statusInTransit: {
            background: "#dbeafe",
            color: "#1e40af",
        },
        statusDelivered: {
            background: "#d1fae5",
            color: "#065f46",
        },
        statusInstalled: {
            background: "#ddd6fe",
            color: "#5b21b6",
        },
        actionButton: {
            appearance: "none",
            border: "none",
            background: "transparent",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "background .12s",
            marginRight: 8,
        },
        editButton: {
            color: "#4f46e5",
        },
        deleteButton: {
            color: "#dc2626",
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
            overflowY: "auto",
            padding: "20px",
        },
        modalContent: {
            background: "#ffffff",
            borderRadius: 12,
            padding: 32,
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 24,
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
        },
        formGroup: {
            marginBottom: 20,
        },
        fullWidth: {
            gridColumn: "1 / -1",
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
            minHeight: 80,
            resize: "vertical",
            fontFamily: "inherit",
        },
        select: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            border: "2px solid #e5e7eb",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            boxSizing: "border-box",
            background: "#ffffff",
            cursor: "pointer",
        },
        buttonGroup: {
            display: "flex",
            gap: 12,
            marginTop: 24,
            paddingTop: 24,
            borderTop: "2px solid #e5e7eb",
        },
        submitButton: {
            flex: 1,
            appearance: "none",
            border: "none",
            background: "#10b981",
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
        emptyState: {
            padding: "60px 20px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: 16,
        },
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "ordered":
                return styles.statusOrdered;
            case "in_transit":
                return styles.statusInTransit;
            case "delivered":
                return styles.statusDelivered;
            case "installed":
                return styles.statusInstalled;
            default:
                return styles.statusNeeded;
        }
    };

    const formatCurrency = (value) => {
        if (!value) return "$0.00";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate(`/customer/${customerId}/job/${jobId}`)}
                        style={styles.backButton}
                    >
                        ← Back to Job
                    </button>
                    <div style={styles.title}>{jobName} - Materials</div>
                </div>
                <button onClick={() => setUser(null)} style={styles.logoutBtn}>
                    Log out
                </button>
            </header>

            <main style={styles.content}>
                <div style={styles.topSection}>
                    <div>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                            Total Material Cost
                        </div>
                        <div style={styles.totalCost}>{formatCurrency(totalCost)}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                            Updates job actual cost automatically
                        </div>
                    </div>
                    <button onClick={handleAdd} style={styles.addButton}>
                        + Add Material
                    </button>
                </div>

                <div style={styles.tableContainer}>
                    {materials.length === 0 ? (
                        <div style={styles.emptyState}>
                            No materials yet. Click "Add Material" to get started!
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Material</th>
                                    <th style={styles.th}>Quantity</th>
                                    <th style={styles.th}>Unit Cost</th>
                                    <th style={styles.th}>Total Cost</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Location</th>
                                    <th style={styles.th}>Supplier</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((material) => (
                                    <tr key={material.id}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600 }}>{material.material_name}</div>
                                            {material.description && (
                                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                                    {material.description}
                                                </div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            {material.quantity} {material.unit || "units"}
                                        </td>
                                        <td style={styles.td}>{formatCurrency(material.unit_cost)}</td>
                                        <td style={styles.td}>
                                            <strong>{formatCurrency(material.total_cost)}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.statusBadge, ...getStatusStyle(material.status) }}>
                                                {material.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{material.location || "-"}</td>
                                        <td style={styles.td}>{material.supplier || "-"}</td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleEdit(material)}
                                                style={{ ...styles.actionButton, ...styles.editButton }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(material.id)}
                                                style={{ ...styles.actionButton, ...styles.deleteButton }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Add/Edit Material Modal */}
            {showAddForm && (
                <div style={styles.modalOverlay} onClick={handleClose}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>
                            {editingMaterial ? "Edit Material" : "Add New Material"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGrid}>
                                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                    <label style={styles.label}>Material Name *</label>
                                    <input
                                        type="text"
                                        value={formData.material_name}
                                        onChange={(e) => handleChange("material_name", e.target.value)}
                                        style={styles.input}
                                        placeholder="e.g., 2x4 Lumber, Concrete, Paint"
                                        required
                                    />
                                </div>

                                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                    <label style={styles.label}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Additional details about the material"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Quantity *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange("quantity", e.target.value)}
                                        style={styles.input}
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Unit</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => handleChange("unit", e.target.value)}
                                        style={styles.input}
                                        placeholder="e.g., pieces, sq ft, lbs, gallons"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Unit Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.unit_cost}
                                        onChange={(e) => handleChange("unit_cost", e.target.value)}
                                        style={styles.input}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="needed">Needed</option>
                                        <option value="ordered">Ordered</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="installed">Installed</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Location</label>
                                    <select
                                        value={formData.location}
                                        onChange={(e) => handleChange("location", e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">Select location...</option>
                                        <option value="Shop">Shop</option>
                                        <option value="On Site">On Site</option>
                                        <option value="En Route">En Route</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Supplier</label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={(e) => handleChange("supplier", e.target.value)}
                                        style={styles.input}
                                        placeholder="Supplier name"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Order Date</label>
                                    <input
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => handleChange("order_date", e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Expected Delivery</label>
                                    <input
                                        type="date"
                                        value={formData.expected_delivery}
                                        onChange={(e) => handleChange("expected_delivery", e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Actual Delivery</label>
                                    <input
                                        type="date"
                                        value={formData.actual_delivery}
                                        onChange={(e) => handleChange("actual_delivery", e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                    <label style={styles.label}>Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        style={styles.textarea}
                                        placeholder="Any additional notes"
                                    />
                                </div>
                            </div>

                            <div style={styles.buttonGroup}>
                                <button type="button" onClick={handleClose} style={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.submitButton}>
                                    {editingMaterial ? "Update Material" : "Add Material"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

