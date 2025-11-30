import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BASE_URL } from '../config/config';
import { colors } from '../styles/colors';

export default function JobDetails({ route, navigation, user, setUser }) {
  const { jobId, customerId } = route.params;
  const [job, setJob] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedAreas, setSavedAreas] = useState([]);

  useEffect(() => {
    if (user?.id && jobId) {
      fetchJobDetails();
      fetchCustomerName();
      fetchSavedAreas();
    }
  }, [user?.id, jobId]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`);
      const data = await res.json();
      setJob(data);
      setEditedJob(data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      Alert.alert('Error', 'Could not load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerName = async () => {
    try {
      const res = await fetch(`${BASE_URL}/customers/${user.id}`);
      const data = await res.json();
      const customer = data.find((c) => c.id === parseInt(customerId));
      setCustomerName(customer?.name || 'Customer');
    } catch (err) {
      console.error('Error fetching customer name:', err);
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
      console.error('Error fetching saved areas:', err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedJob),
      });

      if (res.ok) {
        setJob(editedJob);
        setIsEditing(false);
        Alert.alert('Success', 'Job updated successfully');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update job');
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    setEditedJob({ ...editedJob, [field]: value });
  };

  const formatCurrency = (value) => {
    if (!value) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {job.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.materialsButton}
            onPress={() =>
              navigation.navigate('JobMaterials', {
                jobId,
                customerId,
              })
            }
          >
            <Text style={styles.materialsButtonText}>📦 Materials</Text>
          </TouchableOpacity>

          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit Job</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditedJob(job);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            {isEditing ? (
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => {
                    // Would show picker modal here
                    Alert.alert('Status', 'Select status', [
                      { text: 'Pending', onPress: () => handleChange('status', 'pending') },
                      {
                        text: 'In Progress',
                        onPress: () => handleChange('status', 'in_progress'),
                      },
                      { text: 'Completed', onPress: () => handleChange('status', 'completed') },
                      { text: 'Cancelled', onPress: () => handleChange('status', 'cancelled') },
                      { text: 'Cancel', style: 'cancel' },
                    ]);
                  }}
                >
                  <Text style={styles.pickerText}>
                    {editedJob.status?.replace('_', ' ') || 'pending'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.value}>{job.status?.replace('_', ' ') || 'pending'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedJob.description || ''}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Job description"
                placeholderTextColor={colors.mediumGray}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.value}>{job.description || 'No description'}</Text>
            )}
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Quote Amount</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedJob.quote_amount?.toString() || ''}
                onChangeText={(text) => handleChange('quote_amount', text)}
                placeholder="0.00"
                placeholderTextColor={colors.mediumGray}
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.value}>{formatCurrency(job.quote_amount)}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Budget</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedJob.budget?.toString() || ''}
                onChangeText={(text) => handleChange('budget', text)}
                placeholder="0.00"
                placeholderTextColor={colors.mediumGray}
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.value}>{formatCurrency(job.budget)}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Actual Cost</Text>
            <Text style={styles.value}>{formatCurrency(job.actual_cost)}</Text>
          </View>
        </View>

        {/* Calculated Areas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calculated Areas</Text>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => navigation.navigate('AreaCalculator')}
            >
              <Text style={styles.toolButtonText}>📐 Calculator</Text>
            </TouchableOpacity>
          </View>
          {savedAreas.length > 0 ? (
            <View style={styles.areasGrid}>
              {savedAreas.map((area) => (
                <View key={area.id} style={styles.areaCard}>
                  <Text style={styles.areaCardName}>{area.area_name}</Text>
                  <Text style={styles.areaCardValue}>
                    {parseFloat(area.area_value).toFixed(2)}
                  </Text>
                  <Text style={styles.areaCardUnit}>{area.unit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No areas calculated yet. Use the Area Calculator tool to add measurements.
            </Text>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Contact Person</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedJob.contact_person || ''}
                onChangeText={(text) => handleChange('contact_person', text)}
                placeholder="Contact name"
                placeholderTextColor={colors.mediumGray}
              />
            ) : (
              <Text style={styles.value}>{job.contact_person || 'Not provided'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Contact Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedJob.contact_phone || ''}
                onChangeText={(text) => handleChange('contact_phone', text)}
                placeholder="Phone number"
                placeholderTextColor={colors.mediumGray}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{job.contact_phone || 'Not provided'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Job Site Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedJob.job_site_address || ''}
                onChangeText={(text) => handleChange('job_site_address', text)}
                placeholder="Job site address"
                placeholderTextColor={colors.mediumGray}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.value}>{job.job_site_address || 'Not provided'}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
  header: {
    backgroundColor: colors.dark,
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
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
  content: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  materialsButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  materialsButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  editActions: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.darkText,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: colors.darkText,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.darkText,
  },
  textArea: {
    minHeight: 80,
  },
  pickerContainer: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
  },
  picker: {
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: colors.darkText,
    textTransform: 'capitalize',
  },
  toolButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toolButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  areaCard: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minWidth: '47%',
    flexGrow: 1,
  },
  areaCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: 4,
  },
  areaCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  areaCardUnit: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  emptyText: {
    color: colors.mediumGray,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});

