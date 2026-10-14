import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MainLayout from '../../components/general/MainLayout';
import ArrowLeftIcon from '../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { TERMS_OF_SERVICE_TEXT } from '../../constants/legal/termsOfServiceText';
import { EULA_TEXT } from '../../constants/legal/eulaText';
import { PRIVACY_POLICY_TEXT } from '../../constants/legal/privacyPolicyText';

export type LegalDocType = 'terms' | 'eula' | 'privacy';

type LegalRouteParams = {
  LegalDocument: {
    documentType?: LegalDocType;
  };
};

export function LegalDocumentScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LegalRouteParams, 'LegalDocument'>>();
  const initialType = route.params?.documentType || 'terms';

  const [activeTab, setActiveTab] = useState<LegalDocType>(initialType);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: Colors.userFeedBackground,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(6),
        paddingBottom: UtilityMethods.hp(1.5),
        backgroundColor: Colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      backButton: {
        padding: UtilityMethods.wp(1.5),
        marginRight: UtilityMethods.wp(3),
      },
      headerTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: UtilityMethods.wp(3),
        paddingBottom: UtilityMethods.hp(0.5),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGrey,
      },
      tabButton: {
        flex: 1,
        paddingVertical: UtilityMethods.hp(1.2),
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
      },
      activeTabButton: {
        borderBottomColor: Colors.primaryPurple,
      },
      tabText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.textGrey,
      },
      activeTabText: {
        color: Colors.primaryPurple,
        fontWeight: '700',
      },
      contentScroll: {
        flex: 1,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(2),
      },
      contentCard: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(4),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
      },
      badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      dateBadge: {
        backgroundColor: '#F3E8FF',
        paddingHorizontal: UtilityMethods.wp(2.8),
        paddingVertical: UtilityMethods.hp(0.5),
        borderRadius: UtilityMethods.wp(2),
        alignSelf: 'flex-start',
      },
      dateBadgeText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.primaryPurple,
      },
      documentTitle: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1.5),
        lineHeight: UtilityMethods.hp(2.8),
      },
      bodyText: {
        fontSize: FontSize.VALUE(14),
        lineHeight: UtilityMethods.hp(2.6),
        color: Colors.textGrey,
      },
      bottomBar: {
        backgroundColor: Colors.white,
        paddingHorizontal: UtilityMethods.wp(5),
        paddingVertical: UtilityMethods.hp(1.5),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
      },
      doneButton: {
        backgroundColor: Colors.primaryPurple,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        alignItems: 'center',
      },
      doneButtonText: {
        color: Colors.white,
        fontSize: FontSize.BODY_TEXT,
        fontWeight: '700',
      },
    })
  );

  let documentContent = TERMS_OF_SERVICE_TEXT;
  let documentDisplayTitle = 'Exceptional People Mingle Terms of Service';
  let documentEffectiveDate = 'Effective Date: October 2026';

  if (activeTab === 'eula') {
    documentContent = EULA_TEXT;
    documentDisplayTitle = 'End User License Agreement (EULA)';
    documentEffectiveDate = 'Effective Date: October 10, 2026';
  } else if (activeTab === 'privacy') {
    documentContent = PRIVACY_POLICY_TEXT;
    documentDisplayTitle = 'Exceptional People Mingle Privacy Policy';
    documentEffectiveDate = 'Effective Date: October 2026';
  }

  return (
    <MainLayout
      showBackGroundImage={false}
      barStyle="dark-content"
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Policies</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'terms' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('terms')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'terms' && styles.activeTabText,
            ]}
          >
            Terms of Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'eula' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('eula')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'eula' && styles.activeTabText,
            ]}
          >
            EULA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'privacy' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'privacy' && styles.activeTabText,
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentCard}>
          <View style={styles.badgeRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{documentEffectiveDate}</Text>
            </View>
          </View>
          <Text style={styles.documentTitle}>{documentDisplayTitle}</Text>
          <Text style={styles.bodyText}>{documentContent}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </MainLayout>
  );
}
