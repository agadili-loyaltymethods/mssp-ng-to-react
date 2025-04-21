const ReqParser = {};

ReqParser.extractAuthHeaders = (req) => {
  let result = {};
  const { headers: { authtoken: authorization, idtoken: idToken, refreshtoken: refreshToken } } = req;
  // validation
  if (!authorization || !idToken || !refreshToken) {
    return false;
  }

  const accessTokenDetails = authorization.split(' ');

  if (accessTokenDetails.length !== 2 || accessTokenDetails[0] !== 'Bearer') {
    return false;
  }

  result.accessToken = accessTokenDetails[1];
  result.idToken = idToken;
  result.refreshToken = refreshToken;
  return result;
};


module.exports = ReqParser;