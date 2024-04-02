exports.requireAuth = async (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

exports.requireAdminPermissions = async (req, res, next) => {
  if (!req.session.user?.isAdmin) return res.redirect('/');
  next();
}
