import React, {useCallback, useEffect, useRef, useState} from 'react';

import {CUSTOM_JWT_TOKEN} from '@env';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';
import BN from 'bn.js';
import {PrivateKey, decrypt} from 'eciesjs';
import {Alert, Linking, ScrollView} from 'react-native';

import {Button, ButtonVariant, Input, Spacer, Text} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {Cloud} from '@app/services/cloud';
import {pushNotifications} from '@app/services/push-notifications';

messaging().onMessage(async remoteMessage => {
  console.log('onMessage', remoteMessage);
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('onNotificationOpenedApp', remoteMessage);
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('setBackgroundMessageHandler', remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('getInitialNotification', remoteMessage);
    }
  });

export const SettingsTestScreen = () => {
  const [initialUrl, setInitialUrl] = useState<null | string>(null);
  const [wc, setWc] = useState('');

  const iCloud = useRef(new Cloud()).current;

  const onPressRequestPermissions = async () => {
    await pushNotifications.requestPermissions();
  };

  useEffect(() => {
    Linking.getInitialURL().then(result => {
      setInitialUrl(result);
    });
  }, []);

  const onPressWc = () => {
    app.emit(Events.onWalletConnectUri, wc);
  };

  const checkICloudFile = useCallback(async () => {
    const exists = await iCloud.hasItem('haqq_backup');
    console.log('exists', exists);
  }, [iCloud]);

  const createICloudFile = useCallback(async () => {
    const exists = await iCloud.setItem('haqq_backup', '{"abc":"def"}');
    console.log('create', exists);
  }, [iCloud]);

  const readICloudFile = useCallback(async () => {
    const content = await iCloud.getItem('haqq_backup');
    console.log('read', content);
  }, [iCloud]);

  const removeICloudFile = useCallback(async () => {
    const content = await iCloud.removeItem('haqq_backup');
    console.log('remove', content);
  }, [iCloud]);

  const requestShare = useCallback(async () => {
    const token = await fetch(CUSTOM_JWT_TOKEN, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        email: 'andrey@haqq',
      }),
    });

    const authState = await token.json();
    const k1 = new PrivateKey();

    const req = await fetch('http://localhost:8080', {
      method: 'POST',
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'shareRequest',
        params: [authState.idToken, k1.publicKey.toHex()],
      }),
    });

    const response = await req.json();

    const decrypted = decrypt(
      k1.toHex(),
      new Buffer(response.result.hex_share, 'base64'),
    );

    console.log('req', new BN(decrypted));
  }, []);

  return (
    <ScrollView style={styles.container}>
      {initialUrl && (
        <Text t11 onPress={() => Clipboard.setString(initialUrl)}>
          initialUrl: {initialUrl}
        </Text>
      )}
      <Button
        title="Request permissions for push"
        onPress={onPressRequestPermissions}
        variant={ButtonVariant.contained}
      />
      <Spacer height={20} />
      <Input
        placeholder="wc:"
        value={wc}
        onChangeText={v => {
          setWc(v);
        }}
      />
      <Spacer height={5} />
      <Button
        title="wallet connect"
        disabled={!wc}
        onPress={onPressWc}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show modal"
        onPress={() => showModal('ledger-locked')}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="check cloud"
        onPress={() => checkICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="create cloud"
        onPress={() => createICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="read cloud"
        onPress={() => readICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="remove cloud"
        onPress={() => removeICloudFile()}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="Show captcha"
        onPress={async () => {
          try {
            const result = await awaitForCaptcha();
            Alert.alert('result', result);
          } catch (err) {
            // @ts-ignore
            Alert.alert('Error', err?.message);
          }
        }}
        variant={ButtonVariant.contained}
      />
      <Spacer height={8} />
      <Button
        title="fetch share"
        onPress={() => requestShare()}
        variant={ButtonVariant.contained}
      />
    </ScrollView>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
