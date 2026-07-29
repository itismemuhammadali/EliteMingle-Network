import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { SearchIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface AdminSearchBarProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
}

export function AdminSearchBar({
  placeholder = 'Search by name or email...',
  ...textInputProps
}: AdminSearchBarProps) {
  return (
    <View style={styles.container}>
      <SearchIcon
        size={UtilityMethods.wp(5)}
        color={Colors.adminInactiveGrey}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.adminInactiveGrey}
        {...textInputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
    gap: UtilityMethods.wp(3),
  },
  input: {
    flex: 1,
    fontSize: FontSize.VALUE(16),
    color: Colors.textDark,
    paddingVertical: 0,
  },
});
