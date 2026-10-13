import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/Admin/types';
import MainLayout from '../../../components/general/MainLayout';
import CameraIcon from '../../../assets/Icons/camera.svg';
import PersonIcon from '../../../assets/Icons/person.svg';
import MicrophoneIcon from '../../../assets/svgs/MicrophoneIcon.svg';
import VolumeIcon from '../../../assets/svgs/VolumeIcon.svg';
import EyeAccessibilityIcon from '../../../assets/svgs/EyeAccessibilityIcon.svg';
import { TitleText, Button, TextInputField } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';

type CompleteProfileNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'CompleteProfile'
>;

const INTERESTS = [
  'Art', 'Photography', 'Music', 'Writer', 'Drama',
  'Comedy', 'Thriller', 'Action', 'Romance', 'Sci-Fi',
];

export function CompleteProfileScreen() {
  const navigation = useNavigation<CompleteProfileNavigationProp>();
  const { user, setIsProfileCompleted } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [voiceCommands, setVoiceCommands] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [simplifiedInterface, setSimplifiedInterface] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      if (!name && user.displayName) {
        setName(user.displayName);
      }
      // Attempt to load existing user doc if any
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (typeof (doc as any).exists === 'function' ? doc.exists() : (doc as any).exists) {
            const data = doc.data();
            if (data?.fullName && !name) {
              setName(data.fullName);
            }
            if (data?.bio) setBio(data.bio);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    try {
      if (user?.uid) {
        // Save profile to Firestore
        await firestore().collection('users').doc(user.uid).set(
          {
            uid: user.uid,
            fullName: name,
            displayName: name,
            bio: bio,
            voiceCommands: voiceCommands,
            textToSpeech: textToSpeech,
            simplifiedInterface: simplifiedInterface,
            interests: selectedInterests,
            selectedInterests: selectedInterests,
            profileCompleted: true,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        // Also update Auth profile displayName if changed
        if (name && name !== user.displayName) {
          await user.updateProfile({ displayName: name });
        }
      }

      setIsProfileCompleted(true);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'UserMain' as never }],
        })
      );
    } catch (err: any) {
      console.warn('Error saving profile:', err);
      // Even if Firestore fails, continue navigation for user UX
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'UserMain' as never }],
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/background.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <TitleText style={styles.title}>Complete Your Profile</TitleText>
          <DescriptionText text="Tell us a bit about yourself" />
        </View>

        <Card style={styles.card}>
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoContainer}>
              <View style={styles.photoPlaceholder}>
                <PersonIcon width={60} height={60} />
              </View>
              <View style={styles.cameraIcon}>
                <CameraIcon />
              </View>
            </TouchableOpacity>
            <Text style={styles.uploadText}>Upload profile photo</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInputField
              label=""
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>


          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <View style={styles.bioContainer}>
              <TextInputField
                label=""
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                style={styles.bioInput}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Accessibility Preferences</Text>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIconContainer}>
                <MicrophoneIcon />
              </View>
              <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceTitle}>Voice Commands</Text>
                <Text style={styles.preferenceSubtitle}>Control the app with your voice</Text>
              </View>
              <Switch
                value={voiceCommands}
                onValueChange={setVoiceCommands}
                trackColor={{ false: '#E0E0E0', true: Colors.lightPurple }}
                thumbColor={voiceCommands ? Colors.primaryPurple : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIconContainer}>
                <VolumeIcon />
              </View>
              <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceTitle}>Text-to-Speech</Text>
                <Text style={styles.preferenceSubtitle}>Hear content read aloud</Text>
              </View>
              <Switch
                value={textToSpeech}
                onValueChange={setTextToSpeech}
                trackColor={{ false: '#E0E0E0', true: Colors.lightPurple }}
                thumbColor={textToSpeech ? Colors.primaryPurple : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIconContainer}>
                <EyeAccessibilityIcon />
              </View>
              <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceTitle}>Simplified Interface</Text>
                <Text style={styles.preferenceSubtitle}>Larger buttons, clearer layout</Text>
              </View>
              <Switch
                value={simplifiedInterface}
                onValueChange={setSimplifiedInterface}
                trackColor={{ false: '#E0E0E0', true: Colors.lightPurple }}
                thumbColor={simplifiedInterface ? Colors.primaryPurple : '#f4f3f4'}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your interest</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestTag,
                  selectedInterests.includes(interest) && styles.interestTagSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestTagText,
                    selectedInterests.includes(interest) && styles.interestTagTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Complete Setup"
            onPress={handleCompleteSetup}
            style={styles.continueButton}
          />

          <Text style={styles.footer}>
            Built with accessibility in mind ❤️
          </Text>
        </Card>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: UtilityMethods.hp(4),
  },
  headerSection: {
    alignItems: 'center',
    marginTop: UtilityMethods.hp(8),
    paddingHorizontal: UtilityMethods.wp(5),
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    marginBottom: UtilityMethods.hp(0.5),
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(3),
    marginTop: UtilityMethods.hp(2),
  },
  photoContainer: {
    position: 'relative',
    marginBottom: UtilityMethods.hp(1),
  },
  photoPlaceholder: {
    width: UtilityMethods.wp(25),
    height: UtilityMethods.wp(25),
    borderRadius: UtilityMethods.wp(12.5),
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryPurple,
    borderRadius: UtilityMethods.wp(4),
    padding: UtilityMethods.wp(1.5),
  },
  uploadText: {
    fontSize: FontSize.BODY_TEXT - 2,
    color: Colors.textGrey,
  },
  card: {
    marginHorizontal: UtilityMethods.wp(5),
  },
  fieldContainer: {
    marginBottom: UtilityMethods.hp(1),
  },
  label: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: -UtilityMethods.hp(2.5),
  },
  required: {
    color: Colors.primaryPurple,
  },
  bioContainer: {
    minHeight: UtilityMethods.hp(12),
  },
  bioInput: {
    minHeight: UtilityMethods.hp(10),
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
  },
  preferenceCard: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.hp(2),
    marginBottom: UtilityMethods.hp(1.5),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIconContainer: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  preferenceSubtitle: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.placeholderGrey,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: UtilityMethods.wp(2),
  },
  interestTag: {
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1),
    borderRadius: UtilityMethods.wp(5),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    backgroundColor: Colors.white,
  },
  interestTagSelected: {
    backgroundColor: Colors.primaryPurple,
    borderColor: Colors.primaryPurple,
  },
  interestTagText: {
    fontSize: FontSize.VALUE(14),
    color: Colors.textDark,
    fontWeight: '500',
  },
  interestTagTextSelected: {
    color: Colors.white,
  },
  continueButton: {
    width: '100%',
    marginTop: UtilityMethods.hp(2),
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.BODY_TEXT - 2,
    color: Colors.placeholderGrey,
    marginTop: UtilityMethods.hp(3),
    marginBottom: UtilityMethods.hp(2),
  },
});
