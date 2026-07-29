import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export interface PeopleYouMayKnowSectionProps {
  filter: UserFeedFilter;
}

export function PeopleYouMayKnowSection({ filter }: PeopleYouMayKnowSectionProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [firestoreUsers, setFirestoreUsers] = useState<SuggestedPerson[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Hide people the user is already connected to: current friends and anyone
  // with an existing (pending or accepted) friend request in either direction.
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    let friendIds = new Set<string>();
    let outgoingIds = new Set<string>();
    let incomingIds = new Set<string>();
    const recompute = () =>
      setExcludedIds(new Set([...friendIds, ...outgoingIds, ...incomingIds]));
    const active = (status: string) =>
      status === 'pending' || status === 'accepted';

    const unsubFriends = firestore()
      .collection('users')
      .doc(uid)
      .collection('friends')
      .onSnapshot(snap => {
        friendIds = new Set(snap ? snap.docs.map(d => d.id) : []);
        recompute();
      });

    const unsubOutgoing = firestore()
      .collection('friend_requests')
      .where('senderId', '==', uid)
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
      .where('receiverId', '==', uid)
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
  }, []);

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
    }),
  );

  useEffect(() => {
    const currentUid = auth().currentUser?.uid;
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) return;

          // The current user's own interests, for the Interests filter.
          const myDoc = snapshot.docs.find(d => d.id === currentUid);
          const myInterests = new Set(
            ((myDoc?.data()?.interests as string[]) || []).map(x =>
              String(x).toLowerCase(),
            ),
          );

          const usersList: SuggestedPerson[] = snapshot.docs
            .filter(doc => doc.id !== currentUid)
            .map(doc => {
              const data = doc.data();
              const name = data.fullName || data.displayName || data.name || 'User';
              const interests = data.interests || ['Community', 'Social'];
              // If the user has no interests set, don't hide everyone — show all.
              const interestsMatch =
                myInterests.size === 0 ||
                (interests as string[]).some(x =>
                  myInterests.has(String(x).toLowerCase()),
                );
              return {
                id: doc.id,
                name,
                location: data.location || 'San Francisco, CA',
                bio: data.bio || 'Active Community Member',
                avatarUrl: data.profilePicture || data.avatarUri || data.avatarUrl || 'https://i.pravatar.cc/150?img=12',
                mutualFriendsCount: 5,
                interests,
                isOnline: true,
                nearby: true,
                interestsMatch,
              };
            });

          if (usersList.length > 0) {
            setFirestoreUsers(usersList);
          }
        },
        err => console.warn('Firestore users error:', err),
      );

    return () => unsubscribe();
  }, []);

  const basePeople = firestoreUsers.length > 0 ? firestoreUsers : SUGGESTED_PEOPLE;

  const people = useMemo(
    () =>
      filterSuggestedPeople(
        basePeople.filter(p => !excludedIds.has(p.id)),
        filter,
      ),
    [basePeople, excludedIds, filter],
  );

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
      {people.map(person => (
        <PeopleYouMayKnowCard
          key={person.id}
          person={person}
          onMessage={onMessage}
          onProfilePress={onProfilePress}
        />
      ))}
    </View>
  );
}
