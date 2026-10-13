import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserSearchIcon } from './icons';

export interface UserMessageSearchBarProps extends Omit<TextInputProps, 'style'> {
  value?: string;
  onChangeText?: (text: string) => void;
}

/**
 * Messages search: white field, light grey border, rounded corners (matches design).
 */
export function UserMessageSearchBar({
  placeholder = 'Search messages...',
  value,
  onChangeText,
  editable = true,
  ...rest
}: UserMessageSearchBarProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(3),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.5),
        marginHorizontal: UtilityMethods.wp(5),
        marginTop: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(1.75),
      },
      input: {
        flex: 1,
        marginLeft: UtilityMethods.wp(2.5),
        paddingVertical: 0,
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <UserSearchIcon
        size={UtilityMethods.wp(4.5)}
        color={Colors.placeholderGrey}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholderGrey}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        returnKeyType="search"
        {...rest}
      />
    </View>
  );
}
