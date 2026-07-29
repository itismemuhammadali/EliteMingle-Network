import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const MAX = 50;

export interface CreateGroupNameFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function CreateGroupNameField({
  value,
  onChangeText,
}: CreateGroupNameFieldProps) {
  const count = value.length;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      section: {
        marginBottom: UtilityMethods.hp(2),
      },
      label: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1),
      },
      input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.5),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
      countLeft: {
        marginTop: UtilityMethods.hp(0.5),
        fontSize: FontSize.VALUE(11),
        color: Colors.placeholderGrey,
        alignSelf: 'flex-start',
      },
    }),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Art Lovers, Book Club, Music Fans"
        placeholderTextColor={Colors.placeholderGrey}
        value={value}
        onChangeText={t => onChangeText(t.slice(0, MAX))}
        maxLength={MAX}
        autoCapitalize="words"
      />
      <Text style={styles.countLeft}>
        {count}/{MAX} characters
      </Text>
    </View>
  );
}
