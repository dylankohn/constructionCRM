import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Picker,
} from 'react-native';
import MapView, { Polygon, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { BASE_URL } from '../config/config';
import { colors } from '../styles/colors';

export default function AreaCalculator({ navigation, user, setUser }) {
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [area, setArea] = useState(0);
  const [unit, setUnit] = useState('sqft');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Save functionality
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [areaName, setAreaName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    getUserLocation();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (polygonCoordinates.length >= 3) {
      calculateArea();
    }
  }, [polygonCoordinates, unit]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (err) {
      console.error('Error getting location:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/customers/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleCustomerChange = async (customerId) => {
    setSelectedCustomer(customerId);
    setSelectedJob('');
    setJobs([]);

    if (customerId) {
      try {
        const res = await fetch(`${BASE_URL}/jobs/customer/${customerId}/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    }
  };

  const onMapPress = (e) => {
    if (isDrawing) {
      setPolygonCoordinates([...polygonCoordinates, e.nativeEvent.coordinate]);
    }
  };

  const calculateArea = () => {
    if (polygonCoordinates.length < 3) {
      setArea(0);
      return;
    }

    // Calculate area using Shoelace formula (for lat/lng coordinates)
    const coords = polygonCoordinates;
    let sum = 0;

    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      sum += coords[i].longitude * coords[j].latitude;
      sum -= coords[i].latitude * coords[j].longitude;
    }

    // Convert to square meters (approximate)
    const areaInSqMeters = Math.abs(sum / 2.0) * 111320 * 111320;
    setArea(areaInSqMeters);
  };

  const convertArea = (areaInSquareMeters) => {
    switch (unit) {
      case 'sqft':
        return (areaInSquareMeters * 10.7639).toFixed(2);
      case 'sqm':
        return areaInSquareMeters.toFixed(2);
      case 'acres':
        return (areaInSquareMeters * 0.000247105).toFixed(4);
      case 'hectares':
        return (areaInSquareMeters * 0.0001).toFixed(4);
      default:
        return areaInSquareMeters.toFixed(2);
    }
  };

  const getUnitLabel = () => {
    switch (unit) {
      case 'sqft':
        return 'sq ft';
      case 'sqm':
        return 'sq m';
      case 'acres':
        return 'acres';
      case 'hectares':
        return 'hectares';
      default:
        return 'sq m';
    }
  };

  const clearShape = () => {
    setPolygonCoordinates([]);
    setArea(0);
    setIsDrawing(false);
  };

  const handleSaveArea = async () => {
    if (!selectedJob || !areaName.trim() || area === 0) {
      Alert.alert('Error', 'Please select a job, enter an area name, and draw an area first.');
      return;
    }

    if (polygonCoordinates.length < 3) {
      Alert.alert('Error', 'Please draw a valid shape with at least 3 points.');
      return;
    }

    try {
      const shapeData = {
        type: 'polygon',
        path: polygonCoordinates,
        center: {
          latitude: region.latitude,
          longitude: region.longitude,
        },
      };

      const res = await fetch(`${BASE_URL}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        Alert.alert('Success', 'Area saved successfully', [
          {
            text: 'OK',
            onPress: () => {
              setShowSaveForm(false);
              clearShape();
              navigation.navigate('JobDetails', {
                jobId: selectedJob,
                customerId: selectedCustomer,
              });
            },
          },
        ]);
      } else {
        const errorData = await res.json();
        Alert.alert('Error', 'Failed to save area: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving area:', err);
      Alert.alert('Error', 'Error saving area: ' + err.message);
    }
  };

  const undoLastPoint = () => {
    if (polygonCoordinates.length > 0) {
      setPolygonCoordinates(polygonCoordinates.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Area Calculator</Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={onMapPress}
        mapType="satellite"
      >
        {polygonCoordinates.length >= 3 && (
          <Polygon
            coordinates={polygonCoordinates}
            fillColor="rgba(77, 163, 162, 0.3)"
            strokeColor="#234848"
            strokeWidth={2}
          />
        )}
        
        {polygonCoordinates.map((coord, index) => (
          <Circle
            key={index}
            center={coord}
            radius={2}
            fillColor={colors.primary}
            strokeColor={colors.dark}
            strokeWidth={1}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Area Display */}
        <View style={styles.areaDisplay}>
          <Text style={styles.areaLabel}>Area</Text>
          <Text style={styles.areaValue}>
            {area > 0 ? convertArea(area) : '0'} {getUnitLabel()}
          </Text>
        </View>

        {/* Drawing Controls */}
        <View style={styles.buttonRow}>
          {!isDrawing ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setIsDrawing(true)}
            >
              <Text style={styles.primaryButtonText}>Start Drawing</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { flex: 1 }]}
                onPress={undoLastPoint}
              >
                <Text style={styles.secondaryButtonText}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { flex: 1, marginLeft: 8 }]}
                onPress={() => setIsDrawing(false)}
              >
                <Text style={styles.primaryButtonText}>Finish</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Unit Selection */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Unit:</Text>
          <View style={styles.pickerWrapper}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert('Select Unit', '', [
                  { text: 'Square Feet', onPress: () => setUnit('sqft') },
                  { text: 'Square Meters', onPress: () => setUnit('sqm') },
                  { text: 'Acres', onPress: () => setUnit('acres') },
                  { text: 'Hectares', onPress: () => setUnit('hectares') },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Text style={styles.pickerButtonText}>{getUnitLabel()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { flex: 1 }]}
            onPress={clearShape}
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
          {area > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setShowSaveForm(true)}
            >
              <Text style={styles.primaryButtonText}>💾 Save to Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Save Form Modal */}
      <Modal
        visible={showSaveForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Save Area to Job</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Area Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Front Yard, Driveway"
                  placeholderTextColor={colors.mediumGray}
                  value={areaName}
                  onChangeText={setAreaName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Customer</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => {
                    if (customers.length === 0) {
                      Alert.alert('No Customers', 'Please add a customer first');
                      return;
                    }
                    Alert.alert(
                      'Select Customer',
                      '',
                      [
                        ...customers.map((customer) => ({
                          text: customer.name,
                          onPress: () => handleCustomerChange(customer.id.toString()),
                        })),
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.formInputText}>
                    {selectedCustomer
                      ? customers.find((c) => c.id.toString() === selectedCustomer)?.name
                      : 'Select a customer'}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedCustomer && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Job</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => {
                      if (jobs.length === 0) {
                        Alert.alert('No Jobs', 'Please add a job for this customer first');
                        return;
                      }
                      Alert.alert(
                        'Select Job',
                        '',
                        [
                          ...jobs.map((job) => ({
                            text: job.name,
                            onPress: () => setSelectedJob(job.id.toString()),
                          })),
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.formInputText}>
                      {selectedJob
                        ? jobs.find((j) => j.id.toString() === selectedJob)?.name
                        : 'Select a job'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowSaveForm(false);
                    setAreaName('');
                    setSelectedCustomer('');
                    setSelectedJob('');
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleSaveArea}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Drawing Instructions */}
      {isDrawing && (
        <View style={styles.instructionsBanner}>
          <Text style={styles.instructionsText}>Tap on the map to add points</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    backgroundColor: colors.dark,
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: colors.secondary,
    fontSize: 16,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: colors.secondary,
    fontSize: 12,
  },
  map: {
    flex: 1,
  },
  controls: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  areaDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  areaLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  areaValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.darkText,
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
    marginRight: 12,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.darkText,
  },
  instructionsBanner: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  instructionsText: {
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkText,
  },
  formInputText: {
    fontSize: 16,
    color: colors.darkText,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalButtonSubmit: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextCancel: {
    color: colors.darkText,
    fontWeight: '600',
    fontSize: 16,
  },
});

