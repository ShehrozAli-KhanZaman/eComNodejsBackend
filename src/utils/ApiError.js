class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    stack = "",
  ) {
    super(message),
      (this.statusCode = statusCode),
      (this.message = message),
      (this.success = false);
    (this.data = null), (this.errors = errors);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructure);
    }
  }
}

export default ApiError;
