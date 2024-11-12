import secrets from './secrets.json';

const config = {
  ipAddress: secrets.IpAdr,
  timeout: 5000,
  longTimeout: 10000,
};

export default config;