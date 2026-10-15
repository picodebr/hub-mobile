/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {APP_FRONTEND_URL} from '@env';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {useNavigate} from 'react-router-native';
import {Container, Webview} from './styles';
import {Serial, SerialStatus} from '../../util/Serial';
import {delay} from '../../util/delay';
import {stk} from '../../util/stkCommands';
import {waitForDeviceSync, writeSerialCode} from '../../util/writeSerialCode';
import {ICompiledCode} from '../../interfaces/Code/Code';
import {AppStatus} from '../../interfaces/AppStatus/AppStatus';
import {LoadingScreen} from '../../components/LoadingScreen';
import {appError, appLog} from '../../util/appLog';
import Orientation from 'react-native-orientation-locker';

const timeConstants = {
  bootloaderStartup: 500,
  waitWebviewLoad: 1000,
  uploadedMessageDelay: 2000,
  compilingErrorMessageDelay: 2000,
};

export const Code: React.FC = () => {
  const [serialStatus, setSerialStatus] = useState<SerialStatus>('stopped');
  const [appStatus, setAppStatus] = useState<AppStatus>('starting');
  const [code, setCode] = useState<ICompiledCode>();
  const [isLandscape, setIsLandscape] = useState(false);
  const serial = useMemo(() => new Serial(), []);
  const webviewRef = useRef<WebView>(null);
  const mounted = useRef(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   isLandscape ? Orientation.lockToLandscape() : Orientation.lockToPortrait();
  // }, [isLandscape]);

  useEffect(() => {
    mounted.current = true;
    console.log('APP_FRONTEND_URL', APP_FRONTEND_URL);

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    serial.startUsbService();
    serial.addListener('onstatus', setSerialStatus);
    serial.addListener('error', console.warn);

    return () => {
      serial.removeListener('error', console.warn);
      serial.removeListener('onstatus', setSerialStatus);
      serial.stopUsbService();
    };
  }, [serial]);

  const uploadCode = useCallback(
    async (compiledCode: ICompiledCode) => {
      // check if board is in sync (3x)
      for (let i = 0; i < 3; i += 1) {
        await Serial.writeCommand(stk.GET_SYNC);
        await waitForDeviceSync(serial);
      }

      await writeSerialCode(serial, compiledCode.build_data);
    },
    [serial],
  );

  useEffect(() => {
    const talkToBootloader = async () => {
      try {
        if (serialStatus !== 'connected' || appStatus !== 'compiled' || !code)
          return;

        //setAppStatus('wait_reset_click');
        await uploadCode(code);

        setAppStatus('uploaded');
      } catch (err) {
        appError(err);
        setAppStatus('upload_failed');
      }
    };
    
    setAppStatus('wait_reset_click');
    talkToBootloader();
  }, [serialStatus, code, appStatus, uploadCode]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (typeof data !== 'object') return;

        if (data.orientation) {
          setIsLandscape(true);
          return;
        }

        if (data.build_data) {
          setIsLandscape(true);

          await serial.reconnect();
          await delay(timeConstants.bootloaderStartup);

          setCode(data);
          setAppStatus('compiled');
        }
      } catch (err) {
        const netStatus = await NetInfo.fetch();
        if (!netStatus.isConnected) {
          navigate('/no-internet');
          return;
        }

        appError('ERROR:', err);
        setAppStatus('compilation_failed');
      }
    },
    [navigate, serial],
  );

  const handleLoad = useCallback(async () => {
    if (!webviewRef.current) return;

    webviewRef.current?.postMessage('mobile-app');

    await delay(timeConstants.waitWebviewLoad);

    if (mounted.current) setAppStatus('waiting_to_connect');
  }, [mounted]);

  const handleWebviewError = useCallback(
    () => navigate('/no-internet'),
    [navigate],
  );

  useEffect(() => {
    if (appStatus === 'waiting_to_connect' && serialStatus === 'connected')
      setAppStatus('ready_to_compile');
    else if (
      appStatus !== 'compiling' &&
      appStatus !== 'starting' &&
      appStatus !== 'compiled' &&
      serialStatus !== 'connected'
    )
      setAppStatus('waiting_to_connect');
  }, [appStatus, serialStatus]);

  useEffect(() => {
    webviewRef.current?.postMessage(appStatus);
    appLog(
      'appStatus:',
      appStatus.padEnd(20, ' '),
      'serialStatus:',
      serialStatus,
    );
  }, [appStatus, serialStatus]);

  useEffect(() => {
    if (appStatus !== 'uploaded') return () => ({});

    const desc = setTimeout(
      () => setAppStatus('ready_to_compile'),
      timeConstants.uploadedMessageDelay,
    );

    return () => clearTimeout(desc);
  }, [appStatus]);

  useEffect(() => {
    if (appStatus !== 'compilation_failed') return () => ({});

    const desc = setTimeout(
      () => setAppStatus('ready_to_compile'),
      timeConstants.compilingErrorMessageDelay,
    );

    return () => clearTimeout(desc);
  }, [appStatus]);

  useEffect(() => {
    if (appStatus === 'upload_failed' && serialStatus === 'started')
      setAppStatus('waiting_to_connect');
  }, [appStatus, serialStatus]);

  const handleOnLayout = useCallback(() => {
    webviewRef.current?.postMessage(appStatus);
  }, [appStatus]);

  return (
    <Container>
      <Webview
        ref={webviewRef}
        source={{uri: `https://hub.picode.com.br`}}
        startInLoadingState
        onMessage={handleMessage}
        onLoadEnd={handleLoad}
        onError={handleWebviewError}
        onLayout={handleOnLayout}
        mediaPlaybackRequiresUserAction={false}
      />
      <LoadingScreen show={appStatus === 'starting'} />
    </Container>
  );
};
