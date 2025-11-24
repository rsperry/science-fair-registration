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
  try {
    const response = await api.get<{ success: boolean; teachers: Array<{ name: string; grade: string }> }>('/teachers');
    return response.data.teachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    // Return default list on error
    return [
      { name: 'Mrs. Smith', grade: '3' },
      { name: 'Mr. Johnson', grade: '4' },
      { name: 'Ms. Williams', grade: '5' },
    ];
  }
};

export const getFairMetadata = async (): Promise<{
  school: string;
  contactEmail: string;
  registrationDeadline: string;
  scienceFairDate: string;
}> => {
  try {
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
  } catch (error) {
    console.error('Error fetching fair metadata:', error);
    // Return defaults on error
    return {
      school: 'School',
      contactEmail: 'sciencefair@school.edu',
      registrationDeadline: 'December 15, 2025',
      scienceFairDate: 'February 10, 2026',
    };
  }
};
