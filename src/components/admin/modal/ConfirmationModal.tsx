import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  BlockIcon,
  WarnIcon,
  SuspendIcon,
  DeleteIcon,
  ApproveIcon,
  RejectIcon,
} from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export type ConfirmationModalType =
  | 'blockPost'
  | 'sendWarning'
  | 'suspendUser'
  | 'deleteUser'
  | 'approveProduct'
  | 'rejectProduct';

interface ConfirmationModalProps {
  visible: boolean;
  type: ConfirmationModalType;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const MODAL_CONFIG: Record<
  ConfirmationModalType,
  {
    iconBgColor: string;
    IconComponent: React.ComponentType<{ size?: number; color?: string }>;
    title: string;
    descriptionTemplate: (name: string) => { before: string; name: string; after: string };
    confirmText: string;
    confirmButtonColor: string;
  }
> = {
  blockPost: {
    iconBgColor: Colors.adminErrorRed,
    IconComponent: BlockIcon,
    title: 'Block Post',
    descriptionTemplate: name => ({
      before: 'Are you sure you want to block this post by ',
      name,
      after: '? This will hide it from all users.',
    }),
    confirmText: 'Block Post',
    confirmButtonColor: Colors.adminErrorRed,
  },
  sendWarning: {
    iconBgColor: Colors.adminWarningYellow,
    IconComponent: WarnIcon,
    title: 'Send Warning',
    descriptionTemplate: name => ({
      before: 'Send a warning to ',
      name,
      after:
        ' for this post? This will notify them about violating community guidelines.',
    }),
    confirmText: 'Send Warning',
    confirmButtonColor: Colors.adminWarningYellow,
  },
  suspendUser: {
    iconBgColor: Colors.adminWarningYellow,
    IconComponent: SuspendIcon,
    title: 'Suspend User',
    descriptionTemplate: name => ({
      before: 'Are you sure you want to suspend ',
      name,
      after: '? They will be unable to access their account.',
    }),
    confirmText: 'Suspend',
    confirmButtonColor: Colors.adminWarningYellow,
  },
  deleteUser: {
    iconBgColor: Colors.adminErrorRed,
    IconComponent: DeleteIcon,
    title: 'Delete User',
    descriptionTemplate: name => ({
      before: 'Are you sure you want to permanently delete ',
      name,
      after: '? This action cannot be undone.',
    }),
    confirmText: 'Delete',
    confirmButtonColor: Colors.adminErrorRed,
  },
  approveProduct: {
    iconBgColor: Colors.adminSuccessGreen,
    IconComponent: ApproveIcon,
    title: 'Approve Product',
    descriptionTemplate: name => ({
      before: 'Are you sure you want to approve ',
      name,
      after: '? It will be available for sale.',
    }),
    confirmText: 'Approve',
    confirmButtonColor: Colors.adminSuccessGreen,
  },
  rejectProduct: {
    iconBgColor: Colors.adminErrorRed,
    IconComponent: RejectIcon,
    title: 'Reject Product',
    descriptionTemplate: name => ({
      before: 'Are you sure you want to reject ',
      name,
      after: '? It will be marked as rejected.',
    }),
    confirmText: 'Reject',
    confirmButtonColor: Colors.adminErrorRed,
  },
};

export function ConfirmationModal({
  visible,
  type,
  entityName,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const config = MODAL_CONFIG[type];
  const { IconComponent } = config;
  const description = config.descriptionTemplate(entityName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityRole="button"
        />
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: config.iconBgColor },
            ]}
          >
            <IconComponent size={UtilityMethods.wp(12)} color={Colors.white} />
          </View>

          <Text style={styles.title}>{config.title}</Text>

          <Text style={styles.description}>
            {description.before}
            <Text style={styles.boldText}>{description.name}</Text>
            {description.after}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: config.confirmButtonColor },
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{config.confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: UtilityMethods.wp(5),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(4),
    padding: UtilityMethods.wp(5),
    width: '100%',
    maxWidth: UtilityMethods.wp(90),
    alignItems: 'center',
  },
  iconCircle: {
    width: UtilityMethods.wp(20),
    height: UtilityMethods.wp(20),
    borderRadius: UtilityMethods.wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    fontSize: FontSize.VALUE(20),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '400',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: FontSize.VALUE(22),
    marginBottom: UtilityMethods.hp(2.5),
  },
  boldText: {
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: UtilityMethods.wp(3),
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.white,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  cancelButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.adminInactiveGrey,
  },
});
