import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import Google from '../../../assets/svgs/GoogleIcon.svg';
import Apple from '../../../assets/svgs/AppleIcon.svg';

type SocialProvider = 'google' | 'apple';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const providerConfig: Record<
  SocialProvider,
  { icon: string; label: string; iconColor?: string }
> = {
  google: {
    icon: 'google',
    label: 'Continue with Google',
  },
  apple: {
    icon: 'apple',
    label: 'Continue with Apple',
  },
};

export function SocialLoginButton({
  provider,
  onPress,
}: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {provider === 'google' ? <Google /> : <Apple />}
      <Text style={styles.text}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    gap: UtilityMethods.wp(3),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(1.5),
  },
  icon: {
    marginRight: UtilityMethods.wp(2),
  },
  text: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '500',
    color: Colors.textDark,
  },
});
