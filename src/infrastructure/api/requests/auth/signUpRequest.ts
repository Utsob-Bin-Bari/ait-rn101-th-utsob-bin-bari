import { SignUpRequest, SignUpResponse } from '../../../../domain/types/auth';
import { signupEndpoint } from '../../endpoints/AuthEndpoints';
import useApi from '../../hooks/useApi';

export const signUpRequest = async ({ requestBody }: { requestBody: SignUpRequest }) => {
  try {
    const response = await useApi({
      url: signupEndpoint,
      method: 'POST',
      data: requestBody,
    });
    return response.data as SignUpResponse;
  } catch (error) {
    throw error;
  }
};

