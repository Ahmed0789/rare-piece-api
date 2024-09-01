import dotenv from 'dotenv';
dotenv.config();

export const config = {
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
    },
    database: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/hapi-api'
    },
    auth: {
        cookie: {
            name: 'auth',
            password: process.env.COOKIE_SECRET || 'verysecretpassword',
            isSecure: false, // Set to true in production
            ttl: 24 * 60 * 60 * 1000, // 1 day
        },
    },
};