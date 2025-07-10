import axios from 'axios'
import { apiUrl } from '../config'
import Cookies from 'js-cookie'
const axiosConfig = axios.create({
  baseURL: apiUrl,
  timeout: 5000,
})
axiosConfig.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.authorization = `Bearer ${token}`
  }
  return config
})
axiosConfig.interceptors.response.use((response) => {
  return response
})
export default axiosConfig
