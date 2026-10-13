import {
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import ScreenWrapper from '../ScreenWrapper/index';

interface MainLayoutProps {
  children: React.ReactNode;
  paddingTop?: number;
  isScrollable?: boolean;
  loader?: boolean;
  statusbarBackgrund?: string;
  bottomColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  showBackGroundImage?: boolean;
  imageSource?: any;
  style?: any;
  translucent?: boolean;
  enableScroll?: boolean;
  contentContainerStyle?: any;
  /** When false, omits SafeAreaView (for screens nested inside another layout) */
  includeSafeArea?: boolean;
}

const MainLayout = ({
  children,
  paddingTop = StatusBar.currentHeight,
  isScrollable = true,
  loader = false,
  statusbarBackgrund,
  bottomColor,
  barStyle = 'light-content',
  showBackGroundImage = false,
  imageSource,
  style,
  translucent,
  enableScroll = true,
  contentContainerStyle,
  includeSafeArea = true,
  ...props
}: MainLayoutProps) => {
  const MainView: any = showBackGroundImage ? ImageBackground : View;

  return (
    <MainView
      style={[styles.container, style]}
      {...(showBackGroundImage && {
        source: imageSource,
        resizeMode: 'cover',
      })}
    >
      <StatusBar
        backgroundColor={statusbarBackgrund}
        barStyle={barStyle}
        translucent={translucent}
      />
      {includeSafeArea && (
        <SafeAreaView
          style={{
            flex: 0,
            backgroundColor: statusbarBackgrund,
            opacity: showBackGroundImage ? 0 : 1,
          }}
        />
      )}
      <View style={{ flex: 1 }}>
        {isScrollable ? (
          <ScreenWrapper
            enableScroll={enableScroll}
            bounces={false}
            contentContainerStyle={contentContainerStyle}
          >
            {children}
          </ScreenWrapper>
        ) : (
          <View style={styles.view}>{children}</View>
        )}
      </View>
      {includeSafeArea && (
        <SafeAreaView
          style={{
            flex: 0,
            backgroundColor: bottomColor,
            opacity: showBackGroundImage ? 0 : 1,
          }}
        />
      )}
    </MainView>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    //flex: 1,
    width: '100%',
  },
  view: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flexGrow: 1,
    width: '100%',
  },
});
