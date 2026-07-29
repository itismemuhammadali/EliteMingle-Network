import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { PaperPlaneIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface HelpSendMessageFormProps {
  onSend?: (payload: { subject: string; message: string }) => void;
}

export function HelpSendMessageForm({ onSend }: HelpSendMessageFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSend?.({ subject, message });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Send us a Message</Text>
      <Text style={styles.hint}>
        We&apos;ll get back to you within 24 hours
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you need help with?"
          placeholderTextColor={Colors.placeholderGrey}
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue or question..."
          placeholderTextColor={Colors.placeholderGrey}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSend}
        activeOpacity={0.7}
      >
        <PaperPlaneIcon size={UtilityMethods.wp(5)} color={Colors.white} />
        <Text style={styles.sendButtonText}>Send Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(2),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  hint: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(2),
  },
  field: {
    marginBottom: UtilityMethods.hp(2),
  },
  label: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.75),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
    fontSize: FontSize.VALUE(15),
    color: Colors.textDark,
  },
  textArea: {
    minHeight: UtilityMethods.hp(14),
    paddingTop: UtilityMethods.hp(1.5),
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
  },
  sendButtonText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
});
