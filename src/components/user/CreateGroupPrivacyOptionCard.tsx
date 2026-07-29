import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import type { CreateGroupPrivacy } from '../../constants/createGroupPrivacy';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import CreateGroupGlobeWhite from '../../assets/Icons/createGroupGlobeWhite.svg';
import CreateGroupGlobeMuted from '../../assets/Icons/createGroupGlobeMuted.svg';
import CreateGroupLockWhite from '../../assets/Icons/createGroupLockWhite.svg';
import CreateGroupLockMuted from '../../assets/Icons/createGroupLockMuted.svg';
import CreateGroupLockFooter from '../../assets/Icons/createGroupLockFooter.svg';

const PURPLE = Colors.userActiveTabPurple;
const LAVENDER_BG = '#FAFAFA';
const LAVENDER_BORDER = '#E8D5F5';

const AVATAR_PLACEHOLDERS = ['#CE93D8', '#90CAF9', '#A5D6A7'];
const AVATAR_OVERLAP = UtilityMethods.wp(2);

const ICON_MAIN = UtilityMethods.wp(6.5);
const FOOTER_LOCK = UtilityMethods.wp(4);

export interface CreateGroupPrivacyOptionCardProps {
  variant: CreateGroupPrivacy;
  selected: boolean;
  onPress: () => void;
  /** Omit bottom margin (e.g. last card before preview). */
  isLast?: boolean;
}

export function CreateGroupPrivacyOptionCard({
  variant,
  selected,
  onPress,
  isLast,
}: CreateGroupPrivacyOptionCardProps) {
  const isPublic = variant === 'public';

  const iconBg = selected ? PURPLE : '#E8E8E8';

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        borderRadius: UtilityMethods.wp(3.5),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.85),
        marginBottom: UtilityMethods.hp(1.5),
      },
      cardLast: {
        marginBottom: 0,
      },
      cardSelected: {
        borderWidth: 1.5,
        borderColor: LAVENDER_BORDER,
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
          default: {},
        }),
      },
      cardUnselected: {
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      cardSelectedBg: {
        backgroundColor: Colors.white,
      },
      checkWrap: {
        position: 'absolute',
        top: UtilityMethods.hp(1.5),
        right: UtilityMethods.wp(3),
        zIndex: 2,
      },
      checkmark: {
        fontSize: FontSize.VALUE(22),
        color: PURPLE,
        fontWeight: '400',
      },
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: UtilityMethods.wp(7),
      },
      iconSquare: {
        width: UtilityMethods.wp(14),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(2.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      textCol: {
        flex: 1,
        minWidth: 0,
      },
      title: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.65),
      },
      body: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        lineHeight: FontSize.VALUE(19),
      },
      footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: UtilityMethods.hp(1.5),
      },
      avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: UtilityMethods.wp(2),
      },
      avatarDot: {
        width: UtilityMethods.wp(6),
        height: UtilityMethods.wp(6),
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 2,
        borderColor: Colors.white,
      },
      avatarDotOverlap: {
        marginLeft: -AVATAR_OVERLAP,
      },
      footerNote: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
        fontWeight: '400',
      },
      footerNotePrivate: {
        marginLeft: UtilityMethods.wp(1),
      },
    }),
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
        selected && styles.cardSelectedBg,
        isLast && styles.cardLast,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={isPublic ? 'Public group' : 'Private group'}
    >
      {selected ? (
        <View style={styles.checkWrap}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
          {isPublic ? (
            selected ? (
              <CreateGroupGlobeWhite width={ICON_MAIN} height={ICON_MAIN} />
            ) : (
              <CreateGroupGlobeMuted width={ICON_MAIN} height={ICON_MAIN} />
            )
          ) : selected ? (
            <CreateGroupLockWhite width={ICON_MAIN} height={ICON_MAIN} />
          ) : (
            <CreateGroupLockMuted width={ICON_MAIN} height={ICON_MAIN} />
          )}
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>
            {isPublic ? 'Public Group' : 'Private Group'}
          </Text>
          <Text style={styles.body}>
            {isPublic
              ? 'Anyone can find and join this group. All posts are visible to everyone.'
              : 'People need your approval to join. Only members can see posts.'}
          </Text>

          {isPublic ? (
            <View style={styles.footerRow}>
              <View style={styles.avatarStack}>
                {AVATAR_PLACEHOLDERS.map((bg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatarDot,
                      i > 0 && styles.avatarDotOverlap,
                      { backgroundColor: bg, zIndex: AVATAR_PLACEHOLDERS.length - i },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.footerNote}>Open to everyone</Text>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <CreateGroupLockFooter width={FOOTER_LOCK} height={FOOTER_LOCK} />
              <Text style={[styles.footerNote, styles.footerNotePrivate]}>
                Approval required
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
