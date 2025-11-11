import { UserInfo } from '../../../../domain/types/auth';

export const setUserInfo = (userInfo: UserInfo) => ({
  type: 'SET_USER_INFO',
  payload: userInfo,
});

