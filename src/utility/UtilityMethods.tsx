import { Alert, Dimensions, Linking, PixelRatio, Platform } from 'react-native';

let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

/**
 * Helper Functions
 *
 * @class UtilityMethods
 */
class UtilityMethodsClass {
  hp = (height: number | string): number => {
    const elemHeight = typeof height === 'number' ? height : parseFloat(height);
    return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
  };

  wp = (width: number | string): number => {
    const elemWidth = typeof width === 'number' ? width : parseFloat(width);
    return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
  };

  hasOnlyLetters = (str: string): boolean => {
    return /^[\p{L} ,.'-]+$/u.test(str);
  };

  parseJSON = (data: string | null): any => {
    data = data || '';
    try {
      return JSON.parse(data);
    } catch (error: any) {
      throw new Error(
        JSON.stringify({
          type: 'JSON.parse',
          message: error.stack,
          reason: error.message,
        }),
      );
    }
  };

  toJSON = (data: string | null): any => {
    data = data || '';
    try {
      return JSON.parse(data);
    } catch (error: any) {
      return {
        type: 'JSON.parse',
        message: error.stack,
        reason: error.message,
      };
    }
  };

  checkEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  };

  isUndefined = (data: any): boolean => {
    return data === undefined;
  };

  bytesToSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  };

  capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  getRandomString = (length: number): string => {
    const randomChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length),
      );
    }
    return result;
  };

  hasNotch = (): boolean => {
    const { height, width } = Dimensions.get('window');
    return Platform.OS === 'ios' && (height >= 812 || width >= 812);
  };

  isIphoneX = (): boolean => {
    const { height, width } = Dimensions.get('window');
    return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTV &&
      (height === 780 ||
        width === 780 ||
        height === 812 ||
        width === 812 ||
        height === 844 ||
        width === 844 ||
        height === 896 ||
        width === 896 ||
        height === 926 ||
        width === 926)
    );
  };

  hex2rgba = (hex: string, alpha = 1): string => {
    const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  };

  getAppUrl = (): string => {
    return Platform.OS === 'ios' ? 'iosAppUrl' : 'androidAppUrl'; // Replace with actual app URLs.
  };

  isIosDevice = (): boolean => {
    return Platform.OS === 'ios';
  };

  getBottomSpace = (): number => {
    return this.isIphoneX() ? 34 : 0;
  };

  getLocalImagePath = (imagePath: string): string => {
    return Platform.OS === 'ios' ? `file://${imagePath}` : imagePath;
  };
  getRecevierInfo = (MemebersArry: any, userInfo: any) => {
    if (MemebersArry && MemebersArry.length > 0) {
      const receiver = MemebersArry.find(
        (item: any) => item._id !== userInfo._id,
      );
      return receiver;
    }
    return null;
  };
  convertoSentenseCase = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  appendHttpsToUrl = (url: string): string => {
    if (!url || url.trim() === '') {
      return '';
    }

    // Check if URL already has a protocol or starts with www
    if (
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('www.')
    ) {
      return url;
    }

    // Append https:// to the URL
    return `https://${url}`;
  };
}

const UtilityMethods = new UtilityMethodsClass();

export default UtilityMethods;
