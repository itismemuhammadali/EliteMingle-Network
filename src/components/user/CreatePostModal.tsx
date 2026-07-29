import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import {
  CREATE_POST_MAX_LENGTH,
  POST_FEELINGS,
  formatFeeling,
  type PostFeeling,
} from '../../constants/userFeedData';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { useUserProfile } from './UserProfileContext';
import { UserPhotoIcon, UserVideoIcon } from './icons';
import { ChatMicIcon } from './icons/ChatMicIcon';
import GlobeIcon from '../../assets/Icons/profile/privacy/globe.svg';
import ChevronRight from '../../assets/Icons/profile/chevronRight.svg';

import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';

function CloseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function initials(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return 'U';
  return safeName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
}

const AV = UtilityMethods.wp(11);

export interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called after validation passes; modal closes. */
  onSubmit?: (
    text: string,
    mediaUri?: string,
    mediaType?: 'image' | 'video' | 'none',
    feeling?: string,
  ) => void;
}

export function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const [text, setText] = useState('');
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState<'Public' | 'Friends' | 'Only me'>(
    'Public',
  );
  const [feeling, setFeeling] = useState<PostFeeling | null>(null);

  useEffect(() => {
    if (!visible) {
      setText('');
      setMediaUri(undefined);
      setMediaType('none');
      setPrivacyOpen(false);
      setFeeling(null);
    }
  }, [visible]);

  const len = text.length;
  const trimmed = text.trim();
  const canPost =
    (trimmed.length > 0 || mediaUri !== undefined || feeling !== null) &&
    len <= CREATE_POST_MAX_LENGTH;

  const toggleFeeling = useCallback((f: PostFeeling) => {
    setFeeling(prev => (prev?.label === f.label ? null : f));
  }, []);

  const onChangeText = useCallback((t: string) => {
    if (t.length <= CREATE_POST_MAX_LENGTH) {
      setText(t);
    }
  }, []);

  const handlePost = useCallback(() => {
    if (!canPost) {
      Alert.alert('Empty post', 'Add text or media before posting.');
      return;
    }
    if (text.length > CREATE_POST_MAX_LENGTH) {
      return;
    }
    onSubmit?.(
      text.trim(),
      mediaUri,
      mediaType,
      feeling ? formatFeeling(feeling) : undefined,
    );
    onClose();
  }, [text, mediaUri, mediaType, feeling, canPost, onSubmit, onClose]);

  const handlePhoto = useCallback(() => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      includeExtra: true,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        return;
      }
      const asset = response.assets?.[0];
      if (!asset) return;

      // Use the file:// path the picker provides. It renders reliably in <Image>
      // (unlike large base64 data URIs on Fabric) and uploads efficiently via putFile.
      let targetUri = asset.uri || '';
      if (!targetUri && asset.originalPath) {
        targetUri = asset.originalPath.startsWith('file://')
          ? asset.originalPath
          : `file://${asset.originalPath}`;
      }

      if (targetUri) {
        setMediaUri(targetUri);
        setMediaType('image');
      }
    });
  }, []);

  const handleVideo = useCallback(() => {
    const options: ImageLibraryOptions = {
      mediaType: 'video',
      selectionLimit: 1,
      includeExtra: true,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        return;
      }
      const asset = response.assets?.[0];
      if (!asset) return;

      const rawUri = asset.uri || '';
      let targetUri = rawUri;

      if (asset.originalPath) {
        targetUri = asset.originalPath.startsWith('file://')
          ? asset.originalPath
          : `file://${asset.originalPath}`;
      }

      if (targetUri) {
        setMediaUri(targetUri);
        setMediaType('video');
      }
    });
  }, []);

  const handleVoice = useCallback(() => {
    Alert.alert('Voice', 'Record a voice clip to attach.');
  }, []);

  const removeMedia = useCallback(() => {
    setMediaUri(undefined);
    setMediaType('none');
  }, []);


  const counterColor = useMemo(
    () => (len >= CREATE_POST_MAX_LENGTH ? Colors.adminErrorRed : Colors.placeholderGrey),
    [len],
  );

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      flex: {
        flex: 1,
      },
      modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
      },
      sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(4),
        borderTopRightRadius: UtilityMethods.wp(4),
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
        maxHeight: '92%',
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(2),
      },
      title: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      closeBtn: {
        width: UtilityMethods.wp(9),
        height: UtilityMethods.wp(9),
        borderRadius: UtilityMethods.wp(4.5),
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
      },
      userRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: UtilityMethods.hp(1.75),
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
      },
      avatarFallback: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.primaryPurple,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarInitials: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(14),
      },
      userMeta: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
      },
      displayName: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.5),
      },
      privacyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: Colors.inputBackground,
        paddingHorizontal: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(0.45),
        borderRadius: UtilityMethods.wp(5),
      },
      privacyText: {
        marginLeft: UtilityMethods.wp(1),
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.textGrey,
      },
      chevronWrap: {
        marginLeft: UtilityMethods.wp(0.75),
        transform: [{ rotate: '90deg' }],
      },
      inputShell: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(2.5),
        minHeight: UtilityMethods.hp(18),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.5),
      },
      textInput: {
        fontSize: FontSize.VALUE(15),
        color: Colors.textDark,
        lineHeight: FontSize.VALUE(22),
        minHeight: UtilityMethods.hp(14),
      },
      counterRow: {
        alignItems: 'flex-end',
        marginTop: UtilityMethods.hp(0.35),
        marginBottom: UtilityMethods.hp(1.25),
      },
      counter: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '500',
      },
      attachRow: {
        flexDirection: 'row',
        marginBottom: UtilityMethods.hp(2),
      },
      attachCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(1.35),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      attachCellLeft: {
        marginRight: UtilityMethods.wp(1),
      },
      attachCellMid: {
        marginHorizontal: UtilityMethods.wp(1),
      },
      attachCellRight: {
        marginLeft: UtilityMethods.wp(1),
      },
      attachLabel: {
        marginTop: UtilityMethods.hp(0.5),
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.textGrey,
      },
      feelingInline: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '500',
        color: Colors.textGrey,
      },
      feelingHeading: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      feelingRow: {
        paddingBottom: UtilityMethods.hp(1.5),
      },
      feelingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(0.85),
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: Colors.inputBackground,
        marginRight: UtilityMethods.wp(2),
      },
      feelingChipActive: {
        backgroundColor: Colors.userProfilePurple,
      },
      feelingChipEmoji: {
        fontSize: FontSize.VALUE(15),
        marginRight: UtilityMethods.wp(1.5),
      },
      feelingChipLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.textGrey,
      },
      feelingChipLabelActive: {
        color: Colors.white,
        fontWeight: '600',
      },
      postBtn: {
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(8),
        paddingVertical: UtilityMethods.hp(1.65),
        alignItems: 'center',
        justifyContent: 'center',
      },
      postBtnDisabled: {
        opacity: 0.45,
      },
      postBtnText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
      },
      privacyModalRoot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
      },
      privacyBackdrop: {
        ...StyleSheet.absoluteFillObject,
      },
      privacyMenu: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(0.5),
        minWidth: UtilityMethods.wp(55),
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
      privacyItem: {
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(5),
      },
      privacyItemText: {
        fontSize: FontSize.VALUE(15),
        color: Colors.textGrey,
      },
      privacyItemTextActive: {
        color: Colors.userProfilePurple,
        fontWeight: '600',
      },
      mediaPreviewContainer: {
        position: 'relative',
        marginVertical: UtilityMethods.hp(1),
        borderRadius: UtilityMethods.wp(3),
        overflow: 'hidden',
      },
      mediaPreviewImage: {
        width: '100%',
        height: UtilityMethods.hp(20),
        resizeMode: 'cover',
        borderRadius: UtilityMethods.wp(3),
        backgroundColor: Colors.inputBackground,
      },
      videoPreviewBox: {
        width: '100%',
        height: UtilityMethods.hp(12),
        backgroundColor: '#1E1E1E',
        borderRadius: UtilityMethods.wp(3),
        alignItems: 'center',
        justifyContent: 'center',
      },
      videoPreviewText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
      },
      removeMediaBtn: {
        position: 'absolute',
        top: UtilityMethods.wp(2),
        right: UtilityMethods.wp(2),
        width: UtilityMethods.wp(7),
        height: UtilityMethods.wp(7),
        borderRadius: UtilityMethods.wp(3.5),
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  const postBtnStyle = [
    styles.postBtn,
    !canPost && styles.postBtnDisabled,
  ];

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: Math.max(insets.bottom, UtilityMethods.hp(2)),
                },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.headerRow}>
                  <Text style={styles.title}>Create Post</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <CloseIcon size={UtilityMethods.wp(4.5)} color="#666666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.userRow}>
                  {profile.avatarUri ? (
                    <Image
                      source={{ uri: profile.avatarUri }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitials}>
                        {initials(profile.displayName)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userMeta}>
                    <Text style={styles.displayName}>
                      {profile.displayName}
                      {feeling ? (
                        <Text style={styles.feelingInline}>
                          {`  is feeling ${feeling.emoji} ${feeling.label}`}
                        </Text>
                      ) : null}
                    </Text>
                    <TouchableOpacity
                      style={styles.privacyPill}
                      onPress={() => setPrivacyOpen(true)}
                      activeOpacity={0.75}
                    >
                      <GlobeIcon
                        width={UtilityMethods.wp(3.5)}
                        height={UtilityMethods.wp(3.5)}
                        color={Colors.textGrey}
                      />
                      <Text style={styles.privacyText}>{privacy}</Text>
                      <View style={styles.chevronWrap}>
                        <ChevronRight
                          width={UtilityMethods.wp(3)}
                          height={UtilityMethods.wp(3)}
                          color={Colors.textGrey}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputShell}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="What's on your mind? Share your thoughts, experiences, or ideas..."
                    placeholderTextColor={Colors.placeholderGrey}
                    multiline
                    textAlignVertical="top"
                    value={text}
                    onChangeText={onChangeText}
                    maxLength={CREATE_POST_MAX_LENGTH}
                  />
                </View>

                {mediaUri && (
                  <View style={styles.mediaPreviewContainer}>
                    {mediaType === 'image' ? (
                      <Image
                        source={{ uri: mediaUri }}
                        style={styles.mediaPreviewImage}
                        resizeMode="cover"
                        onError={(e) =>
                          console.log('[CreatePostModal Preview Image Error]:', mediaUri, e.nativeEvent)
                        }
                      />
                    ) : (
                      <Video
                        source={{ uri: mediaUri }}
                        style={styles.mediaPreviewImage}
                        resizeMode="cover"
                        controls
                        paused
                        repeat={false}
                        onError={(e) =>
                          console.log('[CreatePostModal Preview Video Error]:', mediaUri, e)
                        }
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={removeMedia}
                      hitSlop={8}
                    >
                      <CloseIcon size={UtilityMethods.wp(3.5)} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.counterRow}>
                  <Text style={[styles.counter, { color: counterColor }]}>
                    {len}/{CREATE_POST_MAX_LENGTH}
                  </Text>
                </View>

                <Text style={styles.feelingHeading}>How are you feeling?</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.feelingRow}
                >
                  {POST_FEELINGS.map(f => {
                    const selected = feeling?.label === f.label;
                    return (
                      <TouchableOpacity
                        key={f.label}
                        style={[
                          styles.feelingChip,
                          selected && styles.feelingChipActive,
                        ]}
                        onPress={() => toggleFeeling(f)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.feelingChipEmoji}>{f.emoji}</Text>
                        <Text
                          style={[
                            styles.feelingChipLabel,
                            selected && styles.feelingChipLabelActive,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.attachRow}>
                  <TouchableOpacity
                    style={[styles.attachCell, styles.attachCellLeft]}
                    onPress={handlePhoto}
                    activeOpacity={0.75}
                  >
                    <UserPhotoIcon size={UtilityMethods.wp(5.5)} color="#2ECC71" />
                    <Text style={styles.attachLabel}>Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.attachCell, styles.attachCellMid]}
                    onPress={handleVideo}
                    activeOpacity={0.75}
                  >
                    <UserVideoIcon size={UtilityMethods.wp(5.5)} color="#E53935" />
                    <Text style={styles.attachLabel}>Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.attachCell, styles.attachCellRight]}
                    onPress={handleVoice}
                    activeOpacity={0.75}
                  >
                    <ChatMicIcon size={UtilityMethods.wp(5.5)} color="#2196F3" />
                    <Text style={styles.attachLabel}>Voice</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={postBtnStyle}
                  onPress={handlePost}
                  disabled={!canPost}
                  activeOpacity={0.88}
                >
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={visible && privacyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyOpen(false)}
      >
        <View style={styles.privacyModalRoot}>
          <Pressable
            style={styles.privacyBackdrop}
            onPress={() => setPrivacyOpen(false)}
          />
          <View style={styles.privacyMenu}>
            {(['Public', 'Friends', 'Only me'] as const).map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.privacyItem}
                onPress={() => {
                  setPrivacy(opt);
                  setPrivacyOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.privacyItemText,
                    privacy === opt && styles.privacyItemTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}
