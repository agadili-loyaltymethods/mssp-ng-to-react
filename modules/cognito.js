const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession
} = AmazonCognitoIdentity;

const AWS = require('aws-sdk');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');

const config = require('./../config');
const logger = require('log4js').getLogger();
const { reqParser } = require('./../utils');

const poolData = {
  UserPoolId: config.COGNITO_USER_POOL_ID,
  ClientId: config.COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);
const poolRegion = config.AWS_DEFAULT_REGION;

const Cognito = {};

Cognito.userAttributes = [
  "name",
  "preffered_username",
  "gender",
  "birthdate",
  "address",
  "email",
  "phone_number",
  "custom:memberId",
  "custom:loyaltyId"
];

Cognito.register = (user) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    attributeList.push(new CognitoUserAttribute({ Name: "email", Value: user.email }));

    attributeList.push(new CognitoUserAttribute({ Name: "custom:firstname", Value: user.firstName }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:lastname", Value: user.lastName }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:gender", Value: user.gender }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:dob", Value: user.dob }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:address", Value: user.address }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:city", Value: user.city }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:country", Value: user.country }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:state", Value: user.state }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:zipcode", Value: user.zipCode }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:cellphone", Value: user.cellPhone }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:loyaltyId", Value: user.loyaltyId }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:orgId", Value: user.orgId }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:referralCode", Value: user.referralCode }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:tnc", Value: user.tnc ? 'Yes' : 'No' }));
    attributeList.push(new CognitoUserAttribute({ Name: "custom:emailOffers", Value: user.emailoffers ? 'Yes' : 'No' }));

    userPool.signUp(user.email, user.password, attributeList, null, function (err, result) {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      return resolve(result.user);
    });
  });
};

Cognito.login = (loginDetails) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: loginDetails.username,
      Password: loginDetails.password,
    });

    const userData = {
      Username: loginDetails.username,
      Pool: userPool
    };
    let cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (data) {
        // TODO:: Handle below details and add memberId and loyaltyId
        let result = {
          accessToken: data.getAccessToken().getJwtToken(),
          idToken: data.getIdToken().getJwtToken(),
          refreshToken: data.getRefreshToken().getToken()
        };

        return resolve(result);
      },
      onFailure: function (err) {
        logger.error(err);
        return reject(err);
      },

    });
  });
};

Cognito.updateAttributes = (cognitoUser, updateObj) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    //TODO:: Should implement Attributes
    for (let field in updateObj) {
      attributeList.push(new CognitoUserAttribute({
        Name: `custom:${field}`,
        Value: updateObj[field]
      }));
    }

    cognitoUser.updateAttributes(attributeList, (err, result) => {
      if (err) {
        logger.error(err);
        return reject(err);
      } else {
        return resolve(result);
      }
    });

  });
};

Cognito.validateToken = (token) => {
  // below authorization null is mandatory
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axios({
        url: `https://cognito-idp.${poolRegion}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
        headers: {
          Authorization: null
        }
      });

      if (response.status !== 200) {
        logger.info("Error on retrieving jwks", response.data);
        return reject(new Error('Error validating the token'));
      }

      let pems = {};

      const body = response.data;
      const keys = body['keys'];
      for (let i = 0; i < keys.length; i++) {
        //Convert each key to PEM
        let key_id = keys[i].kid;
        let modulus = keys[i].n;
        let exponent = keys[i].e;
        let key_type = keys[i].kty;
        let jwk = { kty: key_type, n: modulus, e: exponent };
        pems[key_id] = jwkToPem(jwk);
      }
      //validate the token
      const decodedJwt = jwt.decode(token, { complete: true });
      if (!decodedJwt) {
        let error = new Error('Not a valid JWT token');
        logger.error(error);
        return reject(error);
      }

      let kid = decodedJwt.header.kid;
      let pem = pems[kid];
      if (!pem) {
        let error = new Error('Invalid token');
        logger.error(error);
        return reject(error);
      }

      jwt.verify(token, pem, function (err, payload) {
        if (err) {
          let error = new Error('Invalid token');
          logger.error(error);
          return reject(error);
        } else {
          return resolve(payload);
        }
      });
    } catch (err) {
      logger.info("Error on downloading JWKs", err);
      return reject(new Error('Error validating the token'));
    }
  });
};

Cognito.getIdTokenDetails = (idToken) => {
  // TODO:: validate idToken
  return jwt.decode(idToken, { complete: true });
};

Cognito.confirmCode = (user) => {
  return new Promise((resolve, reject) => {
    var userData = {
      Username: user.username,
      Pool: userPool,
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(user.code, true, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve({ status: 'success' });
    });
  });
}

Cognito.getUser = (data, options = {}) => {
  const { isReq } = options;
  return new Promise((resolve, reject) => {
    let sessionObject = {};
    if (isReq) {
      const authHeaders = reqParser.extractAuthHeaders(data);
      if (!authHeaders) {
        return reject(new Error('Invalid session token'));
      }
      sessionObject = authHeaders;
    } else {
      sessionObject = data;
    }
    const accessToken = new CognitoAccessToken({ AccessToken: sessionObject.accessToken });
    const idToken = new CognitoIdToken({ IdToken: sessionObject.idToken });
    const refreshToken = new CognitoRefreshToken({ RefreshToken: sessionObject.refreshToken });

    const sessionData = {
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken
    };
    const userSession = new CognitoUserSession(sessionData);

    var decodedJwt = jwt.decode(sessionObject.accessToken, { complete: true });
    var decodedIDJwt = jwt.decode(sessionObject.idToken, { complete: true });

    const userData = {
      Username: decodedJwt.payload.username,
      Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.setSignInUserSession(userSession);

    cognitoUser.getSession(function (err, session) { // You must run this to verify that session (internally)
      if (err) {
        return reject(err);
      }
      if (session.isValid()) {
        return resolve({ cognitoUser, attributes: decodedIDJwt.payload });
      } else {
        return reject(new Error('Invalid session token'));
      }
    });
  });
};

Cognito.resendConfirmation = (username) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

Cognito.forgotPassword = (username) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.forgotPassword({
      onSuccess: function (data) {
        return resolve(data);
      },
      onFailure: function (err) {
        return reject(err);
      }
    });
  });
};

Cognito.resetPassword = ({ username, code, password }) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmPassword(code, password, {
      onSuccess(data) {
        return resolve(data);
      },
      onFailure(err) {
        return reject(err);
      },
    });
  });
};

module.exports = Cognito;