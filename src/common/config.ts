export interface IAppSettings {
    loggingEnabled: boolean;
    isProduction: boolean;

    cors_origins: string;

    session_secret: string;

    connectionStrings: {
        mongo: string;
        rabbit: string;
    }

    endpoints: {
        barfs: string;
        users: string;
    }

    auth0: {
        client_id: string;
        client_secret: string;
        domain: string;
        callback_url: string;
        jwt_issuer: string;
        jwt_audience: string;
        jwks_uri: string;
    }
};

const dev: IAppSettings = {
    cors_origins: "http://localhost:3100",
    loggingEnabled: true,
    isProduction: false,
    session_secret: "23ricdzk234234rwdsjsdflksdf23rwsdf",

    connectionStrings: {
        mongo: "mongodb://barfer:fRYXFCmd8IF6KhVw@cluster0-shard-00-00-yuik9.mongodb.net:27017,cluster0-shard-00-01-yuik9.mongodb.net:27017,cluster0-shard-00-02-yuik9.mongodb.net:27017/barfer?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",
        rabbit: "amqp://ttbpnbfu:7hfcmVuEDM4d-47mgZntCOceiXkMz9b3@lark.rmq.cloudamqp.com/ttbpnbfu"
    },

    endpoints: {
        barfs: "http://localhost:3000",
        users: "http://localhost:3001"
    },
    auth0: {
        client_id: "J0rv26KV7CarQk2lf16UF6PMg8E6UczL",
        client_secret: "r7_0r9_Aktp9NWGpBh0LF3lDf8frCKIjeS3582QPZntng5yxxnVKQf3fgk-YjeyJ",
        domain: "mizrael.auth0.com",
        callback_url: "http://localhost:3100/callback",
        jwks_uri: "https://mizrael.auth0.com/.well-known/jwks.json",
        jwt_audience: "barfer-api-gateway",
        jwt_issuer: "https://mizrael.auth0.com/",
    }
}, prod: IAppSettings = {
    cors_origins: "http://barfer.azurewebsites.net",
    loggingEnabled: false,
    isProduction: true,

    session_secret: "23ewdsczxkzjnxc23!%$£sdfxcdsgfsff",

    connectionStrings: {
        mongo: "mongodb://barfer:fRYXFCmd8IF6KhVw@cluster0-shard-00-00-yuik9.mongodb.net:27017,cluster0-shard-00-01-yuik9.mongodb.net:27017,cluster0-shard-00-02-yuik9.mongodb.net:27017/barfer?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",
        rabbit: "amqp://ttbpnbfu:7hfcmVuEDM4d-47mgZntCOceiXkMz9b3@lark.rmq.cloudamqp.com/ttbpnbfu"
    },
    endpoints: {
        barfs: "http://api-barfer.azurewebsites.net",
        users: "http://api-users-barfer.azurewebsites.net"
    },
    auth0: {
        client_id: "J0rv26KV7CarQk2lf16UF6PMg8E6UczL",
        client_secret: "r7_0r9_Aktp9NWGpBh0LF3lDf8frCKIjeS3582QPZntng5yxxnVKQf3fgk-YjeyJ",
        domain: "mizrael.auth0.com",
        callback_url: "http://barfer.azurewebsites.net/callback",
        jwks_uri: "https://mizrael.auth0.com/.well-known/jwks.json",
        jwt_audience: "barfer-api-gateway",
        jwt_issuer: "https://mizrael.auth0.com/",
    }
};

// export function config() {
//     const isProd = (process.env.NODE_ENV === 'production'),
//         currConfig = isProd ? prod : dev;

//     return currConfig;
// };

const isProd = (process.env.NODE_ENV === 'production');

export const config = isProd ? prod : dev;