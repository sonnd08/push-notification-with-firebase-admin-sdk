export default function sendJson({ res, data, message, status = 200 }) {
  res.status(status).json({
    message,
    data,
  });
}
