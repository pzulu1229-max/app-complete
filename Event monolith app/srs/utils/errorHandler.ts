export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: unknown): { status: number; message: string } => {
  if (error instanceof AppError) {
    return { status: error.statusCode, message: error.message };
  }
  
  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }
  
  return { status: 500, message: 'Internal server error' };
};
