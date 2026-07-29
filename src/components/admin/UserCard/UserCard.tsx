import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
} from 'react-native';
import {
  EmailIconSmall,
  PhoneIcon,
  EditIcon,
  SuspendIcon,
  ApproveIcon,
  DeleteIcon,
} from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserCardData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: UserStatus;
  avatarColor: string;
  /** Local file URI from device gallery for profile photo */
  avatarUri?: string;
}

interface UserCardProps {
  user: UserCardData;
  onEdit?: (user: UserCardData) => void;
  onSuspend?: (user: UserCardData) => void;
  onApprove?: (user: UserCardData) => void;
  onDelete?: (user: UserCardData) => void;
  style?: ViewStyle;
}

const STATUS_STYLES: Record<
  UserStatus,
  { bg: string; text: string }
> = {
  active: {
    bg: '#D1FAE5',
    text: '#059669',
  },
  inactive: {
    bg: Colors.userStatusInactiveBg,
    text: Colors.userStatusInactiveText,
  },
  pending: {
    bg: '#FED7AA',
    text: '#EA580C',
  },
};

function StatusBadge({ status }: { status: UserStatus }) {
  const style = STATUS_STYLES[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
      <Text style={[styles.statusText, { color: style.text }]}>
        {label}
      </Text>
    </View>
  );
}

export function UserCard({
  user,
  onEdit,
  onSuspend,
  onApprove,
  onDelete,
  style,
}: UserCardProps) {
  const initials = (user?.name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: user.avatarColor },
            ]}
          >
            {user.avatarUri ? (
              <Image
                source={{ uri: user.avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {user.role}
            </Text>
            <View style={styles.contactRow}>
              <EmailIconSmall size={UtilityMethods.wp(3.5)} color={Colors.adminInactiveGrey} />
              <Text style={styles.contactText} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <PhoneIcon size={UtilityMethods.wp(3.5)} color={Colors.adminInactiveGrey} />
              <Text style={styles.contactText} numberOfLines={1}>
                {user.phone}
              </Text>
            </View>
          </View>
        </View>
        <StatusBadge status={user.status} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit?.(user)}
          activeOpacity={0.7}
        >
          <EditIcon size={UtilityMethods.wp(4)} color="#2563EB" />
          <Text style={[styles.actionBtnText, styles.editBtnText]}>Edit</Text>
        </TouchableOpacity>

        {user.status === 'pending' ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => onApprove?.(user)}
            activeOpacity={0.7}
          >
            <ApproveIcon size={UtilityMethods.wp(4)} color="#059669" />
            <Text style={[styles.actionBtnText, styles.approveBtnText]}>Approve</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.suspendBtn]}
            onPress={() => onSuspend?.(user)}
            activeOpacity={0.7}
          >
            <SuspendIcon size={UtilityMethods.wp(4)} color="#EA580C" />
            <Text style={[styles.actionBtnText, styles.suspendBtnText]}>Suspend</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete?.(user)}
          activeOpacity={0.7}
        >
          <DeleteIcon size={UtilityMethods.wp(4)} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: UtilityMethods.hp(2),
  },
  left: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  role: {
    fontSize: FontSize.VALUE(14),
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(1),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1.5),
    marginBottom: UtilityMethods.hp(0.5),
  },
  contactText: {
    fontSize: FontSize.VALUE(13),
    color: Colors.adminInactiveGrey,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: UtilityMethods.wp(2),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1.5),
    paddingVertical: UtilityMethods.hp(1.2),
    borderRadius: UtilityMethods.wp(2),
  },
  editBtn: {
    flex: 0,
    width: 122.97,
    height: 38,
    borderRadius: 10,
    paddingTop: 9,
    paddingRight: 19,
    paddingBottom: 9,
    paddingLeft: 19,
    gap: 8,
    backgroundColor: '#EFF6FF',
  },
  editBtnText: {
    color: '#2563EB',
  },
  suspendBtn: {
    flex: 0,
    width: 122.97,
    height: 38,
    borderRadius: 10,
    paddingTop: 9,
    paddingRight: 19,
    paddingBottom: 9,
    paddingLeft: 19,
    gap: 8,
    backgroundColor: '#FED7AA',
  },
  suspendBtnText: {
    color: '#EA580C',
  },
  approveBtn: {
    flex: 0,
    width: 122.97,
    height: 38,
    borderRadius: 10,
    paddingTop: 9,
    paddingRight: 19,
    paddingBottom: 9,
    paddingLeft: 19,
    gap: 8,
    backgroundColor: '#D1FAE5',
  },
  approveBtnText: {
    color: '#059669',
  },
  deleteBtn: {
    flex: 0,
    width: 39.96332550048828,
    height: 39.47162628173828,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  actionBtnText: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '600',
    color: Colors.white,
  },
});
