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
    const [cancelHover, setCancelHover] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const [hoveredOption, setHoveredOption] = useState(null);
    const [editingCell, setEditingCell] = useState(null); // { materialId, field }
    const [editingValue, setEditingValue] = useState("");
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
    const [detectedMaterialType, setDetectedMaterialType] = useState(null);
    const [materialDimensions, setMaterialDimensions] = useState({
        length: "",
        width: "",
        height: "",
        thickness: "",
        diameter: ""
    });
    const [dimensionUnits, setDimensionUnits] = useState({
        length: "feet",
        width: "inches",
        height: "inches",
        thickness: "inches",
        diameter: "inches"
    });

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

    // Material type detection patterns
    const materialTypes = {
        lumber: {
            keywords: ['lumber', 'wood', 'timber', '2x4', '2x6', '2x8', '4x4', 'plywood', 'board'],
            fields: ['thickness', 'width', 'length'],
            defaultUnit: 'pieces'
        },
        pipe: {
            keywords: ['pipe', 'pvc', 'copper', 'pex', 'conduit'],
            fields: ['diameter', 'length'],
            defaultUnit: 'linear feet'
        },
        concrete: {
            keywords: ['concrete', 'cement', 'mortar', 'grout'],
            fields: ['height', 'width', 'length'],
            defaultUnit: 'cubic yards'
        },
        drywall: {
            keywords: ['drywall', 'sheetrock', 'gypsum'],
            fields: ['thickness', 'width', 'length'],
            defaultUnit: 'sheets'
        },
        paint: {
            keywords: ['paint', 'stain', 'primer', 'sealer'],
            fields: [],
            defaultUnit: 'gallons'
        },
        roofing: {
            keywords: ['shingle', 'roofing', 'tile', 'membrane'],
            fields: ['width', 'length'],
            defaultUnit: 'squares'
        },
        insulation: {
            keywords: ['insulation', 'foam', 'fiberglass'],
            fields: ['thickness', 'width', 'length'],
            defaultUnit: 'square feet'
        }
    };

    const detectMaterialType = (materialName) => {
        const lowerName = materialName.toLowerCase();
        for (const [type, config] of Object.entries(materialTypes)) {
            if (config.keywords.some(keyword => lowerName.includes(keyword))) {
                return { type, config };
            }
        }
        return null;
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
        setDetectedMaterialType(null);
        setMaterialDimensions({
            length: "",
            width: "",
            height: "",
            thickness: "",
            diameter: ""
        });
        setDimensionUnits({
            length: "feet",
            width: "inches",
            height: "inches",
            thickness: "inches",
            diameter: "inches"
        });
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
        
        // Load material type and dimensions if they exist
        if (material.material_type) {
            const detected = detectMaterialType(material.material_name);
            setDetectedMaterialType(detected);
        }
        
        if (material.dimensions) {
            const dims = typeof material.dimensions === 'string' 
                ? JSON.parse(material.dimensions) 
                : material.dimensions;
            
            const loadedDimensions = {
                length: "",
                width: "",
                height: "",
                thickness: "",
                diameter: ""
            };
            const loadedUnits = {
                length: "feet",
                width: "inches",
                height: "inches",
                thickness: "inches",
                diameter: "inches"
            };
            
            // Load dimension values and units
            Object.keys(dims).forEach(key => {
                if (typeof dims[key] === 'object' && dims[key].value) {
                    // New format with value and unit
                    loadedDimensions[key] = dims[key].value;
                    loadedUnits[key] = dims[key].unit || "inches";
                } else {
                    // Old format - just the value
                    loadedDimensions[key] = dims[key];
                }
            });
            
            setMaterialDimensions(loadedDimensions);
            setDimensionUnits(loadedUnits);
        }
        
        setEditingMaterial(material);
        setShowAddForm(true);
    };

    const handleClose = () => {
        setShowAddForm(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare dimensions object - only include non-empty values with units
        const dimensionsToSave = {};
        if (detectedMaterialType) {
            detectedMaterialType.config.fields.forEach(field => {
                if (materialDimensions[field]) {
                    dimensionsToSave[field] = {
                        value: materialDimensions[field],
                        unit: dimensionUnits[field]
                    };
                }
            });
        }
        
        const payload = {
            ...formData,
            user_id: user.id,
            job_id: parseInt(jobId),
            customer_id: parseInt(customerId),
            material_type: detectedMaterialType ? detectedMaterialType.type : null,
            dimensions: Object.keys(dimensionsToSave).length > 0 ? dimensionsToSave : null,
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
        
        // Detect material type when material name changes
        if (field === "material_name") {
            const detected = detectMaterialType(value);
            if (detected) {
                setDetectedMaterialType(detected);
                // Auto-set unit if not already set
                if (!formData.unit) {
                    setFormData(prev => ({ ...prev, unit: detected.config.defaultUnit }));
                }
            } else {
                setDetectedMaterialType(null);
            }
        }
    };

    const handleDimensionChange = (field, value) => {
        setMaterialDimensions({ ...materialDimensions, [field]: value });
        
        // Auto-update description with dimensions
        if (detectedMaterialType) {
            const dims = { ...materialDimensions, [field]: value };
            const units = dimensionUnits;
            const dimensionParts = [];
            
            detectedMaterialType.config.fields.forEach(f => {
                if (dims[f]) {
                    dimensionParts.push(`${f}: ${dims[f]} ${units[f]}`);
                }
            });
            
            if (dimensionParts.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    description: `Dimensions: ${dimensionParts.join(', ')}`
                }));
            }
        }
    };

    const handleDimensionUnitChange = (field, unit) => {
        setDimensionUnits({ ...dimensionUnits, [field]: unit });
        
        // Auto-update description with new unit
        if (detectedMaterialType) {
            const dims = materialDimensions;
            const units = { ...dimensionUnits, [field]: unit };
            const dimensionParts = [];
            
            detectedMaterialType.config.fields.forEach(f => {
                if (dims[f]) {
                    dimensionParts.push(`${f}: ${dims[f]} ${units[f]}`);
                }
            });
            
            if (dimensionParts.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    description: `Dimensions: ${dimensionParts.join(', ')}`
                }));
            }
        }
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
            color: "#4DA3A2",
        },
        addButton: {
            appearance: "none",
            border: "2px solid #4DA3A2",
            background: "#4DA3A2",
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
            overflow: "visible",
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
            color: "#234848",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "2px solid #99CFCE",
        },
        td: {
            padding: "16px",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 14,
            color: "#0F1F1F",
            position: "relative",
        },
        statusBadge: {
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 600,
            textTransform: "capitalize",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: "2px solid transparent",
            userSelect: "none",
        },
        statusNeeded: {
            background: "#fee2e2",
            color: "#991b1b",
            borderColor: "#fca5a5",
        },
        statusOrdered: {
            background: "#B0AF63",
            color: "#ffffff",
            borderColor: "#9d9c56",
        },
        statusInTransit: {
            background: "#99CFCE",
            color: "#0F1F1F",
            borderColor: "#7db9b8",
        },
        statusDelivered: {
            background: "#4DA3A2",
            color: "#ffffff",
            borderColor: "#3d8a89",
        },
        statusInstalled: {
            background: "#234848",
            color: "#ffffff",
            borderColor: "#0F1F1F",
        },
        statusDropdown: {
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 8,
            background: "#ffffff",
            border: "2px solid #99CFCE",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 1000,
            minWidth: 140,
            overflow: "hidden",
        },
        statusDropdownOption: {
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "capitalize",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#ffffff",
            color: "#0F1F1F",
        },
        statusDropdownOptionHover: {
            background: "#f9fafb",
        },
        statusDropdownOptionDivider: {
            borderBottom: "1px solid #f3f4f6",
        },
        statusContainer: {
            position: "relative",
            display: "inline-block",
        },
        editableCell: {
            cursor: "pointer",
            transition: "background 0.15s",
        },
        editableCellHover: {
            background: "#f9fafb",
        },
        editingInput: {
            width: "100%",
            padding: "6px 8px",
            fontSize: 14,
            border: "2px solid #4DA3A2",
            borderRadius: 4,
            outline: "none",
            background: "#ffffff",
            color: "#0F1F1F",
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
            color: "#4DA3A2",
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
            color: "#0F1F1F",
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
            color: "#234848",
            marginBottom: 8,
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
            minHeight: 80,
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
        buttonGroup: {
            display: "flex",
            gap: 12,
            marginTop: 24,
            paddingTop: 24,
            borderTop: "2px solid #99CFCE",
        },
        submitButton: {
            flex: 1,
            appearance: "none",
            border: "none",
            background: "#4DA3A2",
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
            border: "2px solid #99CFCE",
            background: "#ffffff",
            padding: "12px 24px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#0F1F1F",
            transition: "all .15s",
        },
        cancelButtonHover: {
            background: "#f3f4f6",
            borderColor: "#99CFCE",
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

    const statusOptions = [
        { value: "needed", label: "Needed" },
        { value: "ordered", label: "Ordered" },
        { value: "in_transit", label: "In Transit" },
        { value: "delivered", label: "Delivered" },
        { value: "installed", label: "Installed" }
    ];

    const handleStatusClick = (materialId, e) => {
        e.stopPropagation();
        setStatusDropdownOpen(statusDropdownOpen === materialId ? null : materialId);
    };

    const handleStatusChange = async (material, newStatus) => {
        setStatusDropdownOpen(null);
        
        if (material.status === newStatus) return;

        try {
            const res = await fetch(`${BASE_URL}/materials/${material.id}/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    material_name: material.material_name,
                    description: material.description,
                    quantity: material.quantity,
                    unit: material.unit,
                    unit_cost: material.unit_cost,
                    status: newStatus,
                    location: material.location,
                    supplier: material.supplier,
                    order_date: material.order_date,
                    expected_delivery: material.expected_delivery,
                    actual_delivery: material.actual_delivery,
                    notes: material.notes,
                    job_id: jobId,
                }),
            });

            if (res.ok) {
                fetchMaterials();
            } else {
                const errorData = await res.json();
                console.error("Failed to update status:", errorData);
                alert("Failed to update status: " + (errorData.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status: " + err.message);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (statusDropdownOpen) {
                setStatusDropdownOpen(null);
            }
        };
        
        if (statusDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [statusDropdownOpen]);

    const handleCellClick = (material, field) => {
        setEditingCell({ materialId: material.id, field });
        setEditingValue(material[field] || "");
    };

    const handleCellSave = async (material) => {
        if (!editingCell) return;

        const updatedValue = editingValue;
        setEditingCell(null);

        // Don't update if value hasn't changed
        if (material[editingCell.field] === updatedValue) return;

        try {
            const res = await fetch(`${BASE_URL}/materials/${material.id}/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    material_name: editingCell.field === "material_name" ? updatedValue : material.material_name,
                    description: editingCell.field === "description" ? updatedValue : material.description,
                    quantity: editingCell.field === "quantity" ? updatedValue : material.quantity,
                    unit: editingCell.field === "unit" ? updatedValue : material.unit,
                    unit_cost: editingCell.field === "unit_cost" ? updatedValue : material.unit_cost,
                    status: material.status,
                    location: editingCell.field === "location" ? updatedValue : material.location,
                    supplier: editingCell.field === "supplier" ? updatedValue : material.supplier,
                    order_date: material.order_date,
                    expected_delivery: material.expected_delivery,
                    actual_delivery: material.actual_delivery,
                    notes: material.notes,
                    job_id: jobId,
                }),
            });

            if (res.ok) {
                fetchMaterials();
            } else {
                const errorData = await res.json();
                console.error("Failed to update:", errorData);
                alert("Failed to update: " + (errorData.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating:", err);
            alert("Error updating: " + err.message);
        }
    };

    const handleKeyPress = (e, material) => {
        if (e.key === "Enter") {
            handleCellSave(material);
        } else if (e.key === "Escape") {
            setEditingCell(null);
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
                        onClick={() => navigate(-1)}
                        style={styles.backButton}
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={styles.backButton}
                        title="Go to Dashboard"
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                        >
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
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
                                    <th style={styles.th}>
                                        Status 
                                        <span style={{ 
                                            fontSize: 10, 
                                            fontWeight: 400, 
                                            color: "#99CFCE",
                                            display: "block",
                                            marginTop: 2
                                        }}>
                                        </span>
                                    </th>
                                    <th style={styles.th}>Location</th>
                                    <th style={styles.th}>Supplier</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((material) => (
                                    <tr key={material.id}>
                                        <td 
                                            style={{
                                                ...styles.td,
                                                ...styles.editableCell,
                                            }}
                                            onClick={() => handleCellClick(material, "material_name")}
                                            title="Click to edit"
                                        >
                                            {editingCell?.materialId === material.id && editingCell?.field === "material_name" ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onBlur={() => handleCellSave(material)}
                                                    onKeyDown={(e) => handleKeyPress(e, material)}
                                                    style={styles.editingInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    <div style={{ fontWeight: 600 }}>{material.material_name}</div>
                                                    {material.description && (
                                                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                                            {material.description}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        ...styles.editableCell,
                                                        padding: "4px 8px",
                                                        borderRadius: 4,
                                                    }}
                                                    onClick={() => handleCellClick(material, "quantity")}
                                                    title="Click to edit quantity"
                                                >
                                                    {editingCell?.materialId === material.id && editingCell?.field === "quantity" ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            onBlur={() => handleCellSave(material)}
                                                            onKeyDown={(e) => handleKeyPress(e, material)}
                                                            style={styles.editingInput}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        material.quantity
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        ...styles.editableCell,
                                                        padding: "4px 8px",
                                                        borderRadius: 4,
                                                        minWidth: 60,
                                                    }}
                                                    onClick={() => handleCellClick(material, "unit")}
                                                    title="Click to edit unit"
                                                >
                                                    {editingCell?.materialId === material.id && editingCell?.field === "unit" ? (
                                                        <input
                                                            type="text"
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            onBlur={() => handleCellSave(material)}
                                                            onKeyDown={(e) => handleKeyPress(e, material)}
                                                            style={styles.editingInput}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        material.unit || "units"
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td 
                                            style={{
                                                ...styles.td,
                                                ...styles.editableCell,
                                            }}
                                            onClick={() => handleCellClick(material, "unit_cost")}
                                            title="Click to edit cost"
                                        >
                                            {editingCell?.materialId === material.id && editingCell?.field === "unit_cost" ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onBlur={() => handleCellSave(material)}
                                                    onKeyDown={(e) => handleKeyPress(e, material)}
                                                    style={styles.editingInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                formatCurrency(material.unit_cost)
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <strong>{formatCurrency(material.total_cost)}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.statusContainer}>
                                                <span 
                                                    style={{ 
                                                        ...styles.statusBadge, 
                                                        ...getStatusStyle(material.status),
                                                    }}
                                                    onClick={(e) => handleStatusClick(material.id, e)}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = "scale(1.05)";
                                                        e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = "scale(1)";
                                                        e.target.style.boxShadow = "none";
                                                    }}
                                                    title="Click to select status"
                                                >
                                                    {material.status.replace("_", " ")}
                                                </span>
                                                
                                                {statusDropdownOpen === material.id && (
                                                    <div style={styles.statusDropdown}>
                                                        {statusOptions.map((option, index) => (
                                                            <div
                                                                key={option.value}
                                                                style={{
                                                                    ...styles.statusDropdownOption,
                                                                    ...(hoveredOption === option.value && option.value !== material.status ? styles.statusDropdownOptionHover : {}),
                                                                    ...(index < statusOptions.length - 1 ? styles.statusDropdownOptionDivider : {}),
                                                                    opacity: option.value === material.status ? 0.7 : 1,
                                                                    transform: hoveredOption === option.value && option.value !== material.status ? "translateX(4px)" : "translateX(0)",
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusChange(material, option.value);
                                                                }}
                                                                onMouseEnter={() => {
                                                                    if (option.value !== material.status) {
                                                                        setHoveredOption(option.value);
                                                                    }
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setHoveredOption(null);
                                                                }}
                                                            >
                                                                {option.value === material.status && (
                                                                    <span style={{ fontSize: 10, color: "#4DA3A2", marginRight: 4 }}>✓</span>
                                                                )}
                                                                {option.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td 
                                            style={{
                                                ...styles.td,
                                                ...styles.editableCell,
                                            }}
                                            onClick={() => handleCellClick(material, "location")}
                                            title="Click to edit location"
                                        >
                                            {editingCell?.materialId === material.id && editingCell?.field === "location" ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onBlur={() => handleCellSave(material)}
                                                    onKeyDown={(e) => handleKeyPress(e, material)}
                                                    style={styles.editingInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                material.location || "-"
                                            )}
                                        </td>
                                        <td 
                                            style={{
                                                ...styles.td,
                                                ...styles.editableCell,
                                            }}
                                            onClick={() => handleCellClick(material, "supplier")}
                                            title="Click to edit supplier"
                                        >
                                            {editingCell?.materialId === material.id && editingCell?.field === "supplier" ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onBlur={() => handleCellSave(material)}
                                                    onKeyDown={(e) => handleKeyPress(e, material)}
                                                    style={styles.editingInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                material.supplier || "-"
                                            )}
                                        </td>
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

                                {/* Dynamic dimension fields based on material type */}
                                {detectedMaterialType && detectedMaterialType.config.fields.length > 0 && (
                                    <div style={{ 
                                        ...styles.fullWidth, 
                                        background: "#f0f9ff",
                                        padding: 20,
                                        borderRadius: 8,
                                        border: "2px solid #99CFCE"
                                    }}>
                                        <div style={{ 
                                            fontSize: 15, 
                                            fontWeight: 600, 
                                            color: "#234848", 
                                            marginBottom: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <span style={{ fontSize: 18 }}>📏</span>
                                            Dimensions
                                        </div>
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${Math.min(detectedMaterialType.config.fields.length, 3)}, 1fr)`,
                                            gap: 12
                                        }}>
                                            {detectedMaterialType.config.fields.map(field => (
                                                <div key={field}>
                                                    <label style={{
                                                        ...styles.label,
                                                        fontSize: 13,
                                                        marginBottom: 6
                                                    }}>
                                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                                    </label>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        <input
                                                            type="number"
                                                            step="0.25"
                                                            value={materialDimensions[field]}
                                                            onChange={(e) => handleDimensionChange(field, e.target.value)}
                                                            style={{
                                                                ...styles.input,
                                                                fontSize: 14,
                                                                flex: 1
                                                            }}
                                                            placeholder="0"
                                                        />
                                                        <select
                                                            value={dimensionUnits[field]}
                                                            onChange={(e) => handleDimensionUnitChange(field, e.target.value)}
                                                            style={{
                                                                ...styles.select,
                                                                fontSize: 13,
                                                                width: "auto",
                                                                minWidth: 80
                                                            }}
                                                        >
                                                            <option value="inches">in</option>
                                                            <option value="feet">ft</option>
                                                            <option value="yards">yd</option>
                                                            <option value="millimeters">mm</option>
                                                            <option value="centimeters">cm</option>
                                                            <option value="meters">m</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                    <label style={styles.label}>
                                        Status
                                        <span style={{ 
                                            ...styles.statusBadge, 
                                            ...getStatusStyle(formData.status),
                                            marginLeft: 12,
                                            fontSize: 11,
                                            padding: "4px 10px",
                                            cursor: "default"
                                        }}>
                                            {formData.status.replace("_", " ")}
                                        </span>
                                    </label>
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
                                <button 
                                    type="button" 
                                    onClick={handleClose} 
                                    style={{
                                        ...styles.cancelButton,
                                        ...(cancelHover ? styles.cancelButtonHover : {}),
                                    }}
                                    onMouseEnter={() => setCancelHover(true)}
                                    onMouseLeave={() => setCancelHover(false)}
                                >
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

