import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Button, Text, TouchableOpacity, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useWallets} from '../contexts/wallets';
import {useTransactions} from '../contexts/transactions';
import {TransactionPreview} from '../components/transaction-preview';

type DetailsScreenProp = CompositeScreenProps<any, any>;

export const DetailsScreen = ({navigation, route}: DetailsScreenProp) => {
  const {address} = route.params;
  const wallets = useWallets();
  const transactions = useTransactions();

  const [transactionsList, setTransactionsList] = useState([]);

  useEffect(() => {
    transactions.getTransactions(address).then(result => {
      return setTransactionsList(result);
    });
  }, [address, transactions]);

  const onRemove = useCallback(() => {
    return Alert.alert(
      'Are your sure?',
      'Are you sure you want to remove this wallet?',
      [
        {
          text: 'Yes',
          onPress: () => {
            wallets.removeWallet(address).then(() => {
              navigation.goBack();
            });
          },
        },
        {
          text: 'No',
        },
      ],
    );
  }, [wallets, address, navigation]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Details Screen</Text>
      <TouchableOpacity onPress={() => Clipboard.setString(address)}>
        <Text>{address}</Text>
      </TouchableOpacity>
      <Button
        title="Send transaction"
        onPress={() => navigation.navigate('transaction', {from: address})}
      />
      <Button
        title="Show qr"
        onPress={() => navigation.navigate('details-qr', {address: address})}
      />
      {transactionsList.map(transaction => (
        <TransactionPreview transaction={transaction} key={transaction.hash} />
      ))}
      <View style={{flex: 1}} />
      <Button title="Remove account" onPress={onRemove} />
    </View>
  );
};