import CryptoJS from 'crypto-js';

export const signRequest = (params, appSecret) => {
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key];
    return acc;
  }, {});

  let baseString = appSecret;
  for (const key in sortedParams) {
    baseString += key + sortedParams[key];
  }
  baseString += appSecret;

  return CryptoJS.MD5(baseString).toString(CryptoJS.enc.Hex).toUpperCase();
};