import {Serial} from './Serial';
import {stk} from './stkCommands';

interface IWaitResponseOptions {
  timeout?: number;
}

type LoopThroughPageCallback = (
  params: ILoopThroughCallbackParams,
) => Promise<void>;

interface ILoopThroughCallbackParams {
  writtenCode: string;
  pageAddress: number;
  page: number;
  pages: number;
}

const PAGE_SIZE = 0x80; // 128 bytes
const MEMORY_CODE_HEX = 'F'.charCodeAt(0).toString(16).padStart(2, '0');
const STK_STOP = String.fromCharCode(parseInt(stk.OK, 16));

export const waitForDeviceSync = async (
  serial: Serial,
  options: IWaitResponseOptions = {},
) => await serial.read({...options, stopString: STK_STOP});

const formatPageAddressToSend = (address: number) => {
  return address
    .toString(16)
    .padStart(4, '0')
    .split('')
    .map((e, i, a) => (i % 2 === 0 ? `${e}${a[i + 1]}` : ''))
    .filter(e => e)
    .reverse()
    .join('');
};

const writeCodePage = async (
  serial: Serial,
  code: string,
  pageAddress: number,
) => {
  await Serial.writeCommand(
    stk.LOAD_ADDRESS,
    formatPageAddressToSend(pageAddress),
  );
  await waitForDeviceSync(serial);

  await Serial.writeCommand(
    stk.PROG_PAGE,
    (code.length / 2).toString(16).padStart(4, '0'),
    MEMORY_CODE_HEX,
    code,
  );
  await waitForDeviceSync(serial);
};

const loopThroughCodePages = async (
  code: number[],
  callback: LoopThroughPageCallback,
) => {
  const pages = Math.ceil(code.length / PAGE_SIZE);

  for (let page = 0; page < pages; page += 1) {
    const codeIndex = page * PAGE_SIZE;
    const codeSlice = code.slice(codeIndex, codeIndex + PAGE_SIZE);
    const pageAddress = codeIndex / 2; // 2 bytes each memory address
    const writtenCode = codeSlice
      .map(e => e.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    await callback({
      writtenCode,
      pageAddress,
      page,
      pages,
    });
  }
};

export const writeSerialCode = async (serial: Serial, code: number[]) => {
  await Serial.writeCommand(stk.ENTER_PROGMODE);
  await waitForDeviceSync(serial);

  await loopThroughCodePages(code, async ({writtenCode, pageAddress}) => {
    await writeCodePage(serial, writtenCode, pageAddress);
  });

  await Serial.writeCommand(stk.LEAVE_PROGMODE);
  await waitForDeviceSync(serial);
};
