// import { handleError } from '../../utils/errorHandler';
// import AuthHelper from '../auth/authHelper';
// import { login } from '../auth/loginService';

// class ApiClient {
//     static async request(endpoint: string, options: RequestInit = {}) {
//         try {

//             let token = AuthHelper.getToken();
//             const url = `${endpoint}`;

//             const headers = {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//                 ...options.headers,
//             };

//             const response = await fetch(url, {
//                 ...options,
//                 headers,
//             });

//             if (response.status === 401 || response.statusText === 'Forbidden') {
//                 AuthHelper.removeToken();

//                 try {
//                     const newToken = await login();
//                     const retryResponse = await fetch(url, {
//                         ...options,
//                         headers: {
//                             ...headers,
//                             'Authorization': `Bearer ${newToken}`,
//                         },
//                     });

//                     if (!retryResponse.ok) {
//                         throw {
//                             message: 'Authentication failed',
//                             status: retryResponse.status,
//                         };
//                     }

//                     return retryResponse.json();
//                 } catch (retryError) {
//                     console.error('Token refresh failed:', retryError);
//                     handleError({
//                         message: 'Session expired. Please refresh the page and try again.',
//                         status: 401,
//                     });
//                     throw retryError;
//                 }
//             }

//             if (response.status === 204) {
//                 return null;
//             }

//             if (!response.ok) {
//                 const error = await response.json().catch(() => ({
//                     message: 'An unexpected error occurred',
//                     status: response.status
//                 }));
//                 handleError(error);
//                 throw error;
//             }

//             return response.json();
//         } catch (error) {
//             console.error('API request error:', error);
//             handleError(error);
//             throw error;
//         }
//     }

//     static async get(endpoint: string, options = {}) {
//         return this.request(endpoint, { ...options, method: 'GET' });
//     }

//     static async post(endpoint: string, data: any, options = {}) {
//         return this.request(endpoint, {
//             ...options,
//             method: 'POST',
//             body: JSON.stringify(data),
//         });
//     }

//     static async put(endpoint: string, data: any, options = {}) {
//         return this.request(endpoint, {
//             ...options,
//             method: 'PUT',
//             body: JSON.stringify(data),
//         });
//     }

//     static async delete(endpoint: string, options = {}) {
//         return this.request(endpoint, { ...options, method: 'DELETE' });
//     }
// }

// export default ApiClient;