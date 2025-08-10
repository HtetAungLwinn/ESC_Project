import { auth } from './firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';


export async function handleDeleteAccount ({setLoggedIn, navigate}) {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const uid = localStorage.getItem('uid');
    const user = auth.currentUser;

    try {
      const email = user.email;
      const password = prompt("Please re-enter your password to confirm account deletion:");

      if (!password) return;

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      // 1. Call backend to delete user data
      const res = await fetch(`http://localhost:5000/api/deleteAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Backend delete failed');

      // 2. Delete user from Firebase Auth
      await user.delete();

      // 3. Log out and redirect
      localStorage.removeItem('uid');
      localStorage.removeItem('user');
      setLoggedIn(false);
      navigate('/');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    }
};