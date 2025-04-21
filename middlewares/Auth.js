const { validateToken: CognitoValidateToken, getIdTokenDetails } = require("../modules/cognito");

module.exports = async (req, res, next) => {
  const { authtoken='', idtoken, loyaltyid } = req.headers;

  const accessTokenDetails = authtoken.split(' ');

  if (accessTokenDetails.length !== 2 || accessTokenDetails[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = accessTokenDetails[1];
  try {
    await CognitoValidateToken(accessToken);
    let idTokenDetails = getIdTokenDetails(idtoken);
    if (!idTokenDetails) throw new Error('Invalid id token');
    req.memberId = '';
    req.loyaltyId = loyaltyid || idTokenDetails.payload['custom:loyaltyId'];
    return next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};