export const appConfig = {
  name: 'MyApp',
  description: 'A modern Next.js application',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Feature flags
  features: {
    enableRegistration: true,
    enableAdminPanel: true,
    enableApiDocs: true,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
}
