import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface Props {
  text: string;
}

const DescriptionText: React.FC<Props> = ({ text }) => {
  return <Text style={styles.description}>{text}</Text>;
};

const styles = StyleSheet.create({
  description: {
    fontSize: FontSize.VALUE(14),
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: UtilityMethods.hp(3),
    marginTop: UtilityMethods.hp(1),
    marginBottom: UtilityMethods.hp(1),
  },
});

export default DescriptionText;
