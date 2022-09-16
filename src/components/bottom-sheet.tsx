import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {BG_1, GRAPHIC_SECOND_2, TEXT_BASE_1} from '../variables';
import {CloseCircle, IconButton, Paragraph, ParagraphSize} from './ui';
import {Spacer} from './spacer';

export type BottomSheetProps = {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
};

const h = Dimensions.get('window').height;

export const BottomSheet = ({children, onClose, title}: BottomSheetProps) => {
  const pan = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy >= 0) {
          pan.setValue(gestureState.dy / h);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > h / 3) {
          onClosePopup();
        } else {
          onOpenPopup();
        }
      },
    }),
  ).current;

  const onClosePopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(onClose);
  }, [pan, onClose]);

  const onOpenPopup = useCallback(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  useEffect(() => {
    onOpenPopup();
  }, [onOpenPopup]);

  return (
    <View style={[StyleSheet.absoluteFill, {justifyContent: 'flex-end'}]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#000000',
            opacity: pan.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <TouchableWithoutFeedback onPress={onClosePopup}>
        <View style={{flex: 1}} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          flex: 1,
          transform: [{translateY: Animated.multiply(pan, h)}],
          justifyContent: 'flex-end',
        }}
        {...panResponder.panHandlers}>
        <View style={page.content}>
          <View style={page.header}>
            <Paragraph
              size={ParagraphSize.xl}
              style={{fontWeight: '600', color: TEXT_BASE_1}}>
              {title}
            </Paragraph>
            <Spacer />
            <IconButton onPress={onClosePopup}>
              <CloseCircle color={GRAPHIC_SECOND_2} />
            </IconButton>
          </View>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: Dimensions.get('window').width,
    backgroundColor: BG_1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});