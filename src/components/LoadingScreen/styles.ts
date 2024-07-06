import {Animated} from 'react-native';
import styled from 'styled-components/native';

interface IContainerProps {
  show: boolean;
}

export const Container = styled.View<IContainerProps>`
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.background};
  display: ${props => (props.show ? 'flex' : 'none')};
  z-index: 1000;

  align-items: center;
  justify-content: center;
`;

export const Logo = styled(Animated.Image)`
  width: 100%;
  height: 220px;
`;
