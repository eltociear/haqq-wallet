import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button, ButtonVariant, Container, Text} from '../components/ui';
import {TEXT_BASE_2} from '../variables';
import {RootStackParamList} from '../types';

const logoImage = require('../../assets/images/logo-empty.png');

export const WelcomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <Container testID="welcome">
      <View style={page.container}>
        <Image source={logoImage} style={page.imageStyle} />
        <Text t4 style={page.title}>
          No wallet is connected
        </Text>
        <Text t11 style={page.textStyle}>
          You can create a new wallet or connect any existing{'\u00A0'}one
        </Text>
      </View>

      <Button
        testID="welcome_signup"
        style={page.button}
        variant={ButtonVariant.contained}
        title="Create a wallet"
        onPress={() => navigation.navigate('signup', {next: 'create'})}
      />
      <Button
        testID="welcome_signin"
        style={page.button}
        title="I already have a wallet"
        onPress={() => navigation.navigate('signin', {next: 'restore'})}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 4},
  button: {marginBottom: 16},
  textStyle: {textAlign: 'center', color: TEXT_BASE_2},
  imageStyle: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 28,
  },
});