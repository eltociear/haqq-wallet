import {Button, ButtonVariant, Container, LottieWrap, Spacer, Text} from './ui';
import React from 'react';
import {StyleSheet} from 'react-native';

export type FinishProps = {
  title: string;
  onFinish: () => void;
};

export const Finish = ({title, onFinish}: FinishProps) => {
  return (
    <Container>
      <Spacer>
        <LottieWrap
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Text t4 style={page.title}>
        {title}
      </Text>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={onFinish}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  title: {marginBottom: 76, textAlign: 'center'},
  button: {marginBottom: 16},
});