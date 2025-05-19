export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: '30d',
    cookieExpire: 30  // This needs to be a number
  }
   ,
    bcrypt: {
      saltRounds: 10
    }
  };