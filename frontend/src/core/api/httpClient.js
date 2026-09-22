import axios from 'axios';
import { appConfig } from '@/core/config/env';


const httpClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
  headers: {

    'Content-Type': 'application/json'

  }
})


//** interceptor para agregar el token de autenticación para cada solicitud de autenticación */


httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ct_token')
    if (token){
      config.headers.Authorization = `Bearer ${token}`
    }
  return config
})


//** Interceptor para manejar los diferentes tipos de respuestas  */

// Status 401
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('No autorizado. Redirigiendo a la página de inicio de sesión.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)







export default httpClient
