module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'MR. Khan Medical Center API',
    version: '1.0.0',
    description: 'Minimal API documentation for MR. Khan Medical Center',
  },
  servers: [{ url: process.env.SERVER_URL || 'http://localhost:5000' }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Appointments', description: 'Booking and managing appointments' },
    { name: 'Medicines', description: 'Inventory and medicines' },
    { name: 'Pathology', description: 'Pathology requests and results' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};
