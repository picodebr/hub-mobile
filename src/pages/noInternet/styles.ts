import styled from 'styled-components/native';

export const Container = styled.View`
  height: 100%;
  padding: 16px;
  background-color: ${props => props.theme.colors.background};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Image = styled.Image`
  width: 80px;
  height: 80px;
  resize-mode: contain;
`;

export const Title = styled.Text`
  margin-top: 16px;
  font-size: 24px;
  color: ${props => props.theme.colors.textDark};
`;

export const Description = styled.Text`
  margin-top: 16px;
  font-size: 18px;
  color: ${props => props.theme.colors.textDark};
`;

export const TryAgainButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.backgroundMedium};
  margin-top: 28px;
  border-radius: 6px;
`;

export const TryAgainContent = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
`;

export const TryAgainImage = styled.Image`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

export const TryAgainMessage = styled.Text`
  font-size: 20px;
  color: ${props => props.theme.colors.textDark};
`;
