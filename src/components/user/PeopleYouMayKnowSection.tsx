import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import type { UserFeedFilter } from '../../constants/userFeedData';
import {
  SUGGESTED_PEOPLE,
  filterSuggestedPeople,
  PEOPLE_YOU_MAY_KNOW_TITLE,
  PEOPLE_YOU_MAY_KNOW_SUBTITLE,
  type SuggestedPerson,
} from '../../constants/userPeopleYouMayKnowData';
import type { UserStackParamList } from '../../navigation/User/types';
import { PeopleYouMayKnowCard } from './PeopleYouMayKnowCard';
import {
  getDistanceKm,
  syncUserLocation,
  type Coordinates,
} from '../../utils/geoHelpers';

export interface PeopleYouMayKnowSectionProps {
  filter: UserFeedFilter;
}

const MAX_RADIUS_KM = 50; // 50 km range (~31 miles)

export function PeopleYouMayKnowSection({ filter }: PeopleYouMayKnowSectionProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [firestoreUsers, setFirestoreUsers] = useState<SuggestedPerson[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const currentUid = auth().currentUser?.uid;

  // Hide people the user is already connected to: current friends and anyone
  // with an existing (pending or accepted) friend request in either direction.
  useEffect(() => {
    if (!currentUid) return;

    let friendIds = new Set<string>();
    let outgoingIds = new Set<string>();
    let incomingIds = new Set<string>();
    const recompute = () =>
      setExcludedIds(new Set([...friendIds, ...outgoingIds, ...incomingIds]));
    const active = (status: string) =>
      status === 'pending' || status === 'accepted';

    const unsubFriends = firestore()
      .collection('users')
      .doc(currentUid)
      .collection('friends')
      .onSnapshot(snap => {
        friendIds = new Set(snap ? snap.docs.map(d => d.id) : []);
        recompute();
      });

    const unsubOutgoing = firestore()
      .collection('friend_requests')
      .where('senderId', '==', currentUid)
      .onSnapshot(snap => {
        outgoingIds = new Set(
          (snap ? snap.docs : [])
            .filter(d => active(d.data().status))
            .map(d => d.data().receiverId),
        );
        recompute();
      });

    const unsubIncoming = firestore()
      .collection('friend_requests')
      .where('receiverId', '==', currentUid)
      .onSnapshot(snap => {
        incomingIds = new Set(
          (snap ? snap.docs : [])
            .filter(d => active(d.data().status))
            .map(d => d.data().senderId),
        );
        recompute();
      });

    return () => {
      unsubFriends();
      unsubOutgoing();
      unsubIncoming();
    };
  }, [currentUid]);

  // Handle GPS location request and sync when Nearby tab is chosen
  const handleRequestLocation = useCallback(async () => {
    if (!currentUid || isLocating) return;
    setIsLocating(true);
    setPermissionDenied(false);
    try {
      const coords = await syncUserLocation(currentUid);
      if (coords) {
        setCurrentCoords(coords);
        setPermissionDenied(false);
      } else {
        setPermissionDenied(true);
      }
    } catch (err) {
      console.warn('Location sync failed:', err);
      setPermissionDenied(true);
    } finally {
      setIsLocating(false);
    }
  }, [currentUid, isLocating]);

  useEffect(() => {
    if (filter === 'nearby' && !currentCoords && !permissionDenied && !isLocating) {
      handleRequestLocation();
    }
  }, [filter, currentCoords, permissionDenied, isLocating, handleRequestLocation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      header: {
        paddingHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(1.5),
      },
      title: {
        fontSize: FontSize.VALUE(20),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.5),
      },
      subtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        lineHeight: FontSize.VALUE(19),
      },
      promptCard: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        padding: UtilityMethods.wp(5),
        marginHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(2),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderGrey,
      },
      promptTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
        textAlign: 'center',
      },
      promptSubtitle: {
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: UtilityMethods.hp(2),
      },
      promptBtn: {
        backgroundColor: Colors.userProfilePurple,
        paddingHorizontal: UtilityMethods.wp(6),
        paddingVertical: UtilityMethods.hp(1.2),
        borderRadius: UtilityMethods.wp(2.5),
      },
      promptBtnText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.white,
      },
      emptyContainer: {
        paddingVertical: UtilityMethods.hp(4),
        paddingHorizontal: UtilityMethods.wp(6),
        alignItems: 'center',
      },
      emptyText: {
        fontSize: FontSize.VALUE(13.5),
        color: Colors.placeholderGrey,
        textAlign: 'center',
        lineHeight: 20,
      },
    }),
  );

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) return;

          // The current user's own interests & coordinates
          const myDoc = snapshot.docs.find(d => d.id === currentUid);
          const myData = myDoc?.data() || {};

          // Store my coordinates if available on doc
          if (myData.coordinates?.latitude && myData.coordinates?.longitude) {
            setCurrentCoords({
              latitude: Number(myData.coordinates.latitude),
              longitude: Number(myData.coordinates.longitude),
            });
          }

          const rawMyInterests = (myData.interests || myData.selectedInterests || []) as string[];
          const myInterests = new Set(
            rawMyInterests.map(x => String(x).toLowerCase()),
          );

          const myCoords = currentCoords || (myData.coordinates?.latitude && myData.coordinates?.longitude
            ? { latitude: Number(myData.coordinates.latitude), longitude: Number(myData.coordinates.longitude) }
            : null);

          const usersList: SuggestedPerson[] = snapshot.docs
            .filter(doc => {
              if (doc.id === currentUid) return false;
              const data = doc.data();
              const role = (data.role || '').toLowerCase();
              return role !== 'admin';
            })
            .map(doc => {
              const data = doc.data();
              const name = data.fullName || data.displayName || data.name || 'Member';
              const rawInterests = (data.interests || data.selectedInterests || []) as string[];
              const interests = rawInterests.length > 0 ? rawInterests : ['Community'];

              const interestsMatch =
                myInterests.size === 0 ||
                interests.some(x => myInterests.has(String(x).toLowerCase()));

              // Calculate distance using GPS coordinates (Haversine 50 km formula)
              let distanceKm: number | undefined;
              let nearby = false;

              if (myCoords && data.coordinates?.latitude && data.coordinates?.longitude) {
                const dist = getDistanceKm(
                  myCoords.latitude,
                  myCoords.longitude,
                  Number(data.coordinates.latitude),
                  Number(data.coordinates.longitude),
                );
                distanceKm = Math.round(dist);
                nearby = dist <= MAX_RADIUS_KM;
              } else if (myData.city && data.city && myData.city.toLowerCase() === data.city.toLowerCase()) {
                // Fallback to same city matching if coordinates not yet populated for one of the devices
                nearby = true;
                distanceKm = 5;
              }

              return {
                id: doc.id,
                name,
                location: data.location || data.city || 'Community Member',
                bio: data.bio || 'Member of EPM4LIFE',
                avatarUrl: data.profilePicture || data.avatarUri || data.avatarUrl || '',
                mutualFriendsCount: 0,
                interests,
                isOnline: data.status === 'Active',
                nearby,
                interestsMatch,
                coordinates: data.coordinates,
                distanceKm,
              };
            });

          if (usersList.length > 0) {
            setFirestoreUsers(usersList);
          }
        },
        err => console.warn('Firestore users error:', err),
      );

    return () => unsubscribe();
  }, [currentUid, currentCoords]);

  const basePeople = firestoreUsers.length > 0 ? firestoreUsers : SUGGESTED_PEOPLE;

  const people = useMemo(() => {
    const filtered = filterSuggestedPeople(
      basePeople.filter(p => !excludedIds.has(p.id)),
      filter,
    );
    if (filter === 'nearby') {
      // Sort by closest distance first
      return [...filtered].sort(
        (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
      );
    }
    return filtered;
  }, [basePeople, excludedIds, filter]);

  const onMessage = useCallback(
    (person: SuggestedPerson) => {
      navigation.navigate('Chat', {
        peerId: person.id,
        peerName: person.name,
        peerAvatarUri: person.avatarUrl,
        statusText: person.isOnline ? 'Online' : 'Offline',
        isOnlineStatus: person.isOnline,
      });
    },
    [navigation],
  );

  const onProfilePress = useCallback(
    (person: SuggestedPerson) => {
      navigation.navigate('OtherUserProfile', { userId: person.id });
    },
    [navigation],
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>{PEOPLE_YOU_MAY_KNOW_TITLE[filter]}</Text>
        <Text style={styles.subtitle}>{PEOPLE_YOU_MAY_KNOW_SUBTITLE[filter]}</Text>
      </View>

      {/* Permission prompt for Nearby filter */}
      {filter === 'nearby' && permissionDenied ? (
        <View style={styles.promptCard}>
          <Text style={styles.promptTitle}>Location Permission Needed</Text>
          <Text style={styles.promptSubtitle}>
            To discover and connect with members within 50 km of you, please grant location access.
          </Text>
          <TouchableOpacity
            style={styles.promptBtn}
            onPress={handleRequestLocation}
            activeOpacity={0.85}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.promptBtnText}>Enable Location</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Loading indicator when acquiring GPS */}
      {filter === 'nearby' && isLocating ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={Colors.userProfilePurple} />
          <Text style={{ marginTop: 8, fontSize: 13, color: Colors.placeholderGrey }}>
            Finding members within 50 km...
          </Text>
        </View>
      ) : null}

      {people.map(person => (
        <PeopleYouMayKnowCard
          key={person.id}
          person={person}
          onMessage={onMessage}
          onProfilePress={onProfilePress}
        />
      ))}

      {people.length === 0 && !isLocating && (!permissionDenied || filter !== 'nearby') ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'nearby'
              ? 'No members found within 50 km of your location yet. New members will appear here as they join!'
              : 'No suggested people found for this filter.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
