# EXCEPTIONAL PEOPLE MINGLE (EPM)
# COMPREHENSIVE PROJECT AUDIT AND ISSUES REPORT

Document Date: September 2026
Project Repository: Exceptional People Mingle (EPM)
Application Target: React Native 0.82 (iOS and Android)
Backend Infrastructure: Firebase Authentication, Cloud Firestore, Firebase Storage

================================================================================
EXECUTIVE SUMMARY
================================================================================

This document provides a comprehensive technical audit of the Exceptional People Mingle (EPM) codebase. The audit covers all user flows, administrative tools, authentication pipelines, database security rules, social features, messaging interfaces, and system services.

A total of 38 distinct issues were identified across 7 critical functional domains:
1. Authentication, Authorization and Security Vulnerabilities (5 Issues)
2. Crash Bugs and Runtime Exceptions (4 Issues)
3. Account Lifecycle, Password Management and App Store Compliance (5 Issues)
4. Feed, Content and Social Interactions (6 Issues)
5. Chat, Messaging and Real Time Communications (3 Issues)
6. Admin Dashboard, Moderation and Preference Settings (11 Issues)
7. Code Quality, TypeScript Definitions and Architecture (4 Issues)

Each issue in this report is documented with its severity classification, exact file location, root cause analysis, real world impact, and concrete technical resolution.


================================================================================
TABLE OF CONTENTS
================================================================================

Section 1: Authentication, Authorization and Security Vulnerabilities
Section 2: Crash Bugs and Runtime Exceptions
Section 3: Account Lifecycle, Password Management and App Store Compliance
Section 4: Feed, Content and Social Interactions
Section 5: Chat, Messaging and Real Time Communications
Section 6: Admin Dashboard, Moderation and Preference Settings
Section 7: Code Quality, TypeScript Definitions and Architecture
Section 8: Prioritized Remediation Roadmap


================================================================================
SECTION 1: AUTHENTICATION, AUTHORIZATION AND SECURITY VULNERABILITIES
================================================================================

Issue 1.1: Client Side Role Elevation Vulnerability in Sign In Screen
Severity: Critical
Component: Authentication / Access Control
File: src/screens/admin/SignInScreen/SignInScreen.tsx (Lines 78 to 83)

Root Cause:
When a user submits their email and password, the application checks whether the active UI segment toggle is set to "Admin" or "User". It dispatches selectAdmin() or selectUser() to the Redux store solely based on which button the user tapped on the login screen, without verifying the role attribute in the user document stored in Cloud Firestore (users/{uid}.role).

Impact:
Any regular user can switch the toggle on the sign in screen to "Admin", enter their standard user credentials, and immediately gain access to the Admin Dashboard, user management, suspension controls, and moderation tools.

Resolution:
Following successful Firebase authentication in SignInScreen.tsx:
1. Query firestore().collection('users').doc(user.uid).get().
2. Read the role field.
3. If the role does not equal 'Admin' (case insensitive), prevent entry to the admin portal, sign out the auth session, and display an access denied message.
4. Only dispatch selectAdmin() if the verified Firestore document explicitly has role === 'Admin'.


Issue 1.2: Overly Permissive Firestore Security Rules
Severity: Critical
Component: Database Security
File: firestore.rules (Lines 11 to 36)

Root Cause:
The active Firestore security rules allow global write access to any authenticated user across users, posts, and wildcards:
- match /users/{userId} allows write if request.auth != null
- match /posts/{postId} allows write if request.auth != null
- match /{document=**} allows write if request.auth != null

Impact:
Any logged in user can use the Firestore SDK or REST API to overwrite another user profile, modify another user's role to 'Admin', edit or delete any post created by any member, or drop documents from collections.

Resolution:
Implement strict document level ownership and role verification rules:
1. For /users/{userId}: Allow write only if request.auth.uid == userId or if request.auth token / Firestore record indicates admin status.
2. For /posts/{postId}: Allow update and delete only if request.auth.uid == resource.data.authorUserId or if user is admin.
3. For /friend_requests/{id}: Enforce senderId == request.auth.uid on create.


Issue 1.3: Missing Storage Security Rules for Group Cover Assets
Severity: High
Component: Cloud Storage
File: storage.rules (Lines 4 to 26)

Root Cause:
storage.rules explicitly permits paths under posts/{userId}/..., avatars/{userId}/..., and covers/{userId}/.... There is no matching rule for groups/{groupId}/... or group covers.

Impact:
When group cover upload is implemented, all upload requests to storage for group banners will be rejected with Firebase Storage unauthorized errors (Error 403 Permission Denied).

Resolution:
Add a dedicated rule in storage.rules:
match /groups/{groupId}/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}


Issue 1.4: Dummy Social Login and Support Handlers in Sign In Screen
Severity: Medium
Component: Authentication UI
File: src/screens/admin/SignInScreen/SignInScreen.tsx (Lines 54 to 56)

Root Cause:
The functions handleContactAdmin, handleGoogleSignIn, and handleAppleSignIn are declared as empty no-op functions:
const handleContactAdmin = () => {};
const handleGoogleSignIn = () => {};
const handleAppleSignIn = () => {};

Impact:
Tapping "Continue with Google", "Continue with Apple", or "Need help? Contact Admin" produces no visual feedback, no error prompt, and no action, giving users the impression that the interface is frozen or broken.

Resolution:
1. Either integrate @react-native-google-signin/google-signin and @invertase/react-native-apple-authentication for functional OAuth sign in, or remove the social buttons until backend credentials are ready.
2. For handleContactAdmin, open a mailto: link (Linking.openURL('mailto:support@epm.com')) or display an alert with support contact information.


Issue 1.5: Role State Loss and Unhandled Routing on App Relaunch
Severity: High
Component: Session Management / State Persistence
File: src/context/AuthContext.tsx (Lines 48 to 65) and src/navigation/MainStack.tsx (Lines 45 to 55)

Root Cause:
Redux roleSlice initializes with { user: true, admin: false }. When an administrator who is already authenticated closes and reopens the application, Firebase Auth maintains the session and onAuthStateChanged fires with the user object. However, AuthContext does not query the user's role from Firestore and does not dispatch selectAdmin().

Impact:
An admin reopening the app is automatically directed into the User flow (UserMainScreen) instead of the Admin Dashboard. The admin is locked out of administrative controls unless they sign out and sign back in via the login screen.

Resolution:
In AuthContext.tsx, within onAuthStateChanged:
1. Fetch firestore().collection('users').doc(firebaseUser.uid).get().
2. Read the role field.
3. If role is 'Admin', dispatch selectAdmin(); otherwise dispatch selectUser().
4. Mark auth initialization as complete only after the role check completes.


================================================================================
SECTION 2: CRASH BUGS AND RUNTIME EXCEPTIONS
================================================================================

Issue 2.1: Fatal Crash in Complete Profile Screen on Sign Up
Severity: Critical
Component: Registration Flow
File: src/screens/admin/CompleteProfileScreen/CompleteProfileScreen.tsx (Line 43)

Root Cause:
CompleteProfileScreen calls:
const { updateProfile } = useUserProfile();
However, useUserProfile() explicitly requires being rendered inside a <UserProfileProvider>, throwing:
"Error: useUserProfile must be used within UserProfileProvider"
CompleteProfileScreen is registered in AuthStack.tsx, which is mounted directly under MainStack outside of UserStack. AuthStack is never wrapped in UserProfileProvider.

Impact:
When a new user completes the sign up form and navigates to the CompleteProfile screen, the application immediately suffers an unhandled JavaScript crash, terminating the onboarding flow.

Resolution:
Wrap CompleteProfileScreen logic with a safe context check, or update Firestore directly via firestore().collection('users').doc(uid).set(...) instead of coupling the authentication screen to the user shell's profile context.


Issue 2.2: OtherUserProfileScreen Broken for Real Registered Users
Severity: High
Component: Member Profile Viewing
File: src/screens/user/OtherUserProfileScreen/OtherUserProfileScreen.tsx (Lines 40 to 45)

Root Cause:
When a user clicks on another user's avatar in the home feed, search, or friends list, the navigation passes userId (a real Firestore document UID).
OtherUserProfileScreen attempts to load user data via:
const user = getPublicUserProfile(userId);
This function only searches the hardcoded mock array in src/constants/publicUserProfilesData.ts (which only contains IDs '1', '2', etc.).

Impact:
Clicking on any real member's profile always returns undefined and displays "Profile not found", preventing members from viewing each other's profiles, bio, or community posts.

Resolution:
Update OtherUserProfileScreen to listen to real time Firestore data:
1. Subscribe to firestore().collection('users').doc(userId).onSnapshot(...).
2. Subscribe to user posts from firestore().collection('posts').where('authorUserId', '==', userId).
3. Query friendship status between the current user and target user from Firestore.


Issue 2.3: Blank Screen Render in Admin Feed Details Screen
Severity: High
Component: Admin Moderation
File: src/screens/admin/FeedDetailsScreen/FeedDetailsScreen.tsx (Lines 45 to 51)

Root Cause:
When an administrator clicks on a post from the live news feed to moderate it, the route receives the Firestore post ID.
FeedDetailsScreen contains the following code:
const post = MOCK_NEWS_POSTS.find(p => p.id === postId);
if (!post) {
  return null;
}
Because real posts created by community members exist in Firestore and not in MOCK_NEWS_POSTS, post is always undefined, causing the component to return null.

Impact:
The screen renders completely blank white when viewing any real post. The administrator cannot view the post content, see who authored it, issue warnings, or remove the post.

Resolution:
Replace MOCK_NEWS_POSTS.find with a Firestore document listener:
firestore().collection('posts').doc(postId).onSnapshot(doc => { ... })
Render the post author details, post media, text, and engagement metrics directly from the Firestore record.


Issue 2.4: Empty Lists on Admin Feed Post Engagement Screens
Severity: High
Component: Admin Moderation / Engagement Metrics
File: src/screens/admin/FeedPostEngagement/AdminFeedEngagementListBody.tsx (Lines 58 to 66)

Root Cause:
AdminFeedEngagementListBody handles the screens for Likers (FeedPostLikersScreen), Commenters (FeedPostCommentersScreen), and Sharers (FeedPostSharersScreen).
Lines 58 to 66 execute:
const post = useMemo(() => MOCK_NEWS_POSTS.find(p => p.id === postId), [postId]);
const people = useMemo(() => getFeedEngagementPeople(postId, kind), [postId, kind]);
Both rely strictly on static mock data arrays.

Impact:
For all live posts created by real users, tapping the likes count, comments count, or shares count displays an empty list or mismatched placeholder users instead of the actual members who interacted with the post.

Resolution:
Query the real Firestore subcollections:
1. For likes: firestore().collection('posts').doc(postId).collection('likes').
2. For comments: firestore().collection('posts').doc(postId).collection('comments').
3. Hydrate the user IDs with user names and avatar pictures from the users collection.


================================================================================
SECTION 3: ACCOUNT LIFECYCLE, PASSWORD MANAGEMENT AND APP STORE COMPLIANCE
================================================================================

Issue 3.1: Non Functional In App Password Change for Users
Severity: Critical
Component: Account Security
File: src/screens/user/UserChangePasswordScreen/UserChangePasswordScreen.tsx (Lines 177 to 180)

Root Cause:
When a user fills out the current password, new password, and confirmation fields and presses "Update Password", Formik onSubmit executes:
Alert.alert('Success', 'Your password has been changed successfully.');
navigation.goBack();
No call is made to auth().currentUser.reauthenticateWithCredential(...) or auth().currentUser.updatePassword(...).

Impact:
The user is informed that their password was successfully changed, but their password in Firebase Auth remains unchanged. If they log out, the old password still works and the new password fails.

Resolution:
1. Construct an EmailAuthProvider.credential(user.email, values.currentPassword).
2. Reauthenticate the current user session.
3. Call await auth().currentUser.updatePassword(values.newPassword).
4. Handle auth/wrong-password and auth/weak-password error codes with clear user feedback.


Issue 3.2: Non Functional In App Password Change for Administrators
Severity: Critical
Component: Admin Security
File: src/screens/admin/ChangePasswordScreen/ChangePasswordScreen.tsx (Lines 99 to 101)

Root Cause:
Identical to the user password change screen, the admin change password screen handles submission by calling:
Alert.alert('Password Changed', 'Your password has been successfully updated.');
navigation.goBack();
No Firebase Auth update API is invoked.

Impact:
Administrators cannot change their account passwords from within the app.

Resolution:
Implement reauthentication and currentUser.updatePassword() inside the admin screen's onSubmit handler.


Issue 3.3: Fake Account Deletion Violating Apple App Store Guideline 5.1.1(v)
Severity: Critical
Component: Account Settings / Compliance
File: src/screens/user/AccountSettingsScreen/AccountSettingsScreen.tsx (Lines 178 to 184)

Root Cause:
When a user selects "Delete Account" and confirms deletion, the handler executes:
Alert.alert(
  'Account Deletion Requested',
  'Your account deletion request has been submitted. Your account will be deactivated and permanently deleted within 30 days.',
  [{ text: 'OK', onPress: () => navigation.navigate('UserMain') }]
);
No operation is performed against Firebase Auth or Firestore. The user account and all personal data remain fully active and accessible.

Impact:
1. Violation of Apple App Store Review Guideline 5.1.1(v), which mandates that applications supporting account creation must allow users to initiate immediate and complete account deletion within the app. Failure to comply results in app rejection.
2. Violation of GDPR / CCPA right-to-be-forgotten privacy regulations.

Resolution:
1. Reauthenticate the user session.
2. Delete the user document and associated user subcollections in Firestore.
3. Call await auth().currentUser.delete().
4. Dispatch user sign out and return to the welcome screen.


Issue 3.4: Fake OTP Email Verification and Password Reset Flow
Severity: High
Component: Password Recovery
Files:
- src/screens/admin/VerifyEmailScreen/VerifyEmailScreen.tsx (Lines 36 to 43)
- src/screens/admin/CreateNewPasswordScreen/CreateNewPasswordScreen.tsx (Lines 27 to 29)

Root Cause:
1. VerifyEmailScreen prompts for a 6 digit numerical OTP. Firebase Authentication does not produce numerical OTP codes for email verification (it sends email action links). Tapping "Verify Code" accepts any arbitrary input (including empty values) and routes to CreateNewPassword.
2. CreateNewPasswordScreen contains an onSubmit handler that only calls navigation.navigate('SignIn'). It does not call confirmPasswordReset or update credentials.

Impact:
Users navigating through this recovery path believe their password was updated, but the new password is never applied to their account.

Resolution:
Standardize the password reset flow using Firebase Auth's standard email reset mechanism:
1. In ForgotPasswordScreen, call auth().sendPasswordResetEmail(email).
2. Inform the user that a secure reset link has been dispatched to their inbox.
3. Route the user back to SignIn.
4. Remove the artificial numerical OTP screens or connect them to a verified SMS/Twilio OTP service if phone verification is specifically required.


Issue 3.5: Missing Formik Validation Schema in Sign Up Screen
Severity: Medium
Component: Registration Validation
File: src/screens/admin/SignUpScreen/SignUpScreen.tsx (Line 53)

Root Cause:
SignUpScreen initializes Formik without a validationSchema. It does not validate password confirmation matching, minimum password length, or email syntax before triggering the submission pipeline.

Impact:
Users can submit mismatched passwords or invalid emails, only to encounter server side errors without helpful inline form errors.

Resolution:
Create and assign a Yup validation schema requiring:
1. Full name: minimum 2 characters, required.
2. Email: valid email format, required.
3. Password: minimum 8 characters, required.
4. Confirm password: oneOf([Yup.ref('password')], 'Passwords must match'), required.
5. Terms acceptance: boolean required true.


================================================================================
SECTION 4: FEED, CONTENT AND SOCIAL INTERACTIONS
================================================================================

Issue 4.1: Over-Restrictive Feed Query Hiding Community Posts for New Users
Severity: High
Component: Community Feed
File: src/screens/user/UserHomeScreen/UserHomeScreen.tsx (Lines 66 to 75)

Root Cause:
The main home feed filters all posts using:
const allowed = new Set([currentUserId, ...friendIds]);
const feedPosts = allPosts.filter(p => allowed.has(p.authorUserId));
When a new user registers on the application, their friendIds list is empty.

Impact:
A new user sees an entirely blank feed with 0 posts. Because they cannot see posts from other community members, they cannot discover people, like content, or leave comments, creating an empty initial experience.

Resolution:
Update the feed filtering logic:
1. In the "Discover" or "Public" tab, display all community posts from all users (excluding blocked users and admin announcements).
2. In the "Friends" tab, restrict posts to allowed friends.
3. If the user has no friends, default to the Discover view so community activity is immediately visible.


Issue 4.2: Mismatched Interests Field Name Breaking Interest Discovery
Severity: High
Component: Onboarding / People You May Know
Files:
- src/screens/admin/CompleteProfileScreen/CompleteProfileScreen.tsx (Line 97)
- src/components/user/PeopleYouMayKnowSection.tsx (Lines 117 to 138)

Root Cause:
In CompleteProfileScreen.tsx, selected interests are saved to Firestore under the property name selectedInterests:
await firestore().collection('users').doc(uid).set({
  selectedInterests: selectedInterests,
}, { merge: true });
However, PeopleYouMayKnowSection.tsx attempts to read:
const myInterests = new Set(((myDoc?.data()?.interests as string[]) || [])...);
const interests = data.interests || ['Community', 'Social'];

Impact:
myInterests is always evaluated as empty for real users. When a user clicks the "Interests" filter tab on their feed, the system cannot match their interests against other community members, disabling personalized recommendations.

Resolution:
Unify the property name across the codebase to interests:
1. Save as interests in CompleteProfileScreen.tsx and EditProfileScreen.tsx.
2. Ensure both readers and writers use the identical schema key interests: string[].


Issue 4.3: Group Cover Images Not Uploaded to Firebase Storage
Severity: High
Component: Group Creation
File: src/screens/user/CreateGroupScreen/CreateGroupScreen.tsx (Lines 85 to 92) and src/services/groupService.ts (Line 53)

Root Cause:
When a user picks a photo for a new group, coverUri is set to a local device URI (e.g. file:///data/user/0/... or ph://...).
In handleContinue, this local path is passed directly to createGroup({ coverUri: coverUri || '' }).
The local file path is written straight into the Firestore group document without being uploaded to Firebase Storage.

Impact:
The group banner is only visible on the creator's physical device while the file remains in local cache. On all other users' devices, the cover image fails to load, rendering as a broken image.

Resolution:
1. In groupService.ts, add an uploadGroupCover(groupId, localUri) helper that uploads to Firebase Storage at groups/{groupId}/cover.jpg.
2. In CreateGroupScreen.tsx, upload the image first and save the returned public HTTPS URL to Firestore.


Issue 4.4: Hardcoded Third Party Image Placeholders in Group and Profile Views
Severity: Medium
Component: User Profile & Group Detail
Files:
- src/screens/user/UserProfileScreen/UserProfileScreen.tsx (Line 65)
- src/screens/user/GroupDetailScreen/GroupDetailScreen.tsx (Lines 105 to 110)

Root Cause:
UserProfileScreen loads user groups and assigns cover images using:
imageUrl: 'https://picsum.photos/seed/' + g.id + '/240/240'
Similarly, GroupDetailScreen uses mock images from external placeholder services.

Impact:
Users see random stock photos from picsum.photos for groups instead of the actual group banner or the official branded fallback icons, violating design consistency.

Resolution:
1. Check if the group document has a valid coverUri starting with http.
2. If absent, render a styled vector placeholder using the group's category color and icon rather than fetching random third party images.


Issue 4.5: Hardcoded 'dev_user_123' Fallback in 15 Component Files
Severity: High
Component: User Session & Data Fetching
Files:
- src/components/user/FriendRequestsSection.tsx
- src/components/user/CreatePostModalContext.tsx
- src/components/user/UserPostCard.tsx
- src/components/user/PostCardOverflowMenu.tsx
- src/components/user/PeopleYouMayKnowCard.tsx
- src/screens/user/GroupDetailScreen/GroupDetailScreen.tsx
- src/screens/user/UserGroupsScreen/UserGroupsScreen.tsx
- src/screens/user/PostCommentsScreen/PostCommentsScreen.tsx
- src/screens/user/CreateGroupScreen/CreateGroupScreen.tsx
- src/screens/user/UserProfileScreen/UserProfileScreen.tsx
- src/screens/user/BlockedUsersScreen/BlockedUsersScreen.tsx
- src/screens/user/NotificationsScreen/NotificationsScreen.tsx
- src/screens/user/AccountSettingsScreen/AccountSettingsScreen.tsx
- src/screens/user/ChatScreen/ChatScreen.tsx (uses 'temp_current_user')

Root Cause:
Throughout the user components, code frequently uses:
const currentUserId = auth().currentUser?.uid || 'dev_user_123';
If a component mounts before the Firebase Auth state finishes initializing, or if an action is dispatched during state transitions, queries execute with 'dev_user_123'.

Impact:
1. Under production Firestore rules enforcing request.auth.uid == userId, all database operations fail with permission denied errors.
2. Data belonging to 'dev_user_123' can be accidentally written into production collections.

Resolution:
Guard all screens with an authentication check:
1. If auth().currentUser?.uid is null or undefined, render a centered loading spinner.
2. Never execute queries or writes using fallback mock user IDs.


Issue 4.6: Hardcoded Default Values in People You May Know Cards
Severity: Medium
Component: Recommendations
File: src/components/user/PeopleYouMayKnowSection.tsx (Lines 142 to 149)

Root Cause:
When real Firestore users are mapped into recommendation cards, several properties are hardcoded:
location: data.location || 'San Francisco, CA'
mutualFriendsCount: 5
isOnline: true
nearby: true

Impact:
Every recommended user in the community is displayed as being in "San Francisco, CA" with exactly "5 mutual friends", regardless of their actual location or real social connections.

Resolution:
1. Display location only if provided in the user's profile document; otherwise omit the location label or show "Location not specified".
2. Calculate mutual friends by intersecting friends subcollections, or display "New Member" if mutual friend count is 0.


================================================================================
SECTION 5: CHAT, MESSAGING AND REAL TIME COMMUNICATIONS
================================================================================

Issue 5.1: Unwired Attachment, Emoji and Microphone Buttons in Chat Screen
Severity: High
Component: Messaging
File: src/screens/user/ChatScreen/ChatScreen.tsx (Lines 240 to 245)

Root Cause:
ChatInput provides callback props for onEmojiPress, onAttachPress, and onMicPress.
In ChatScreen.tsx, ChatInput is rendered without passing any of these three handlers:
<ChatInput
  text={inputText}
  onChangeText={setInputText}
  onSend={handleSendMessage}
/>

Impact:
The smiley face (emoji), paperclip (attachment), and microphone (voice note) buttons on the chat bar are completely unresponsive when pressed.

Resolution:
1. onEmojiPress: Open an emoji selector bottom sheet or keyboard toggle.
2. onAttachPress: Trigger launchImageLibrary to send photo or video messages in the chat thread.
3. onMicPress: Integrate audio recording or provide user feedback explaining voice messaging capability.


Issue 5.2: Temporary Conversation ID Collision Risk in Chat Messages
Severity: Medium
Component: Real Time Chat Service
File: src/screens/user/ChatScreen/ChatScreen.tsx (Lines 75 to 88)

Root Cause:
When a message is sent before a Firestore conversation thread document is confirmed, ChatScreen generates temporary in-memory IDs using:
id: 'temp_' + Date.now()
If a rapid succession of messages is sent or network latency occurs, message reconciliation between local optimistic state and Firestore snapshot listeners can cause messages to duplicate or jitter in position.

Impact:
Chat messages can briefly appear twice or shuffle order when the real time snapshot arrives from Firestore.

Resolution:
Use Firestore's collection().doc().id to pre-generate an authentic document ID prior to write, ensuring the optimistic local item shares the exact ID of the incoming snapshot item.


Issue 5.3: Absence of Push Notification Client Service (FCM / APNs)
Severity: High
Component: Real Time Notifications
Scope: Application Wide

Root Cause:
The application has no push notification library installed (such as @react-native-firebase/messaging). Notifications exist purely as records in Firestore users/{uid}/notifications.

Impact:
When the application is minimized or closed, users receive no device push notifications when someone sends them a direct message, accepts their friend request, or comments on their post.

Resolution:
1. Install and link @react-native-firebase/messaging.
2. Request notification permissions on app launch.
3. Save the device FCM token to users/{uid}.fcmTokens.
4. Deploy a Firebase Cloud Function to trigger FCM push payloads whenever new chat messages or notification documents are created.


================================================================================
SECTION 6: ADMIN DASHBOARD, MODERATION AND PREFERENCE SETTINGS
================================================================================

Issue 6.1: Hardcoded Weekly Activity Analytics Chart
Severity: Medium
Component: Admin Dashboard
File: src/components/admin/WeeklyActivityChart/WeeklyActivityChart.tsx (Lines 8 to 16)

Root Cause:
WEEKLY_DATA is defined as a static array of mock objects:
{ day: 'Mon', value: 150 },
{ day: 'Tue', value: 280 },
{ day: 'Wed', value: 390 },
{ day: 'Thu', value: 290 },
{ day: 'Fri', value: 480 },
{ day: 'Sat', value: 380 },
{ day: 'Sun', value: 430 }

Impact:
The weekly activity bar chart on the Admin Dashboard shows the exact same synthetic numbers every week, regardless of actual user logins, registrations, or platform engagement.

Resolution:
1. Aggregate actual daily user activity from Firestore (e.g. users registered or posts created in the past 7 days).
2. Pass dynamic data into WeeklyActivityChart.


Issue 6.2: Volatile Admin Notification State (Lost on Navigation)
Severity: Medium
Component: Admin Notifications
File: src/screens/admin/AdminNotificationsScreen/AdminNotificationsScreen.tsx (Lines 22 to 23)

Root Cause:
Read and dismissed notification IDs are stored purely in local React component state:
const [readIds, setReadIds] = useState<Set<string>>(new Set());
const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

Impact:
Whenever an administrator marks notifications as read or dismisses them and leaves the screen, all state is discarded. Returning to the screen causes all dismissed notifications to reappear as unread.

Resolution:
Persist notification status in Firestore under users/{adminUid}/notifications/{id} with fields { read: true, dismissed: true }, or persist them locally using AsyncStorage.


Issue 6.3: Non-Functional Dark Mode Toggle in Admin Settings
Severity: Low
Component: Admin Settings / UI
File: src/screens/admin/AdminSettingsScreen/AdminSettingsScreen.tsx (Lines 74 and 322)

Root Cause:
The "Dark Mode" setting switch toggles a local useState boolean:
const [darkModeEnabled, setDarkModeEnabled] = useState(false);
There is no application wide ThemeContext, no Redux theme state, and no dark color palette applied to screen layouts.

Impact:
Toggling Dark Mode on or off has zero visual effect on any screen in the application.

Resolution:
Either connect darkModeEnabled to a global ThemeContext that dynamically updates background and text colors, or remove the toggle until full dark mode theme styling is ready.


Issue 6.4: Non-Functional Two-Factor Authentication Toggle
Severity: Medium
Component: Admin Security
File: src/screens/admin/AdminSettingsScreen/AdminSettingsScreen.tsx (Lines 72 and 291)

Root Cause:
The Two-Factor Auth setting row toggles a local useState boolean:
const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
It does not invoke Firebase Multi-Factor Authentication (MFA) APIs or persist the preference to Firestore.

Impact:
Administrators believe they have enabled or disabled 2FA, but no actual authentication requirements change.

Resolution:
Persist the twoFactorEnabled flag to users/{adminUid} in Firestore, and enforce 2FA verification in the sign in flow if enabled.


Issue 6.5: Non-Functional Language Selection Screen
Severity: Low
Component: Internationalization
File: src/screens/admin/LanguageScreen/LanguageScreen.tsx (Lines 32 to 34)

Root Cause:
Selecting a language and pressing "Save" executes:
const handleSave = () => { navigation.goBack(); };
No internationalization library (such as react-i18next) is integrated, and strings across all screens are hardcoded in English.

Impact:
Changing the language from English to Spanish, French, Arabic, etc., changes nothing in the application.

Resolution:
Integrate react-i18next or provide a notice that localization is currently in development.


Issue 6.6: Disconnected Help and Support Message Form
Severity: Medium
Component: Support
File: src/screens/admin/HelpSupportScreen/HelpSupportScreen.tsx (Line 46) and src/components/admin/HelpSendMessageForm/HelpSendMessageForm.tsx (Lines 18 to 24)

Root Cause:
HelpSupportScreen renders <HelpSendMessageForm /> without passing an onSend prop.
In HelpSendMessageForm.tsx, pressing "Send Message" calls:
onSend?.({ subject, message });
Because onSend is undefined, tapping the button executes nothing: no alert, no input clearing, and no record saved to Firestore.

Impact:
Administrators submitting support inquiries receive no response and their messages are lost.

Resolution:
In HelpSupportScreen.tsx, pass an onSend handler that saves the ticket to a support_tickets collection in Firestore, clears the inputs, and alerts the user that support has received their message.


Issue 6.7: Hardcoded Voice and TTS Badges on All User Profiles
Severity: Low
Component: User Profile UI
File: src/screens/user/UserProfileScreen/UserProfileScreen.tsx (Lines 257 to 260)

Root Cause:
The user profile header permanently renders:
<View style={styles.badges}>
  <UserProfileBadge label="Voice Enabled" Icon={MicIcon} />
  <UserProfileBadge label="TTS Active" Icon={SpeakerIcon} />
</View>
These badges are hardcoded JSX elements and are not conditioned on user settings.

Impact:
Every user displays "Voice Enabled" and "TTS Active" badges on their public profile, even if they have never used or configured assistive voice tools.

Resolution:
Conditionally render these badges based on the user's actual settings:
{profile.voiceEnabled && <UserProfileBadge label="Voice Enabled" Icon={MicIcon} />}
{profile.ttsEnabled && <UserProfileBadge label="TTS Active" Icon={SpeakerIcon} />}


Issue 6.8: Non-Persistent Privacy Settings
Severity: Medium
Component: User Privacy
File: src/screens/user/PrivacySettingsScreen/PrivacySettingsScreen.tsx (Lines 55 to 57)

Root Cause:
Privacy switches (publicProfile, showEmail, showPhone, showLocation, friendRequests, etc.) are stored in local useState variables. Tapping "Save" executes:
Alert.alert('Saved', 'Your privacy settings have been updated.');
No Firestore write occurs.

Impact:
All privacy toggle choices are immediately discarded when leaving the screen.

Resolution:
In onSave, write the privacy preferences object to firestore().collection('users').doc(currentUserId).set({ privacy: { ... } }, { merge: true }).


Issue 6.9: Placeholder External URL for Privacy Policy
Severity: Low
Component: Legal / Compliance
File: src/screens/user/PrivacySettingsScreen/PrivacySettingsScreen.tsx (Lines 63 to 67)

Root Cause:
The privacy policy link executes:
Linking.openURL('https://example.com/privacy')

Impact:
Users tapping "Privacy Policy" are redirected to a placeholder domain instead of the organization's verified privacy policy.

Resolution:
Replace https://example.com/privacy with the official hosted privacy policy URL or an in-app legal text screen.


Issue 6.10: Disconnected Assistive Toggles in Accessibility Modal
Severity: Medium
Component: Accessibility
File: src/components/user/AccessibilityModal.tsx (Lines 128 to 130)

Root Cause:
The modal includes switches for TTS (Text-to-Speech), Voice Navigation, and BCI (Brain-Computer Interface):
const [tts, setTts] = useState(false);
const [voice, setVoice] = useState(false);
const [bci, setBci] = useState(false);
These are local dummy state hooks not connected to any device speech engine (e.g. react-native-tts) or persistent profile flags.

Impact:
Enabling TTS or Voice Navigation produces no speech feedback or voice navigation capabilities.

Resolution:
1. Persist accessibility preferences to the Redux store or user profile.
2. Connect TTS toggles to a text-to-speech utility (such as react-native-tts).


Issue 6.11: Non-Functional Voice Attachment in Post Creation Modal
Severity: Medium
Component: Content Creation
File: src/components/user/CreatePostModal.tsx (Lines 196 to 198)

Root Cause:
Tapping the "Voice" attachment button triggers:
Alert.alert('Voice', 'Record a voice clip to attach.');
No audio recorder module is invoked and no audio file is attached.

Impact:
Users cannot record or publish audio clips with their posts.

Resolution:
Either implement audio recording using react-native-audio-recorder-player or hide the Voice button until audio attachment capabilities are built.


================================================================================
SECTION 7: CODE QUALITY, TYPESCRIPT DEFINITIONS AND ARCHITECTURE
================================================================================

Issue 7.1: Broken Import and Dead Code in CommonStyles.tsx
Severity: Low
Component: Utility
File: src/utility/CommonStyles.tsx (Lines 1 to 2)

Root Cause:
CommonStyles.tsx imports:
import { Fonts, Colors } from '../assets';
The directory src/assets/ does not contain an index.ts barrel export, making this import invalid. Furthermore, CommonStyles is not imported or used anywhere in the codebase.

Impact:
Causes TypeScript compilation errors if the file is imported or included in strict checks.

Resolution:
Delete src/utility/CommonStyles.tsx or correct its import paths to use src/constants/colors.ts.


Issue 7.2: Required Style Prop on Generic Card Component
Severity: Low
Component: UI Components
File: src/components/general/Card/Card.tsx (Line 8)

Root Cause:
The Card component interface declares style as mandatory:
interface CardProps {
  children: React.ReactNode;
  style: any;
}

Impact:
Using <Card> without custom styles generates TypeScript compiler errors (TS2741: Property 'style' is missing).

Resolution:
Mark the style property as optional:
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}


Issue 7.3: Unused Vector Icon Import in Timer Component
Severity: Low
Component: UI Components
File: src/components/general/Timer/Timer.tsx (Line 3)

Root Cause:
Imports Icon from react-native-vector-icons/MaterialCommunityIcons, which is never referenced in the component.

Impact:
Produces TypeScript linter warnings.

Resolution:
Remove the unused import line from Timer.tsx.


Issue 7.4: Static Mutual Friends Count and Friend Subcollection Aggregation
Severity: Medium
Component: Friends & Social Graph
Files:
- src/screens/user/UserProfileScreen/UserProfileScreen.tsx (Line 87)
- src/components/user/UserFriendCard.tsx

Root Cause:
UserFriendListItem assigns mutualFriends: 0 hardcoded. There is no background aggregation or cloud function calculating mutual connections.

Impact:
Friends list always shows 0 mutual friends for every member.

Resolution:
Query mutual connections by comparing friends subcollections, or display total friends count instead of mutual count.


================================================================================
SECTION 8: PRIORITIZED REMEDIATION ROADMAP
================================================================================

Phase 1: Critical Security, Crash Fixes and App Store Compliance (Immediate Priority)
1. Fix Role Elevation: Enforce Firestore users/{uid}.role validation in SignInScreen.tsx and AuthContext.tsx.
2. Fix CompleteProfile Crash: Decouple CompleteProfileScreen from useUserProfile or wrap AuthStack with UserProfileProvider.
3. Fix Account Deletion: Implement real account deletion in AccountSettingsScreen to comply with Apple App Store Guideline 5.1.1(v).
4. Fix Password Changes: Implement authentic reauthentication and updatePassword() calls in UserChangePasswordScreen and ChangePasswordScreen.
5. Fix OtherUserProfileScreen: Replace mock data lookups with real Firestore queries.
6. Fix Admin Feed Details & Engagement: Connect FeedDetailsScreen and engagement lists to real Firestore posts.

Phase 2: Core User Experience and Data Integrity (High Priority)
7. Update Home Feed Filter: Allow new users without friends to view public community posts in Discover view.
8. Unify Interests Field: Synchronize interests property between CompleteProfileScreen and PeopleYouMayKnowSection.
9. Fix Group Cover Uploads: Upload group banner images to Firebase Storage and update storage.rules.
10. Eliminate 'dev_user_123' Fallbacks: Add proper authentication guards across all 15 screens.
11. Secure Firestore Rules: Restrict document writes to verified owners and authenticated administrators.

Phase 3: Messaging and Real Time Services (Medium Priority)
12. Wire Chat Actions: Implement photo and media attachment pickers in ChatScreen.
13. Integrate Push Notifications: Link FCM / APNs service for real time message alerts.
14. Connect Help & Support Form: Save admin inquiries to Firestore support_tickets.
15. Persist Privacy Preferences: Write user privacy settings to Firestore.

Phase 4: Polish, Localization and Dead Code Cleanup (Low Priority)
16. Clean Dead Code: Remove or fix CommonStyles.tsx, Card.tsx style prop, and unused Timer.tsx imports.
17. Dynamic Admin Analytics: Replace static weekly activity numbers with live platform metrics.
18. Conditional Profile Badges: Render Voice and TTS badges only when configured by users.
