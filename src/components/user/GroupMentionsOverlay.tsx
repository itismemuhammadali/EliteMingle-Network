import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { getParticipantColor } from '../../utils/chatHelpers';

export interface MentionParticipant {
  id: string;
  name: string;
  avatarUri?: string;
  role?: string;
}

export interface GroupMentionsOverlayProps {
  participants: MentionParticipant[];
  query: string;
  onSelect: (participant: MentionParticipant) => void;
}

export function GroupMentionsOverlay({
  participants,
  query,
  onSelect,
}: GroupMentionsOverlayProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        bottom: '100%',
        left: UtilityMethods.wp(3),
        right: UtilityMethods.wp(3),
        maxHeight: UtilityMethods.hp(25),
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        overflow: 'hidden',
        marginBottom: UtilityMethods.hp(0.5),
        zIndex: 9999,
      },
      header: {
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.8),
        backgroundColor: '#F8FAFC',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      headerTitle: {
        fontSize: FontSize.VALUE(11.5),
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
      },
      item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F1F5F9',
      },
      avatar: {
        width: UtilityMethods.wp(8),
        height: UtilityMethods.wp(8),
        borderRadius: UtilityMethods.wp(4),
        marginRight: UtilityMethods.wp(2.5),
      },
      avatarPlaceholder: {
        width: UtilityMethods.wp(8),
        height: UtilityMethods.wp(8),
        borderRadius: UtilityMethods.wp(4),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(2.5),
      },
      avatarText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
        color: Colors.white,
      },
      infoCol: {
        flex: 1,
        minWidth: 0,
      },
      nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      nameText: {
        fontSize: FontSize.VALUE(13.5),
        fontWeight: '600',
        color: Colors.textDark,
        marginRight: UtilityMethods.wp(1.5),
      },
      roleBadge: {
        fontSize: FontSize.VALUE(10.5),
        fontWeight: '600',
        color: Colors.userProfilePurple,
        backgroundColor: '#EDE9FE',
        paddingHorizontal: UtilityMethods.wp(1.5),
        paddingVertical: UtilityMethods.hp(0.15),
        borderRadius: UtilityMethods.wp(1),
      },
    }),
  );

  const cleanQuery = query.toLowerCase().trim();
  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(cleanQuery),
  );

  if (filtered.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mention a member</Text>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const initial = item.name.charAt(0).toUpperCase() || 'M';
          const bg = getParticipantColor(item.id || item.name);
          return (
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.7}
              onPress={() => onSelect(item)}
            >
              {item.avatarUri ? (
                <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: bg }]}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    @{item.name}
                  </Text>
                  {item.role === 'Admin' || item.role === 'Owner' ? (
                    <Text style={styles.roleBadge}>{item.role}</Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
