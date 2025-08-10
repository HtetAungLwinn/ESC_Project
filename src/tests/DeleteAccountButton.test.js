// deleteAccount.test.js

jest.mock('../firebase', () => ({
  auth: { currentUser: { email: 'test@example.com', delete: jest.fn() } }
}));

jest.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

import { handleDeleteAccount } from '../DeleteAccount';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


describe('handleDeleteAccount (unit)', () => {
  let setLoggedInMock, navigateMock, userMock, confirmMock, promptMock, alertMock, fetchMock, removeItemMock;

  beforeEach(() => {
    setLoggedInMock = jest.fn();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
    userMock = { email: 'test@example.com', delete: jest.fn().mockResolvedValue() };
    auth.currentUser = userMock;

    confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
    promptMock = jest.spyOn(window, 'prompt').mockReturnValue('password123');
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    removeItemMock = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

    fetchMock = jest.fn();
    global.fetch = fetchMock;

    reauthenticateWithCredential.mockResolvedValue();
    EmailAuthProvider.credential.mockReturnValue({ dummy: 'cred' });
  });

  afterEach(() => jest.clearAllMocks());

  test('cancels if user rejects confirmation', async () => {
    confirmMock.mockReturnValueOnce(false);
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(promptMock).not.toHaveBeenCalled();
  });

  test('cancels if password prompt is empty', async () => {
    promptMock.mockReturnValueOnce(null);
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('alerts if reauthentication fails', async () => {
    reauthenticateWithCredential.mockRejectedValueOnce(new Error('wrong password'));
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Failed to delete account'));
  });

  test('alerts if backend delete fails', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: 'fail' })
    });
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(userMock.delete).not.toHaveBeenCalled();
  });

  test('successfully deletes account', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) });
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(userMock.delete).toHaveBeenCalled();
    expect(setLoggedInMock).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('alerts if user.delete fails', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) });
    userMock.delete.mockRejectedValueOnce(new Error('firebase error'));
    await handleDeleteAccount({ setLoggedIn: setLoggedInMock, navigate: navigateMock });
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Failed to delete account'));
  });
});
