import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../config";

export default function AreaCalculator({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const drawingManagerRef = useRef(null);
    const currentShapeRef = useRef(null);
    const shapeTypeRef = useRef(null);
    const searchInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    
    const [area, setArea] = useState(0);
    const [unit, setUnit] = useState("sqft");
    const [isLoaded, setIsLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    
    // Save functionality
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedJob, setSelectedJob] = useState("");
    const [areaName, setAreaName] = useState("");
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [saveHover, setSaveHover] = useState(false);
    
    // For loading saved shapes
    const [loadedAreaData, setLoadedAreaData] = useState(null);
    const [savedAreas, setSavedAreas] = useState([]);
    const [selectedSavedArea, setSelectedSavedArea] = useState("");
    const [loadAreaHover, setLoadAreaHover] = useState(false);
    const [clearSavedAreaHover, setClearSavedAreaHover] = useState(false);

    useEffect(() => {
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log("Geolocation error:", error.message);
                    // Fallback to default location (New York)
                    setUserLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        } else {
            // Fallback if geolocation not supported
            setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }

        // Load Google Maps API
        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                return;
            }

            const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
            
            if (!apiKey) {
                console.error("Google Maps API key not found. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env.local file");
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsLoaded(true);
            script.onerror = () => {
                console.error("Failed to load Google Maps API. Please check your API key.");
            };
            document.head.appendChild(script);
        };

        loadGoogleMaps();

        // Fetch customers
        const fetchCustomers = async () => {
            try {
                const res = await fetch(`${BASE_URL}/customers/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (err) {
                console.error("Error fetching customers:", err);
            }
        };

        // Fetch all saved areas for the user
        const fetchSavedAreas = async () => {
            try {
                const res = await fetch(`${BASE_URL}/areas/user/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSavedAreas(data);
                }
            } catch (err) {
                console.error("Error fetching saved areas:", err);
            }
        };

        fetchCustomers();
        fetchSavedAreas();

        // Check if we're loading a saved area
        if (location.state?.areaData) {
            setLoadedAreaData(location.state.areaData);
            setUnit(location.state.areaData.unit);
            setArea(parseFloat(location.state.areaData.area_value) / getConversionFactor(location.state.areaData.unit));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || !userLocation) return;

        // Initialize map with user's location (or saved shape center if loading)
        const mapCenter = loadedAreaData?.shape_data?.center || userLocation;
        const map = new window.google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: loadedAreaData ? 18 : 18,
            mapTypeId: "satellite",
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
        });

        googleMapRef.current = map;

        // Add a marker at user's location (only if not loading a saved shape)
        if (!loadedAreaData) {
            new window.google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4DA3A2",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                },
            });
        }

        // Initialize drawing manager
        const drawingManager = new window.google.maps.drawing.DrawingManager({
            drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    window.google.maps.drawing.OverlayType.POLYGON,
                    window.google.maps.drawing.OverlayType.RECTANGLE,
                    window.google.maps.drawing.OverlayType.CIRCLE,
                ],
            },
            polygonOptions: {
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                clickable: true,
                editable: true,
                zIndex: 1,
            },
            rectangleOptions: {
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                clickable: true,
                editable: true,
                zIndex: 1,
            },
            circleOptions: {
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                clickable: true,
                editable: true,
                zIndex: 1,
            },
        });

        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;

        // Listen for shape completion
        window.google.maps.event.addListener(
            drawingManager,
            "overlaycomplete",
            (event) => {
                // Remove previous shape
                if (currentShapeRef.current) {
                    currentShapeRef.current.setMap(null);
                }

                currentShapeRef.current = event.overlay;
                calculateArea(event.overlay, event.type);

                // Add listeners for editing
                if (event.type === "polygon") {
                    window.google.maps.event.addListener(
                        event.overlay.getPath(),
                        "set_at",
                        () => calculateArea(event.overlay, event.type)
                    );
                    window.google.maps.event.addListener(
                        event.overlay.getPath(),
                        "insert_at",
                        () => calculateArea(event.overlay, event.type)
                    );
                } else if (event.type === "rectangle") {
                    window.google.maps.event.addListener(
                        event.overlay,
                        "bounds_changed",
                        () => calculateArea(event.overlay, event.type)
                    );
                } else if (event.type === "circle") {
                    window.google.maps.event.addListener(
                        event.overlay,
                        "radius_changed",
                        () => calculateArea(event.overlay, event.type)
                    );
                    window.google.maps.event.addListener(
                        event.overlay,
                        "center_changed",
                        () => calculateArea(event.overlay, event.type)
                    );
                }

                // Switch to hand mode after drawing
                drawingManager.setDrawingMode(null);
            }
        );

        // If loading a saved shape, recreate it
        if (loadedAreaData?.shape_data) {
            recreateSavedShape(map, loadedAreaData.shape_data);
        }

        // Initialize Places Autocomplete
        if (searchInputRef.current && !autocompleteRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                fields: ["geometry", "formatted_address", "name"],
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                
                if (!place.geometry || !place.geometry.location) {
                    console.log("No details available for input: '" + place.name + "'");
                    return;
                }

                // Center map on the selected location
                map.setCenter(place.geometry.location);
                map.setZoom(18);

                // Add a marker at the searched location
                new window.google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.formatted_address || place.name,
                    animation: window.google.maps.Animation.DROP,
                });
            });

            autocompleteRef.current = autocomplete;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, userLocation, loadedAreaData]);

    const getConversionFactor = (targetUnit) => {
        switch (targetUnit) {
            case "sqft":
                return 10.7639;
            case "sqm":
                return 1;
            case "acres":
                return 0.000247105;
            case "hectares":
                return 0.0001;
            default:
                return 1;
        }
    };

    const getShapeData = (shape, type) => {
        const data = { type, center: null };
        
        if (type === "polygon") {
            const path = shape.getPath();
            data.path = [];
            for (let i = 0; i < path.getLength(); i++) {
                const point = path.getAt(i);
                data.path.push({ lat: point.lat(), lng: point.lng() });
            }
            // Calculate center
            if (data.path.length > 0) {
                const avgLat = data.path.reduce((sum, p) => sum + p.lat, 0) / data.path.length;
                const avgLng = data.path.reduce((sum, p) => sum + p.lng, 0) / data.path.length;
                data.center = { lat: avgLat, lng: avgLng };
            }
        } else if (type === "rectangle") {
            const bounds = shape.getBounds();
            data.bounds = {
                north: bounds.getNorthEast().lat(),
                south: bounds.getSouthWest().lat(),
                east: bounds.getNorthEast().lng(),
                west: bounds.getSouthWest().lng(),
            };
            data.center = {
                lat: (data.bounds.north + data.bounds.south) / 2,
                lng: (data.bounds.east + data.bounds.west) / 2,
            };
        } else if (type === "circle") {
            const center = shape.getCenter();
            data.center = { lat: center.lat(), lng: center.lng() };
            data.radius = shape.getRadius();
        }
        
        return data;
    };

    const recreateSavedShape = (map, shapeData) => {
        let shape = null;
        
        if (shapeData.type === "polygon" && shapeData.path) {
            shape = new window.google.maps.Polygon({
                paths: shapeData.path,
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                editable: true,
                map: map,
            });
            currentShapeRef.current = shape;
            shapeTypeRef.current = "polygon";
            
            // Add listeners for editing
            window.google.maps.event.addListener(shape.getPath(), "set_at", () =>
                calculateArea(shape, "polygon")
            );
            window.google.maps.event.addListener(shape.getPath(), "insert_at", () =>
                calculateArea(shape, "polygon")
            );
            
            calculateArea(shape, "polygon");
        } else if (shapeData.type === "rectangle" && shapeData.bounds) {
            shape = new window.google.maps.Rectangle({
                bounds: shapeData.bounds,
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                editable: true,
                map: map,
            });
            currentShapeRef.current = shape;
            shapeTypeRef.current = "rectangle";
            
            window.google.maps.event.addListener(shape, "bounds_changed", () =>
                calculateArea(shape, "rectangle")
            );
            
            calculateArea(shape, "rectangle");
        } else if (shapeData.type === "circle" && shapeData.center && shapeData.radius) {
            shape = new window.google.maps.Circle({
                center: shapeData.center,
                radius: shapeData.radius,
                fillColor: "#4DA3A2",
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: "#234848",
                editable: true,
                map: map,
            });
            currentShapeRef.current = shape;
            shapeTypeRef.current = "circle";
            
            window.google.maps.event.addListener(shape, "radius_changed", () =>
                calculateArea(shape, "circle")
            );
            window.google.maps.event.addListener(shape, "center_changed", () =>
                calculateArea(shape, "circle")
            );
            
            calculateArea(shape, "circle");
        }
    };

    const calculateArea = (shape, type) => {
        let areaInSquareMeters = 0;
        shapeTypeRef.current = type;

        if (type === "polygon") {
            areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(
                shape.getPath()
            );
        } else if (type === "rectangle") {
            const bounds = shape.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const nw = new window.google.maps.LatLng(ne.lat(), sw.lng());
            const se = new window.google.maps.LatLng(sw.lat(), ne.lng());
            
            const path = [nw, ne, se, sw];
            areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(path);
        } else if (type === "circle") {
            const radius = shape.getRadius();
            areaInSquareMeters = Math.PI * radius * radius;
        }

        setArea(areaInSquareMeters);
    };

    const convertArea = (areaInSquareMeters) => {
        switch (unit) {
            case "sqft":
                return (areaInSquareMeters * 10.7639).toFixed(2);
            case "sqm":
                return areaInSquareMeters.toFixed(2);
            case "acres":
                return (areaInSquareMeters * 0.000247105).toFixed(4);
            case "hectares":
                return (areaInSquareMeters * 0.0001).toFixed(4);
            default:
                return areaInSquareMeters.toFixed(2);
        }
    };

    const clearShape = () => {
        if (currentShapeRef.current) {
            currentShapeRef.current.setMap(null);
            currentShapeRef.current = null;
            setArea(0);
        }
        
        // Return to user's location
        if (googleMapRef.current && userLocation) {
            googleMapRef.current.setCenter(userLocation);
            googleMapRef.current.setZoom(18);
        }
    };

    const handleClearSavedArea = () => {
        // Clear the selection
        setSelectedSavedArea("");
        
        // Clear any shape on the map (which also returns to user location)
        clearShape();
    };

    const handleLoadSavedArea = () => {
        if (!selectedSavedArea) {
            alert("Please select an area to load");
            return;
        }

        const areaToLoad = savedAreas.find(a => a.id === parseInt(selectedSavedArea));
        if (!areaToLoad) return;

        // Clear existing shape
        clearShape();

        // Parse shape data
        const shapeData = typeof areaToLoad.shape_data === 'string' 
            ? JSON.parse(areaToLoad.shape_data) 
            : areaToLoad.shape_data;

        // Set area and unit
        setArea(parseFloat(areaToLoad.area_value) / getConversionFactor(areaToLoad.unit));
        setUnit(areaToLoad.unit);

        // Center map on the saved area
        if (googleMapRef.current && shapeData.center) {
            googleMapRef.current.setCenter(shapeData.center);
            googleMapRef.current.setZoom(18);
        }

        // Recreate the shape
        if (googleMapRef.current) {
            recreateSavedShape(googleMapRef.current, shapeData);
        }
    };

    const handleCustomerChange = async (customerId) => {
        setSelectedCustomer(customerId);
        setSelectedJob("");
        setJobs([]);
        
        if (customerId) {
            try {
                const res = await fetch(`${BASE_URL}/jobs/customer/${customerId}/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (err) {
                console.error("Error fetching jobs:", err);
            }
        }
    };

    const handleSaveArea = async () => {
        if (!selectedJob || !areaName.trim() || area === 0) {
            alert("Please select a job, enter an area name, and calculate an area first.");
            return;
        }

        if (!currentShapeRef.current || !shapeTypeRef.current) {
            alert("No shape drawn. Please draw a shape first.");
            return;
        }

        try {
            const shapeData = getShapeData(currentShapeRef.current, shapeTypeRef.current);
            
            const res = await fetch(`${BASE_URL}/areas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    job_id: selectedJob,
                    customer_id: selectedCustomer,
                    area_name: areaName,
                    area_value: convertArea(area),
                    unit: unit,
                    shape_data: JSON.stringify(shapeData),
                }),
            });

            if (res.ok) {
                // Navigate to the job details page
                navigate(`/customer/${selectedCustomer}/job/${selectedJob}`);
            } else {
                const errorData = await res.json();
                alert("Failed to save area: " + (errorData.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error saving area:", err);
            alert("Error saving area: " + err.message);
        }
    };

    const getUnitLabel = () => {
        switch (unit) {
            case "sqft":
                return "sq ft";
            case "sqm":
                return "sq m";
            case "acres":
                return "acres";
            case "hectares":
                return "hectares";
            default:
                return "sq m";
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            background: "#f9fafb",
            fontFamily: "'DM Sans', sans-serif",
        },
        header: {
            background: "#234848",
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: 16,
        },
        backButton: {
            appearance: "none",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            background: "transparent",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#99CFCE",
            transition: "all .15s",
        },
        backButtonHover: {
            background: "#99CFCE",
            color: "#0F1F1F",
        },
        title: {
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            color: "#ffffff",
        },
        logoutBtn: {
            appearance: "none",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            background: "transparent",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            color: "#99CFCE",
            transition: "all .15s",
        },
        logoutBtnHover: {
            background: "#99CFCE",
            color: "#0F1F1F",
        },
        content: {
            maxWidth: 1400,
            margin: "0 auto",
            padding: "24px 32px",
            height: "calc(100vh - 120px)", // Full height minus header
            display: "flex",
            flexDirection: "column",
        },
        controls: {
            background: "#ffffff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
        formGroup: {
            display: "flex",
            flexDirection: "column",
            gap: 8,
        },
        label: {
            fontSize: 14,
            fontWeight: 600,
            color: "#234848",
        },
        select: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            background: "#ffffff",
            color: "#0F1F1F",
            boxSizing: "border-box",
        },
        button: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#4DA3A2",
            background: "#4DA3A2",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            transition: "all .15s ease",
        },
        buttonHover: {
            background: "#3d8a89",
        },
        clearButton: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            background: "#ffffff",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#0F1F1F",
            transition: "all .15s ease",
        },
        clearButtonHover: {
            background: "#f3f4f6",
        },
        resultBox: {
            background: "#ffffff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        },
        resultLabel: {
            fontSize: 14,
            color: "#234848",
            marginBottom: 16,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        resultValue: {
            fontSize: 36,
            fontWeight: 700,
            color: "#4DA3A2",
            marginBottom: 8,
            lineHeight: 1,
        },
        resultUnit: {
            fontSize: 18,
            color: "#0F1F1F",
            fontWeight: 500,
        },
        emptyResult: {
            background: "#ffffff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: 13,
        },
        mapWrapper: {
            display: "flex",
            gap: 24,
            flex: 1,
            minHeight: 0, // Important for flexbox
        },
        mapContainer: {
            flex: "0 0 75%",
            background: "#ffffff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            minHeight: 0,
        },
        sidePanel: {
            flex: "0 0 calc(25% - 24px)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "auto",
        },
        saveButton: {
            appearance: "none",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#4DA3A2",
            background: "#4DA3A2",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            transition: "all .15s ease",
            width: "100%",
        },
        saveButtonHover: {
            background: "#3d8a89",
        },
        saveForm: {
            background: "#ffffff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
        input: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            background: "#ffffff",
            color: "#0F1F1F",
            boxSizing: "border-box",
        },
        searchContainer: {
            background: "#ffffff",
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
        searchLabel: {
            fontSize: 14,
            fontWeight: 600,
            color: "#234848",
            marginBottom: 8,
        },
        searchInput: {
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "#99CFCE",
            borderRadius: 6,
            outline: "none",
            transition: "border-color .15s",
            background: "#ffffff",
            color: "#0F1F1F",
            boxSizing: "border-box",
        },
    };

    const [backHover, setBackHover] = useState(false);
    const [logoutHover, setLogoutHover] = useState(false);
    const [clearHover, setClearHover] = useState(false);

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            ...styles.backButton,
                            ...(backHover ? styles.backButtonHover : {}),
                        }}
                        onMouseEnter={() => setBackHover(true)}
                        onMouseLeave={() => setBackHover(false)}
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
                    <h1 style={styles.title}>Area Calculator</h1>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("user");
                        setUser(null);
                    }}
                    style={{
                        ...styles.logoutBtn,
                        ...(logoutHover ? styles.logoutBtnHover : {}),
                    }}
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => setLogoutHover(false)}
                >
                    Logout
                </button>
            </header>

            <main style={styles.content}>
                <div style={styles.mapWrapper}>
                    {/* Map Container - 75% */}
                    <div style={styles.mapContainer}>
                        {!isLoaded ? (
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                height: "100%",
                                color: "#234848",
                                fontSize: 18,
                            }}>
                                Loading Google Maps...
                            </div>
                        ) : (
                            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                        )}
                    </div>

                    {/* Side Panel - 25% */}
                    <div style={styles.sidePanel}>
                        {/* Address Search */}
                        <div style={styles.searchContainer}>
                            <div style={styles.searchLabel}>
                                Search Address
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Enter an address..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        {/* Load Saved Areas */}
                        {savedAreas.length > 0 && (
                            <div style={styles.searchContainer}>
                                <div style={styles.searchLabel}>
                                    Load Saved Area
                                </div>
                                <select
                                    value={selectedSavedArea}
                                    onChange={(e) => setSelectedSavedArea(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Select a saved area...</option>
                                    {savedAreas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.area_name} - {area.customer_name || 'Unknown'} / {area.job_name || 'Unknown Job'}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    <button
                                        onClick={handleLoadSavedArea}
                                        disabled={!selectedSavedArea}
                                        style={{
                                            ...styles.saveButton,
                                            ...(loadAreaHover && selectedSavedArea ? styles.saveButtonHover : {}),
                                            opacity: selectedSavedArea ? 1 : 0.5,
                                            cursor: selectedSavedArea ? "pointer" : "not-allowed",
                                            flex: 1,
                                            marginTop: 0,
                                        }}
                                        onMouseEnter={() => setLoadAreaHover(true)}
                                        onMouseLeave={() => setLoadAreaHover(false)}
                                    >
                                        Load Area
                                    </button>
                                    <button
                                        onClick={handleClearSavedArea}
                                        disabled={!selectedSavedArea}
                                        style={{
                                            ...styles.clearButton,
                                            ...(clearSavedAreaHover && selectedSavedArea ? styles.clearButtonHover : {}),
                                            opacity: selectedSavedArea ? 1 : 0.5,
                                            cursor: selectedSavedArea ? "pointer" : "not-allowed",
                                            flex: 1,
                                        }}
                                        onMouseEnter={() => setClearSavedAreaHover(true)}
                                        onMouseLeave={() => setClearSavedAreaHover(false)}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Area Display */}
                        {area > 0 ? (
                            <div style={styles.resultBox}>
                                <div style={styles.resultLabel}>Total Area</div>
                                <div>
                                    <div style={styles.resultValue}>{convertArea(area)}</div>
                                    <div style={styles.resultUnit}>{getUnitLabel()}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.emptyResult}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📐</div>
                                <div style={{ fontWeight: 600, marginBottom: 6 }}>No Area Calculated</div>
                                <div>Draw a shape on the map</div>
                            </div>
                        )}

                        {/* Controls */}
                        <div style={styles.controls}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Unit of Measurement</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="sqft">Square Feet</option>
                                    <option value="sqm">Square Meters</option>
                                    <option value="acres">Acres</option>
                                    <option value="hectares">Hectares</option>
                                </select>
                            </div>
                            <button
                                onClick={clearShape}
                                style={{
                                    ...styles.clearButton,
                                    ...(clearHover ? styles.clearButtonHover : {}),
                                    width: "100%",
                                    marginTop: 16,
                                }}
                                onMouseEnter={() => setClearHover(true)}
                                onMouseLeave={() => setClearHover(false)}
                            >
                                Clear Shape
                            </button>
                        </div>

                        {/* Save to Job Button */}
                        {area > 0 && !showSaveForm && (
                            <button
                                onClick={() => setShowSaveForm(true)}
                                style={{
                                    ...styles.saveButton,
                                    ...(saveHover ? styles.saveButtonHover : {}),
                                }}
                                onMouseEnter={() => setSaveHover(true)}
                                onMouseLeave={() => setSaveHover(false)}
                            >
                                💾 Save to Job
                            </button>
                        )}

                        {/* Save Form */}
                        {showSaveForm && (
                            <div style={styles.saveForm}>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#234848", marginBottom: 16 }}>
                                    Save Area to Job
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Area Name</label>
                                    <input
                                        type="text"
                                        value={areaName}
                                        onChange={(e) => setAreaName(e.target.value)}
                                        placeholder="e.g., Front Yard, Driveway"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Customer</label>
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">Select a customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCustomer && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Job</label>
                                        <select
                                            value={selectedJob}
                                            onChange={(e) => setSelectedJob(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="">Select a job</option>
                                            {jobs.map((job) => (
                                                <option key={job.id} value={job.id}>
                                                    {job.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                    <button
                                        onClick={handleSaveArea}
                                        style={{
                                            ...styles.saveButton,
                                            flex: 1,
                                            padding: "8px 16px",
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSaveForm(false);
                                            setAreaName("");
                                            setSelectedCustomer("");
                                            setSelectedJob("");
                                        }}
                                        style={{
                                            ...styles.clearButton,
                                            flex: 1,
                                            padding: "8px 16px",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

