class ErrorResponse extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const createErrorResponse = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

const successResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  ErrorResponse,
  createErrorResponse,
  successResponse
};