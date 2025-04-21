var config = {
    REST_URL: process.env.REST_URL || 'https://rcx-crud.sales2.rcx-demo.lmvi.net',
    RC_REST_URL: process.env.RC_REST_URL || 'https://rcx-rc.sales2.rcx-demo.lmvi.net',
    VERSION: process.env.RLE_VERSION || '/api/v1',
    PORT: process.env.PORT || 4200,
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION || 'us-west-2',
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'us-west-2_RBQnGKlcf',
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '5eo1hjeri3ot3ucdf9dkt3r7ls',
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    USER_NAME: process.env.USER_NAME || 'demo/vgunasekaran',
    USER_PASSWORD: process.env.USER_PASSWORD || 'Password1',
    DEFAULT_PROGRAM: process.env.DEFAULT_PROGRAM || '679740ede2d844ac5ff54af3',
    logFormat: ":remote-addr - - \":method :url HTTP/:http-version\" :status :content-length \":referrer\" \":user-agent\" \":response-time ms\" ",
    cardName: process.env.CARD_NAME || 'CardID'
};
module.exports = config;