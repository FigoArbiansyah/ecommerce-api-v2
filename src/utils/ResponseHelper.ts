// src/utils/responseHelper.ts
export type ResponseFormat = {
  status: "success" | "failed";
  data?: any;
  message?: string;
};

/**
 * Helper function to format success response.
 * @param data - The data to be sent in the response.
 * @returns Formatted success response object.
 */
export const successResponse = (data: any, message?: string): ResponseFormat => {
  return {
    status: "success",
    message,
    data,
  };
};

/**
 * Helper function to format failed response.
 * @param message - The error message to be sent in the response.
 * @param data - Additional data or error details to include.
 * @returns Formatted failed response object.
 */
export const failedResponse = (message: string, data?: any): ResponseFormat => {
  return {
    status: "failed",
    message,
    data,
  };
};
