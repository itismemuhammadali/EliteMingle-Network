import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import PeopleIcon from '../../assets/Icons/people.svg';
import {
  CREATE_GROUP_CATEGORIES,
  type CreateGroupCategoryId,
} from '../../constants/createGroupCategories';

const PEOPLE_ICON = UtilityMethods.wp(4);
const THUMB = UtilityMethods.wp(22);

export interface CreateGroupPreviewSectionProps {
  groupName: string;
  groupDescription: string;
  coverUri?: string;
  avatarUri?: string;
  selectedCategoryId: CreateGroupCategoryId | null;
}

export function CreateGroupPreviewSection({
  groupName,
  groupDescription,
  coverUri,
  avatarUri,
  selectedCategoryId,
}: CreateGroupPreviewSectionProps) {
  const displayName = groupName.trim() || 'New';
  const displayDesc =
    groupDescription.trim() || 'Create group for my';

  const selectedCategory = selectedCategoryId
    ? CREATE_GROUP_CATEGORIES.find(c => c.id === selectedCategoryId)
    : null;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      outer: {
        borderRadius: UtilityMethods.wp(3),
        marginTop: UtilityMethods.hp(2),
        borderWidth: 1,
        borderColor: '#BEDBFF',
        overflow: 'hidden',
        backgroundColor: '#F4F7FB',
      },
      gradientBg: {
        paddingHorizontal: UtilityMethods.wp(3),
        paddingTop: UtilityMethods.hp(1),
        paddingBottom: UtilityMethods.hp(1.5),
      },
      previewLabel: {
        fontSize: FontSize.VALUE(11),
        fontWeight: '500',
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(0.75),
      },
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(2),
        padding: UtilityMethods.wp(2.5),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.06)',
      },
      cardInner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      thumb: {
        width: UtilityMethods.wp(14),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: Colors.inputBackground,
      },
      thumbEmoji: {
        fontSize: UtilityMethods.wp(7),
      },
      cardText: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      cardName: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.5),
      },
      cardDesc: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        lineHeight: FontSize.VALUE(18),
        marginBottom: UtilityMethods.hp(0.85),
      },
      metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      members: {
        marginLeft: UtilityMethods.wp(1.25),
        fontSize: FontSize.VALUE(12),
        color: Colors.userGroupMemberMeta,
        fontWeight: '400',
      },
    }),
  );

  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={['#F9FAFB', '#EFF6FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <Text style={styles.previewLabel}>Preview:</Text>
        <View style={styles.card}>
          <View style={styles.cardInner}>
            {avatarUri || coverUri ? (
              <Image
                source={{ uri: avatarUri || coverUri }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[selectedCategory?.iconBg || '#9A40BA', '#E91E63']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.thumb}
              >
                {selectedCategory ? (
                  <Text style={styles.thumbEmoji}>{selectedCategory.emoji}</Text>
                ) : (
                  <Text style={styles.thumbEmoji}>🎨</Text>
                )}
              </LinearGradient>
            )}
            <View style={styles.cardText}>
              <Text style={styles.cardName} numberOfLines={2}>
                {displayName}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {displayDesc}
              </Text>
              <View style={styles.metaRow}>
                <PeopleIcon width={PEOPLE_ICON} height={PEOPLE_ICON} />
                <Text style={styles.members}>0 members</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
