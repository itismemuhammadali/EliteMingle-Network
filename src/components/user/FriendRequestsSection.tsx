import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import {
  subscribeToPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../services/friendService';

type PendingRequest = {
  requestId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
};

function initials(name?: string | null): string {
  const safe = (name || '').trim();
  if (!safe) return 'U';
  return (
    safe
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  );
}

const AVATAR = UtilityMethods.wp(12);

export function FriendRequestsSection() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;
    const unsubscribe = subscribeToPendingRequests(uid, list => {
      setRequests(list as PendingRequest[]);
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = useCallback(async (req: PendingRequest) => {
    setBusyId(req.requestId);
    try {
      await acceptFriendRequest(req.requestId);
    } catch (err) {
      console.error('Accept request failed:', err);
      Alert.alert('Error', 'Could not accept the request. Try again.');
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleReject = useCallback(async (req: PendingRequest) => {
    setBusyId(req.requestId);
    try {
      await declineFriendRequest(req.requestId, true);
    } catch (err) {
      console.error('Reject request failed:', err);
      Alert.alert('Error', 'Could not reject the request. Try again.');
    } finally {
      setBusyId(null);
    }
  }, []);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        marginBottom: UtilityMethods.hp(1),
      },
      heading: {
        paddingHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(1),
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(1.25),
        marginHorizontal: UtilityMethods.wp(5),
      },
      avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        backgroundColor: Colors.inputBackground,
        marginRight: UtilityMethods.wp(3),
      },
      avatarFallback: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        marginRight: UtilityMethods.wp(3),
      },
      avatarInitials: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(13),
      },
      info: {
        flex: 1,
        minWidth: 0,
      },
      name: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
      },
      sub: {
        marginTop: UtilityMethods.hp(0.25),
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      actions: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      acceptBtn: {
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.85),
        borderRadius: UtilityMethods.wp(2),
        backgroundColor: Colors.primaryPurple,
        marginRight: UtilityMethods.wp(2),
      },
      acceptText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(13),
      },
      rejectBtn: {
        paddingHorizontal: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(0.85),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      rejectText: {
        color: Colors.textGrey,
        fontWeight: '600',
        fontSize: FontSize.VALUE(13),
      },
      disabled: {
        opacity: 0.5,
      },
    }),
  );

  if (requests.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{`Friend Requests (${requests.length})`}</Text>
      {requests.map(req => {
        const busy = busyId === req.requestId;
        const avatarOk =
          !!req.senderAvatar && String(req.senderAvatar).startsWith('http');
        return (
          <View key={req.requestId} style={styles.card}>
            {avatarOk ? (
              <Image
                source={{ uri: req.senderAvatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {initials(req.senderName)}
                </Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {req.senderName}
              </Text>
              <Text style={styles.sub}>wants to be your friend</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.acceptBtn, busy && styles.disabled]}
                onPress={() => handleAccept(req)}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectBtn, busy && styles.disabled]}
                onPress={() => handleReject(req)}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
