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

export default function JobMaterials({ route, navigation, user, setUser }) {
  const { jobId, customerId } = route.params;
  const [materials, setMaterials] = useState([]);
  const [jobName, setJobName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    material_name: '',
    description: '',
    quantity: '',
    unit: '',
    unit_cost: '',
    status: 'needed',
    location: '',
    supplier: '',
    notes: '',
  });
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (user?.id && jobId) {
      fetchMaterials();
      fetchJobName();
    }
  }, [user?.id, jobId]);

  useEffect(() => {
    const total = materials.reduce((sum, material) => sum + (parseFloat(material.total_cost) || 0), 0);
    setTotalCost(total);
  }, [materials]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`${BASE_URL}/materials/job/${jobId}/${user.id}`);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      Alert.alert('Error', 'Could not load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobName = async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/${user.id}`);
      const data = await res.json();
      setJobName(data.name || 'Job');
    } catch (err) {
      console.error('Error fetching job name:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      material_name: '',
      description: '',
      quantity: '',
      unit: '',
      unit_cost: '',
      status: 'needed',
      location: '',
      supplier: '',
      notes: '',
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
      description: material.description || '',
      quantity: material.quantity?.toString() || '',
      unit: material.unit || '',
      unit_cost: material.unit_cost?.toString() || '',
      status: material.status || 'needed',
      location: material.location || '',
      supplier: material.supplier || '',
      notes: material.notes || '',
    });
    setEditingMaterial(material);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.material_name.trim() || !formData.quantity) {
      Alert.alert('Error', 'Please enter material name and quantity');
      return;
    }

    const payload = {
      ...formData,
      user_id: user.id,
      job_id: parseInt(jobId),
      customer_id: parseInt(customerId),
    };

    try {
      if (editingMaterial) {
        const res = await fetch(`${BASE_URL}/materials/${editingMaterial.id}/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchMaterials();
          setShowAddForm(false);
          resetForm();
        }
      } else {
        const res = await fetch(`${BASE_URL}/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchMaterials();
          setShowAddForm(false);
          resetForm();
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not save material');
      console.error(err);
    }
  };

  const handleDelete = async (materialId) => {
    Alert.alert('Delete Material', 'Are you sure you want to delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/materials/${materialId}/${user.id}/${jobId}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              await fetchMaterials();
            }
          } catch (err) {
            Alert.alert('Error', 'Could not delete material');
            console.error(err);
          }
        },
      },
    ]);
  };

  const handleStatusChange = async (material, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/materials/${material.id}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update status');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered':
        return colors.warning;
      case 'in_transit':
        return colors.secondary;
      case 'delivered':
        return colors.primary;
      case 'installed':
        return colors.dark;
      default:
        return colors.error;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {jobName}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Total Cost Banner */}
      <View style={styles.totalBanner}>
        <View>
          <Text style={styles.totalLabel}>Total Material Cost</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Add Material</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {materials.length === 0 ? (
          <Text style={styles.emptyText}>No materials yet. Click "Add Material" to get started!</Text>
        ) : (
          materials.map((material) => (
            <View key={material.id} style={styles.materialCard}>
              <View style={styles.materialHeader}>
                <Text style={styles.materialName}>{material.material_name}</Text>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(material.status) }]}
                  onPress={() => {
                    Alert.alert('Change Status', 'Select status', [
                      { text: 'Needed', onPress: () => handleStatusChange(material, 'needed') },
                      { text: 'Ordered', onPress: () => handleStatusChange(material, 'ordered') },
                      { text: 'In Transit', onPress: () => handleStatusChange(material, 'in_transit') },
                      { text: 'Delivered', onPress: () => handleStatusChange(material, 'delivered') },
                      { text: 'Installed', onPress: () => handleStatusChange(material, 'installed') },
                      { text: 'Cancel', style: 'cancel' },
                    ]);
                  }}
                >
                  <Text style={styles.statusBadgeText}>{material.status.replace('_', ' ')}</Text>
                </TouchableOpacity>
              </View>

              {material.description && (
                <Text style={styles.materialDescription}>{material.description}</Text>
              )}

              <View style={styles.materialDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>
                    {material.quantity} {material.unit || 'units'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit Cost:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(material.unit_cost)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Cost:</Text>
                  <Text style={[styles.detailValue, styles.totalCostText]}>
                    {formatCurrency(material.total_cost)}
                  </Text>
                </View>
                {material.location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{material.location}</Text>
                  </View>
                )}
                {material.supplier && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Supplier:</Text>
                    <Text style={styles.detailValue}>{material.supplier}</Text>
                  </View>
                )}
              </View>

              <View style={styles.materialActions}>
                <TouchableOpacity
                  style={styles.editMaterialButton}
                  onPress={() => handleEdit(material)}
                >
                  <Text style={styles.editMaterialButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteMaterialButton}
                  onPress={() => handleDelete(material.id)}
                >
                  <Text style={styles.deleteMaterialButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Material Modal */}
      <Modal
        visible={showAddForm}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Material Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 2x4 Lumber, Concrete"
                  placeholderTextColor={colors.mediumGray}
                  value={formData.material_name}
                  onChangeText={(text) => setFormData({ ...formData, material_name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Additional details"
                  placeholderTextColor={colors.mediumGray}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={colors.mediumGray}
                    value={formData.quantity}
                    onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Unit</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., pieces"
                    placeholderTextColor={colors.mediumGray}
                    value={formData.unit}
                    onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Unit Cost</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.mediumGray}
                  value={formData.unit_cost}
                  onChangeText={(text) => setFormData({ ...formData, unit_cost: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Shop, On Site, etc."
                  placeholderTextColor={colors.mediumGray}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Supplier</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Supplier name"
                  placeholderTextColor={colors.mediumGray}
                  value={formData.supplier}
                  onChangeText={(text) => setFormData({ ...formData, supplier: text })}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.modalButtonText}>
                    {editingMaterial ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  totalBanner: {
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    color: colors.mediumGray,
    fontSize: 14,
    textAlign: 'center',
    padding: 40,
  },
  materialCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkText,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  materialDescription: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 12,
  },
  materialDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  detailValue: {
    fontSize: 14,
    color: colors.darkText,
    fontWeight: '500',
  },
  totalCostText: {
    fontWeight: '700',
    color: colors.primary,
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editMaterialButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editMaterialButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  deleteMaterialButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.error,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteMaterialButtonText: {
    color: colors.error,
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
    maxHeight: '90%',
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
  formRow: {
    flexDirection: 'row',
    marginBottom: 0,
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
  textArea: {
    minHeight: 80,
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

