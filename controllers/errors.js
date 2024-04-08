exports.pageNotFound = (req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.user,
  });
};

exports.serverError = (req, res) => {
  res.status(500).render('500', {
    pageTitle: 'Error occurred!',
    path: '/500',
    isAuthenticated: req.session.user,
  });
};
