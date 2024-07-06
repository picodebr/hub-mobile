import {EventEmitter} from 'events';
import {DeviceEventEmitter} from 'react-native';
import {
  actions,
  definitions,
  ReturnedDataTypes,
  RNSerialport,
} from 'react-native-serialport';
import {delay} from './delay';
import {stk} from './stkCommands';

export type SerialStatus = 'stopped' | 'started' | 'attached' | 'connected';

interface IHandlers {
  serviceStart: InstanceType<typeof Serial>['handleServiceStart'];
  serviceStop: InstanceType<typeof Serial>['handleServiceStop'];
  deviceAttach: InstanceType<typeof Serial>['handleDeviceAttach'];
  deviceDetach: InstanceType<typeof Serial>['handleDeviceDetach'];
  deviceConnected: InstanceType<typeof Serial>['handleDeviceConnected'];
  deviceDisconnected: InstanceType<typeof Serial>['handleDeviceDisconnected'];
  error: InstanceType<typeof Serial>['handleError'];
  readData: InstanceType<typeof Serial>['handleReadData'];
}

interface IServiceStartResponse {
  deviceAttached: boolean;
}

interface IReadData {
  payload: number[] | string;
}

interface IConnectionState {
  baudRate: number;
  interface: number;
  returnedDataType: ReturnedDataTypes;
}

interface IReadOptions {
  timeout?: number;
  stopString?: string;
}

/**
 * Serial communication class
 */

export class Serial extends EventEmitter {
  private handlers = {} as IHandlers;

  private status = 'stopped' as SerialStatus;

  private readBuffer = '';

  private connectionState = {} as IConnectionState;

  constructor(connectionState?: IConnectionState) {
    super();
    this.initConnectionState(connectionState);
    this.createEventHandlers();
    this.addEventListeners();
  }

  public static async writeCommand(...commands: string[]) {
    if (commands[commands.length - 1] !== stk.CRC_EOP) {
      commands.push(stk.CRC_EOP);
    }

    const commandsHexString = commands.join('').toUpperCase();

    // console.log(formatLogData(commandsHexString, 'TX'));

    RNSerialport.writeHexString(commandsHexString);
    await delay(1);
  }

  public async read(options?: IReadOptions) {
    const timeout = options?.timeout || 1000; // 0 will be ignored
    const stopString = options?.stopString || '';

    return new Promise<string>((res, rej) => {
      if (this.readBuffer && this.readBuffer.indexOf(stopString) !== -1) {
        const [read, ...rest] = stopString
          ? this.readBuffer.split(stopString)
          : [this.readBuffer, ''];

        this.readBuffer = rest.join('');
        res(read + stopString);

        return;
      }

      let descriptor = 0;

      const handleReadBuffer = () => {
        if (!this.readBuffer || this.readBuffer.indexOf(stopString) === -1) {
          return;
        }

        clearTimeout(descriptor);
        this.removeListener('onread', handleReadBuffer);

        const [read, ...rest] = stopString
          ? this.readBuffer.split(stopString)
          : [this.readBuffer, ''];

        this.readBuffer = rest.join('');
        res(read + stopString);
      };

      descriptor = setTimeout(() => {
        this.removeListener('onread', handleReadBuffer);
        rej(
          new Error(
            `Timeout. Serial read response time exceeded ${timeout} ms.`,
          ),
        );
      }, timeout);

      this.addListener('onread', handleReadBuffer);
    });
  }

  public appendToReadBuffer(text: string) {
    this.readBuffer += text;
  }

  private addEventListeners() {
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STARTED,
      this.handlers.serviceStart,
    );

    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STOPPED,
      this.handlers.serviceStop,
    );

    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_ATTACHED,
      this.handlers.deviceAttach,
    );

    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_DETACHED,
      this.handlers.deviceDetach,
    );

    DeviceEventEmitter.addListener(
      actions.ON_CONNECTED,
      this.handlers.deviceConnected,
    );

    DeviceEventEmitter.addListener(
      actions.ON_DISCONNECTED,
      this.handlers.deviceDisconnected,
    );

    DeviceEventEmitter.addListener(actions.ON_ERROR, this.handlers.error);

    DeviceEventEmitter.addListener(
      actions.ON_READ_DATA,
      this.handlers.readData,
    );
  }

  public startUsbService() {
    if (this.status !== 'stopped') {
      return;
    }

    RNSerialport.setReturnedDataType(this.connectionState.returnedDataType);
    RNSerialport.setAutoConnectBaudRate(this.connectionState.baudRate);
    RNSerialport.setInterface(this.connectionState.interface);
    RNSerialport.setAutoConnect(true);
    RNSerialport.startUsbService();
  }

  public async reconnect(timeout = 1000): Promise<void> {
    if (this.status !== 'connected') return Promise.resolve();

    RNSerialport.disconnect();
    RNSerialport.stopUsbService();
    RNSerialport.startUsbService();

    return new Promise((res, rej) => {
      let statusHandler: any;

      const desc = setTimeout(() => {
        this.removeListener('onstatus', statusHandler);
        rej(new Error('Serial reconnect timeout'));
      }, timeout);

      statusHandler = (status: SerialStatus) => {
        if (status !== 'connected') return;

        this.removeListener('onstatus', statusHandler);
        clearTimeout(desc);
        res();
      };

      this.addListener('onstatus', statusHandler);
    });
  }

  private initConnectionState(connectionState?: IConnectionState) {
    this.connectionState = {
      baudRate: 115200,
      interface: -1,
      returnedDataType: definitions.RETURNED_DATA_TYPES
        .HEXSTRING as ReturnedDataTypes,
      ...(connectionState || {}),
    };
  }

  private createEventHandlers() {
    this.handlers = {
      serviceStart: this.handleServiceStart.bind(this),
      serviceStop: this.handleServiceStop.bind(this),
      deviceAttach: this.handleDeviceAttach.bind(this),
      deviceDetach: this.handleDeviceDetach.bind(this),
      deviceConnected: this.handleDeviceConnected.bind(this),
      deviceDisconnected: this.handleDeviceDisconnected.bind(this),
      error: this.handleError.bind(this),
      readData: this.handleReadData.bind(this),
    };
  }

  async stopUsbService() {
    if (this.status === 'stopped') {
      return;
    }

    DeviceEventEmitter.removeAllListeners();
    const isOpen = await RNSerialport.isOpen();

    if (isOpen) RNSerialport.disconnect();

    RNSerialport.stopUsbService();
  }

  private handleServiceStart(response: IServiceStartResponse) {
    this.setStatus('started');

    if (response.deviceAttached) {
      this.handleDeviceAttach();
    }
  }

  private handleServiceStop() {
    this.setStatus('stopped');
  }

  private handleDeviceAttach() {
    this.setStatus('attached');
  }

  private handleDeviceDetach() {
    if (this.status !== 'stopped') {
      this.setStatus('started');
    }
  }

  private handleDeviceConnected() {
    this.setStatus('connected');
  }

  private handleDeviceDisconnected() {
    if (this.status === 'connected') {
      this.setStatus('attached');
    }
  }

  private handleError(error: Error) {
    this.emit('error', error);
  }

  private handleReadData(data: IReadData) {
    const type = this.connectionState.returnedDataType;
    let serialInput = '';

    if (type === definitions.RETURNED_DATA_TYPES.INTARRAY) {
      serialInput = RNSerialport.intArrayToUtf16(data.payload as number[]);
    } else if (type === definitions.RETURNED_DATA_TYPES.HEXSTRING) {
      serialInput = RNSerialport.hexToUtf16(data.payload as string);
    }

    this.readBuffer += serialInput;

    this.emit('onread', serialInput);
  }

  private setStatus(status: SerialStatus) {
    this.status = status;
    this.emit('onstatus', status);
  }
}
