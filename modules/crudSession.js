const config = require('./../config');
const axios = require('axios');

const CrudSession = {
  session: null
};

CrudSession.init = async () => {
  const userCredentials = {
    username: config.USER_NAME,
    password: config.USER_PASSWORD
  };

  try {
    const res = await axios({
      url: `${config.REST_URL}/api/v1/login`,
      method: 'post',
      data: userCredentials
    });
    CrudSession.session = res.data;
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return Promise.resolve({ status: 'success' });
  } catch (err) {
    return Promise.reject(err.message);
  }
}

module.exports = CrudSession;