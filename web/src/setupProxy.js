import { createProxyMiddleware } from 'http-proxy-middleware';

export default function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://ec2-54-242-219-119.compute-1.amazonaws.com',
      changeOrigin: true,
    })
  );
};
