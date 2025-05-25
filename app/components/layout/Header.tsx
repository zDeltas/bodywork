import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/app/hooks/useTheme';
import { router } from 'expo-router';
import { ChevronLeft, ArrowLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  largeTitle?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
                                         title,
                                         largeTitle = false,
                                         leftComponent,
                                         rightComponent,
                                         showBackButton = false,
                                         onBack
                                       }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme, isDarkMode } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Calcul des dimensions selon la plateforme
  const statusBarHeight =
    Platform.select({
      ios: insets.top,
      android: StatusBar.currentHeight || 0
    }) ?? 0;

  const navBarHeight =
    Platform.select({
      ios: largeTitle ? 96 : 44,
      android: 56
    }) ?? 44;

  const totalHeight = statusBarHeight + navBarHeight;

  return (
    <View
      style={[
        headerStyles.container,
        { height: totalHeight, backgroundColor: theme.colors.background.main }
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.main}
      />
      <View style={[headerStyles.navBar, { height: navBarHeight }]}>
        <View style={headerStyles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={headerStyles.backButton}>
              {Platform.OS === 'ios' ? (
                <ChevronLeft size={24} color={theme.colors.text.primary} />
              ) : (
                <ArrowLeft size={24} color={theme.colors.text.primary} />
              )}
            </TouchableOpacity>
          )}
          {leftComponent}
        </View>
        <Text
          style={[
            headerStyles.title,
            largeTitle && headerStyles.largeTitle,
            { color: theme.colors.text.primary }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={headerStyles.rightContainer}>{rightComponent}</View>
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    width: '100%'
  },
  statusBar: {
    width: '100%'
  },
  navBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  leftContainer: {
    minWidth: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  rightContainer: {
    minWidth: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'left',
    marginLeft: 16
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  }
});

export default Header;
