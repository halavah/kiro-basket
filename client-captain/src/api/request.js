import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('captain_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;

    // 如果是 blob 类型（文件下载），直接返回
    if (response.config.responseType === 'blob') {
      return res;
    }

    // 如果返回的状态码不是 200 或 201，则认为是错误
    if (res.code !== 200 && res.code !== 201) {
      ElMessage.error(res.message || '请求失败');

      // 401: Token 过期或无效
      if (res.code === 401) {
        localStorage.removeItem('captain_token');
        localStorage.removeItem('captain_info');
        window.location.href = '/login';
      }

      return Promise.reject(new Error(res.message || '请求失败'));
    }

    return res;
  },
  error => {
    console.error('响应错误:', error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录');
        localStorage.removeItem('captain_token');
        localStorage.removeItem('captain_info');
        window.location.href = '/login';
      } else if (status === 403) {
        ElMessage.error('没有权限访问');
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在');
      } else if (status === 500) {
        ElMessage.error('服务器错误');
      } else {
        ElMessage.error(data.message || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败');
    } else {
      ElMessage.error('请求失败');
    }

    return Promise.reject(error);
  }
);

export default service;
