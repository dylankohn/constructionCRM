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

export default function Dashboard({ user, setUser, navigation }) {
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

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
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      Alert.alert('Error', 'Could not load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    try {
      const customersRes = await fetch(`${BASE_URL}/customers/${user.id}`);
      const customersData = await customersRes.json();

      if (!Array.isArray(customersData)) return;

      const allJobs = [];
      for (const customer of customersData) {
        const jobsRes = await fetch(`${BASE_URL}/jobs/customer/${customer.id}/${user.id}`);
        const jobsData = await jobsRes.json();

        if (Array.isArray(jobsData)) {
          jobsData.forEach((job) => {
            allJobs.push({
              ...job,
              customerName: customer.name,
            });
          });
        }
      }
      setJobs(allJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      Alert.alert('Error', 'Please enter a customer name');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: newCustomerName.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setCustomers([{ id: data.customerId, name: data.name, user_id: user.id }, ...customers]);
        setShowAddCustomerForm(false);
        setNewCustomerName('');
        fetchAllJobs();
      }
    } catch (err) {
      Alert.alert('Error', 'Could not add customer');
      console.error(err);
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
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Customer Pages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Pages</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddCustomerForm(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {customers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.card}
                onPress={() => navigation.navigate('CustomerJobs', { customerId: customer.id })}
              >
                <Text style={styles.cardText}>{customer.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job Materials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Materials</Text>
          <View style={styles.grid}>
            {jobs.length === 0 ? (
              <Text style={styles.emptyText}>
                No jobs yet. Add a customer and create a job to get started!
              </Text>
            ) : (
              jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('JobMaterials', {
                      jobId: job.id,
                      customerId: job.customer_id,
                    })
                  }
                >
                  <Text style={styles.cardTitle}>{job.name}</Text>
                  <Text style={styles.cardSubtitle}>{job.customerName}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('AreaCalculator')}
          >
            <Text style={styles.toolCardText}>📐 Area Calculator</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Customer Modal */}
      <Modal
        visible={showAddCustomerForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCustomerForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Customer</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Customer name"
              placeholderTextColor={colors.mediumGray}
              value={newCustomerName}
              onChangeText={setNewCustomerName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddCustomerForm(false);
                  setNewCustomerName('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleAddCustomer}
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
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: colors.secondary,
    fontSize: 14,
  },
  usernameText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    minWidth: '47%',
    flexGrow: 1,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  toolCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  toolCardText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.mediumGray,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
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
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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

