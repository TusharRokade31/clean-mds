// api/config/phonepe.config.js
export const phonePeConfig = {
  UAT: {
    merchantId: 'PGTESTPAYUAT',
    saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    saltIndex: 1,
    baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox'
  },
  PROD: {
    merchantId: process.env.PHONEPE_MERCHANT_ID || 'M23MVE617LNAK',
    saltKey: process.env.PHONEPE_SALT_KEY || 'ZTYyYjQxNWMtNWE5MS00ODM4LWIzZmMtNjBkNDVlNTNmOGUz',
    saltIndex: 1,
    baseUrl: 'https://api.phonepe.com/apis/hermes'
  }
};