interface ApiResponse<T> {
  message: string;
  data?: T;
}

export const formatResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  return { message, data };
};
