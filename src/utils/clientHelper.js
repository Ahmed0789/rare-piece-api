export const getClientIp = (request) => {
  const xff = request.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return request.info?.remoteAddress || null;
};

export const generateVerificationCode = (digits = 6) =>
    Math.floor(Math.random() * (10 ** digits - 10 ** (digits - 1))) + 10 ** (digits - 1);
