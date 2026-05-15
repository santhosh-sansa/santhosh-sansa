function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUser) {
    return next();
  }

  if (req.accepts('html')) {
    return res.redirect('/admin/login');
  }

  return res.status(401).json({ ok: false, error: 'Admin login required.' });
}

module.exports = { requireAdmin };
