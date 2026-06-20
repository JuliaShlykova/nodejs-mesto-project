export default class ApiError extends Error {
  constructor(readonly statusCode:number, message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
