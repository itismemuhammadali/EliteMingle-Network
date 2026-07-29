import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface AddUserPendingNoteProps {
  /** Override default copy */
  message?: string;
}

const DEFAULT_MESSAGE =
  "The new user will be created with 'Pending' status and will need approval before accessing the system.";

export function AddUserPendingNote({
  message = DEFAULT_MESSAGE,
}: AddUserPendingNoteProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.bold}>Note:</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#EFF6FF',
    borderRadius: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(3),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: UtilityMethods.hp(2),
  },
  text: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: '#1E40AF',
    lineHeight: FontSize.VALUE(19),
  },
  bold: {
    fontWeight: '700',
    color: '#1E40AF',
  },
});
