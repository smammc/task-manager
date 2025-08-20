export const authConfig = {
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '7d',

  // Session settings
  sessionCookieName: 'session',
  sessionMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds

  // OAuth providers (if using)
  // providers: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   },
  // },
}
