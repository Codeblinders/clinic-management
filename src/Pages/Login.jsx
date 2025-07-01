import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Configs/firebase';
import { SweetAlert } from '../utils/Alert';
import { useAuth } from '../hooks';

const Login = () => {
  const { dispatch } = useAuth();
  const userEmail = useRef(null);
  const userPassword = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userInfo = {
        userEmail: userEmail.current.value,
        userPassword: userPassword.current.value,
      };

      const userCredential = await signInWithEmailAndPassword(
        auth,
        userInfo.userEmail,
        userInfo.userPassword
      );
      dispatch({ type: 'LOGIN', payload: userCredential });
      navigate('/masterdata/medicalCertificate');
    } catch (error) {
      SweetAlert.Toast.Error({ title: 'Login failed', text: error.message });
    }
  };

  return (
    <section className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <div className="flex items-center justify-center">
          <div className="bg-white/60 backdrop-blur-lg shadow-lg rounded-2xl p-10 max-w-sm w-full animate-fadeIn">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Clinic
              <span className="block text-indigo-600 text-xl mt-1 italic">Administrator</span>
            </h2>

            <form className="space-y-6">
              <div>
                <label htmlFor="userEmail" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  ref={userEmail}
                  type="email"
                  id="userEmail"
                  placeholder="v@gmail.com"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"  
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </label>
                  
                </div>
                <input
                  ref={userPassword}
                  type="password"
                  id="password"
                  placeholder="123456"
                  autoComplete="current-password"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 transition"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 animate-fadeInDelay">
              Welcome back, Admin 👋
            </h3>
            <p className="text-gray-600">
              Ready to manage your clinic efficiently? Let's get started!<br /> 
              <strong>Email:</strong> v@gmail.com<br />
              <strong>Password:</strong> 123456
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
