import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import LockIcon from '../../assets/Icons/profile/accountSettings/lock.svg';

export interface UserChangePasswordInfoBannerProps {
  title?: string;
  subtitle?: string;
}

export function UserChangePasswordInfoBanner({
  title = 'Keep your account secure',
  subtitle = "Choose a strong password that you don't use anywhere else",
}: UserChangePasswordInfoBannerProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.changePasswordInfoBg,
        borderWidth: 1,
        borderColor: Colors.changePasswordInfoBorder,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(2.5),
      },
      textCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      title: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.changePasswordInfoTitle,
        marginBottom: UtilityMethods.hp(0.5),
      },
      subtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.changePasswordInfoText,
        lineHeight: FontSize.VALUE(19),
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <LockIcon
        width={UtilityMethods.wp(6)}
        height={UtilityMethods.wp(6)}
        color={Colors.userProfilePurple}
      />
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
