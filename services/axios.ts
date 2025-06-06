import { API_URL } from '@/config/constants';
import axios from 'axios';

export const vinaswapApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})