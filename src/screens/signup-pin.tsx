import React, {useCallback, useRef} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';

import {MpcPin} from '@app/components/mpc-pin';
import {PinInterface} from '@app/components/pin';
import {captureException} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';

export const SignupPinScreen = () => {
  const pinRef = useRef<PinInterface>();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signupPin'>();
  const user = useUser();

  const onPin = useCallback(
    async (password: string) => {
      if (route.params.type === 'mpc') {
        try {
          const {securityQuestionsModule} = await initializeTKey(
            route.params.mpcPrivateKey,
            serviceProviderOptions as any,
            storageLayerOptions,
          );

          await securityQuestionsModule.inputShareFromSecurityQuestions(
            password,
          );

          const nextScreen = user.onboarded
            ? 'signupStoreWallet'
            : 'onboardingSetupPin';

          navigation.navigate(nextScreen, {
            ...route.params,
            mpcSecurityQuestion: password,
          });
        } catch (e) {
          if (e instanceof Error) {
            if ('code' in e && e.code === 2103) {
              throw new Error('wrong_password');
            } else {
              captureException(e, 'mpc backup check password');
            }
          }
        }
      } else {
        const nextScreen = user.onboarded
          ? 'signupStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, route.params);
      }
    },
    [navigation, route.params, user.onboarded],
  );

  return <MpcPin onPin={onPin} pinRef={pinRef} />;
};