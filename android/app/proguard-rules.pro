# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Firebase
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }

# SVG & Vector Icons
-keep class com.horcrux.svg.** { *; }
-keep class com.oblador.vectoricons.** { *; }

# Video
-keep class com.brentvatne.react.** { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
