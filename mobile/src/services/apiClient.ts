import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발 중에는 .env 또는 실행 커맨드에서 EXPO_PUBLIC_API_URL을 지정한다.
// 예: EXPO_PUBLIC_API_URL=http://192.168.0.10:3000 npx expo start
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const TOKEN_STORAGE_KEY = 'novaria.accessToken';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 백엔드가 { data, error } 형태로 응답을 통일하므로 성공 시 data만 꺼내 돌려준다.
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // 사용자에게 개발자용 오류를 노출하지 않는다 (기획서 51항).
    const message = error?.response?.data?.error?.message ?? '네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
    return Promise.reject(new Error(message));
  },
);
