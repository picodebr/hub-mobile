import React, {useEffect, useMemo} from 'react';

import {Animated} from 'react-native';
import {Container, Logo} from './styles';

import rocket from '../../assets/icons/rocket-loading.gif';
import {ILoadingScreenProps} from './interfaces';

const ANIMATION_DURATION = 1300; // 1s

export const LoadingScreen: React.FC<ILoadingScreenProps> = ({show}) => {
  const rotationAnimation = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!show) return () => ({});

    let animation: Animated.CompositeAnimation;
    let running = true;

    const animate = () => {
      animation = Animated.timing(rotationAnimation, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: v => v,
        useNativeDriver: true,
      });

      animation.start(() => {
        if (!running) return;

        rotationAnimation.setValue(0);
        animate();
      });
    };

    animate();

    return () => {
      running = false;
      animation.stop();
    };
  }, [rotationAnimation, show]);

  return (
    <Container show={show}>
      <Logo
        source={rocket}
        // style={{
        //   transform: [
        //     {
        //       rotateZ: rotationAnimation.interpolate({
        //         inputRange: [0, 1],
        //         outputRange: ['0deg', '360deg'],
        //       }),
        //     },
        //   ],
        // }}
      />
    </Container>
  );
};
