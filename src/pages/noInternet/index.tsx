import React from 'react';

import {useNavigate} from 'react-router-native';
import {
  Container,
  Description,
  Title,
  TryAgainButton,
  TryAgainContent,
  TryAgainImage,
  TryAgainMessage,
} from './styles';

import reload from '../../assets/icons/reload.png';

export const NoInternet: React.FC = () => {
  const navigate = useNavigate();

  const handlePress = () => {
    navigate('/');
  };

  return (
    <Container>
      {/* <Image source={noInternet} /> */}

      <Title>Offline</Title>

      <Description>
        Verifique sua conexão com a internet e tente novamente.
      </Description>

      <TryAgainButton onPress={handlePress}>
        <TryAgainContent>
          <TryAgainImage source={reload} />
          <TryAgainMessage>Tentar novamente</TryAgainMessage>
        </TryAgainContent>
      </TryAgainButton>
    </Container>
  );
};
