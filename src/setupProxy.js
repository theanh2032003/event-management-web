// Using package.json proxy instead of setupProxy.js
// This is more reliable with react-scripts 5.0.1

// If you need to use setupProxy.js, uncomment below:
/*
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/event-manage',
    createProxyMiddleware({
      target: 'http://31.97.70.3:8080',
      changeOrigin: true,
      secure: false,
    })
  );
};
*/

module.exports = function(app) {
  // No proxy configuration - using package.json proxy
};