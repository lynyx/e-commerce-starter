module.exports = {
  getSecret: (req) => process.env.CSRF_SECRET,
  cookieName: process.env.NODE_ENV === 'production' ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  },
  getTokenFromRequest: (req) => {
    return req.body._csrf || req.headers[process.env.NODE_ENV === 'production' ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token"];
  },
};
