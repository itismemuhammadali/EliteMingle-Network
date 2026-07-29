import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import type { UserStatus } from '../UserCard';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

interface EditUserStatusSelectorProps {
  value: UserStatus;
  onChange: (status: UserStatus) => void;
  error?: string;
}

export function EditUserStatusSelector({
  value,
  onChange,
  error,
}: EditUserStatusSelectorProps) {
  const [visible, setVisible] = useState(false);
  const selected = OPTIONS.find(o => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Status</Text>
      <TouchableOpacity
        style={[styles.dropdown, error ? styles.dropdownError : null]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>{selected?.label ?? 'Select'}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            {OPTIONS.map(opt => {
              const isSelected = value === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    onChange(opt.value);
                    setVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: UtilityMethods.hp(2),
  },
  label: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(0.75),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
  },
  dropdownError: {
    borderColor: Colors.adminErrorRed,
  },
  dropdownText: {
    fontSize: FontSize.VALUE(15),
    color: '#4B5563',
  },
  arrow: {
    fontSize: FontSize.VALUE(12),
    color: Colors.adminInactiveGrey,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(2),
    width: '80%',
    overflow: 'hidden',
  },
  option: {
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  optionSelected: {
    backgroundColor: Colors.lightPurple,
  },
  optionText: {
    fontSize: FontSize.VALUE(15),
    color: '#4B5563',
  },
  optionTextSelected: {
    color: Colors.primaryPurple,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FontSize.VALUE(12),
    color: Colors.adminErrorRed,
    marginTop: UtilityMethods.hp(0.5),
  },
});
