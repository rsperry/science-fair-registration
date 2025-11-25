import axios from 'axios';
import { config } from '../config';
import { RegistrationFormData, RegistrationResponse, ErrorResponse } from '../types';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerProject = async (
  data: RegistrationFormData
): Promise<RegistrationResponse> => {
  try {
    const response = await api.post<RegistrationResponse>('/register', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as ErrorResponse;
    }
    throw {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    } as ErrorResponse;
  }
};

export const getTeachers = async (): Promise<Array<{ name: string; grade: string }>> => {
  const response = await api.get<{ success: boolean; teachers: Array<{ name: string; grade: string }> }>('/teachers');
  return response.data.teachers;
};

export const getFairMetadata = async (): Promise<{
  school: string;
  contactEmail: string;
  registrationDeadline: string;
  scienceFairDate: string;
}> => {
  const response = await api.get<{
    success: boolean;
    school: string;
    contactEmail: string;
    registrationDeadline: string;
    scienceFairDate: string;
  }>('/metadata');
  return {
    school: response.data.school,
    contactEmail: response.data.contactEmail,
    registrationDeadline: response.data.registrationDeadline,
    scienceFairDate: response.data.scienceFairDate,
  };
};
