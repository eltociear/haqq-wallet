import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import {isBefore} from 'date-fns';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {moderateVerticalScale} from '@app/helpers/scaling-utils';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {NumericKeyboard} from './pin/numeric-keyboard';
import {ErrorText, Spacer, Text} from './ui';

export type PinProps = {
  onPin: (pin: string) => void;
  subtitle?: string;
  onLock?: () => void;
  additionButton?: React.ReactNode;
  title: I18N;
  i18params?: Record<string, string>;
};

export interface PinInterface {
  reset: (message?: string) => void;
  locked: (until?: Date | null) => void;
}

export const Pin = forwardRef(
  (
    {
      subtitle,
      onPin,
      onLock,
      additionButton,
      title,
      i18params = undefined,
    }: PinProps,
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [locked, setLocked] = useState<Date | null>(null);

    useEffect(() => {
      if (locked !== null) {
        if (isBefore(new Date(), locked)) {
          onLock?.();
        }
        const timer = setInterval(() => {
          if (isBefore(new Date(), locked)) {
            const interval = Math.round((+locked - +new Date()) / 1000);
            const left = `${String(Math.floor(interval / 60)).padStart(
              2,
              '0',
            )}:${String(interval % 60).padStart(2, '0')}`;

            setError(
              'Too many attempts, please wait for {timer}'.replace(
                '{timer}',
                left,
              ),
            );
          } else {
            clearInterval(timer);
            setLocked(null);
            setError('');
          }
        }, 1000);

        return () => {
          clearInterval(timer);
        };
      }
    }, [locked, onLock]);

    useImperativeHandle(ref, () => ({
      reset(message?: string) {
        if (message) {
          vibrate(HapticEffects.error);
          setError(message);
        }
        setPin('');
      },
      locked(until: Date | null) {
        setLocked(until);
        setPin('');
      },
    }));

    const onKeyboard = useCallback(
      (value: number) => {
        if (!locked) {
          vibrate();
          if (value > -1) {
            setPin(p => `${p}${value}`.slice(0, 6));
          } else {
            setPin(p => p.slice(0, p.length - 1));
          }
        } else {
          vibrate(HapticEffects.error);
        }
      },
      [locked],
    );

    useEffect(() => {
      if (pin.length === 6) {
        onPin(pin);
      }
    }, [onPin, pin]);

    return (
      <View style={[page.container, {paddingBottom: insets.bottom}]}>
        <Text t4 i18n={title} i18params={i18params} style={page.title} />
        {error && <ErrorText e0>{error}</ErrorText>}
        {subtitle && !error && (
          <Text t11 color={Color.textBase2} center>
            {subtitle}
          </Text>
        )}

        <Spacer style={page.spacer}>
          <View style={page.dots}>
            <View style={[page.dot, pin.length >= 1 && page.active]} />
            <View style={[page.dot, pin.length >= 2 && page.active]} />
            <View style={[page.dot, pin.length >= 3 && page.active]} />
            <View style={[page.dot, pin.length >= 4 && page.active]} />
            <View style={[page.dot, pin.length >= 5 && page.active]} />
            <View style={[page.dot, pin.length >= 6 && page.active]} />
          </View>
        </Spacer>
        <NumericKeyboard onPress={onKeyboard} additionButton={additionButton} />
      </View>
    );
  },
);

const page = createTheme({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: Color.graphicSecond2,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: Color.textGreen1,
    transform: [{scale: 1}],
  },
  title: {
    marginTop: moderateVerticalScale(40, 8),
    marginBottom: 12,
    textAlign: 'center',
  },
});
