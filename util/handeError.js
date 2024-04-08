/**
 * A middleware function for handling errors in Express.js.
 *
 * @module handleError
 * @param {Error} error - The error object.
 * @param {NextFunction} next - The next middleware function in the Express.js request-response cycle.
 * @param {string} [customErrorMessage] - An optional custom error message. If provided, it will be added to the error object.
 * @param {number} [httpStatusCode=500] - The HTTP status code for the error. Defaults to 500 if not provided.
 * @returns {void} This function does not return anything. It calls the `next` function with the error.
 */
module.exports = (error, next, customErrorMessage, httpStatusCode = 500) => {
  error.customMessage = customErrorMessage;
  error.httpStatusCode = httpStatusCode;
  next(error);
}
