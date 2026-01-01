import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BASE_URL } from '../config/config';
import { colors } from '../styles/colors';

export default function CustomerJobs({ route, navigation, user, setUser }) {
  const { customerId } = route.params;
  const [jobs, setJobs] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');

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
      console.error('Error fetching jobs:', err);
      Alert.alert('Error', 'Could not load jobs');
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

  const handleAddJob = async () => {
    if (!newJobName.trim()) {
      Alert.alert('Error', 'Please enter a job name');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customer_id: parseInt(customerId),
          name: newJobName.trim(),
          description: newJobDescription.trim() || null,
          status: 'pending',
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setJobs([
          {
            id: data.jobId,
            name: data.name,
            description: newJobDescription.trim() || null,
            status: 'pending',
          },
          ...jobs,
        ]);
        setShowAddJobForm(false);
        setNewJobName('');
        setNewJobDescription('');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not add job');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      default:
        return colors.warning;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          <Text style={styles.headerTitle}>{customerName}</Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jobs</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddJobForm(true)}>
              <Text style={styles.addButtonText}>+ Add Job</Text>
            </TouchableOpacity>
          </View>

          {jobs.length === 0 ? (
            <Text style={styles.emptyText}>No jobs yet. Click "Add Job" to create one!</Text>
          ) : (
            <View style={styles.jobsList}>
              {jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() =>
                    navigation.navigate('JobDetails', {
                      jobId: job.id,
                      customerId: customerId,
                    })
                  }
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobCardTitle}>{job.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(job.status) },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {job.status?.replace('_', ' ') || 'pending'}
                      </Text>
                    </View>
                  </View>
                  {job.description && (
                    <Text style={styles.jobCardDescription}>{job.description}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Job Modal */}
      <Modal
        visible={showAddJobForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddJobForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Job</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Job name"
              placeholderTextColor={colors.mediumGray}
              value={newJobName}
              onChangeText={setNewJobName}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.mediumGray}
              value={newJobDescription}
              onChangeText={setNewJobDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddJobForm(false);
                  setNewJobName('');
                  setNewJobDescription('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleAddJob}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkText,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkText,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  jobCardDescription: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  emptyText: {
    color: colors.mediumGray,
    fontSize: 14,
    textAlign: 'center',
    padding: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextArea: {
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
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

