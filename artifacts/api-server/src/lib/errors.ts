/**
 * AppError — error domain aplikasi dengan HTTP status dan kode string.
 * Dilempar dari service layer, ditangkap oleh error-handler middleware.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
