export const isAdmin = (request, h) => {
  const { credentials } = request.auth;

  if (!credentials || !credentials.isAdmin) {
    return h.response({ message: 'Access denied. Admins only.' }).code(403);
  }

  return h.continue;
};