import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const MAX = 200;

export interface CreateGroupDescriptionFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function CreateGroupDescriptionField({
  value,
  onChangeText,
}: CreateGroupDescriptionFieldProps) {
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
        minHeight: UtilityMethods.hp(14),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        lineHeight: FontSize.VALUE(20),
      },
      countRight: {
        marginTop: UtilityMethods.hp(0.5),
        fontSize: FontSize.VALUE(11),
        color: Colors.placeholderGrey,
        alignSelf: 'flex-end',
      },
    }),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Group Description</Text>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind? Share your thoughts, experiences, or ideas..."
        placeholderTextColor={Colors.placeholderGrey}
        value={value}
        onChangeText={t => onChangeText(t.slice(0, MAX))}
        maxLength={MAX}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.countRight}>
        {count}/{MAX} characters
      </Text>
    </View>
  );
}
