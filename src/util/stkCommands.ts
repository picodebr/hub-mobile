/**
 * STK500 hexadecimal commands
 */
export const stk = <const>{
  OK: '10',
  FAILED: '11',
  UNKNOWN: '12',
  NODEVICE: '13',
  INSYNC: '14',
  NOSYNC: '15',
  ADC_CHANNEL_ERROR: '16',
  ADC_MEASURE_OK: '17',
  PWM_CHANNEL_ERROR: '18',
  PWM_ADJUST_OK: '19',
  CRC_EOP: '20',
  GET_SYNC: '30',
  GET_SIGN_ON: '31',
  SET_PARAMETER: '40',
  GET_PARAMETER: '41',
  SET_DEVICE: '42',
  SET_DEVICE_EXT: '45',
  ENTER_PROGMODE: '50',
  LEAVE_PROGMODE: '51',
  CHIP_ERASE: '52',
  CHECK_AUTOINC: '53',
  LOAD_ADDRESS: '55',
  UNIVERSAL: '56',
  PROG_FLASH: '60',
  PROG_DATA: '61',
  PROG_FUSE: '62',
  PROG_LOCK: '63',
  PROG_PAGE: '64',
  PROG_FUSE_EXT: '65',
  READ_FLASH: '70',
  READ_DATA: '71',
  READ_FUSE: '72',
  READ_LOCK: '73',
  READ_PAGE: '74',
  READ_SIGN: '75',
  READ_OSCCAL: '76',
  READ_FUSE_EXT: '77',
  READ_OSCCAL_EXT: '78',
  SW_MAJOR: '81',
  SW_MINOR: '82',
};

export type STK = typeof stk;
export type STKCommand = keyof STK;
export type STKValue = STK[keyof STK];
