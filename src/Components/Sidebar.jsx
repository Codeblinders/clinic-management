import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import { MdSpaceDashboard, MdEmail } from 'react-icons/md';
import { IoMdHelpCircleOutline, IoIosPerson } from 'react-icons/io';
import { CiPill } from 'react-icons/ci';
import { FaVirus } from 'react-icons/fa6';
import { IoReceipt } from 'react-icons/io5';

import { signOut } from 'firebase/auth';
import { auth } from '../Configs/firebase';
import { useAuth } from '../hooks';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    } catch (error) {
      Alert({ toast: true, icon: 'error', title: error.code, text: error.message });
    }
  };

  const linkClasses = (path) =>
    `flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
      location.pathname === path ? 'bg-gray-200 dark:bg-gray-800' : ''
    }`;

  return (
    <>
      <aside
        id="sidebar"
        className="fixed top-0 left-0 z-40 pt-20 h-screen w-60 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transform -translate-x-full sm:translate-x-0 transition-transform"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            

            <li>
  <Link to="/" className={linkClasses('/')}>
    <MdSpaceDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
    <span className="ms-3 text-gray-900 dark:text-white">Dashboard</span>
  </Link>
</li>


            <li>
              <Link to="/masterdata/patient" className={linkClasses('/masterdata/patient')}>
                <IoIosPerson className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                <span className="ms-3 text-gray-900 dark:text-white">Patient Data</span>
              </Link>
            </li>

            <li>
              <Link to="/masterdata/medicine" className={linkClasses('/masterdata/medicine')}>
                <CiPill className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                <span className="ms-3 text-gray-900 dark:text-white">Medicine Data</span>
              </Link>
            </li>

            <li>
              <Link to="/masterdata/disease" className={linkClasses('/masterdata/disease')}>
                <FaVirus className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                <span className="ms-3 text-gray-900 dark:text-white">Symptom Data</span>
              </Link>
            </li>

            <li>
              <Link
                to="/masterdata/medicalCertificate"
                className={linkClasses('/masterdata/medicalCertificate')}
              >
                <IoReceipt className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                <span className="ms-3 text-gray-900 dark:text-white">Medical Certificates</span>
              </Link>
            </li>
          </ul>

          <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
            <li>
              <button
                className="w-full"
                onClick={() => document.getElementById('helpModal').showModal()}
              >
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <IoMdHelpCircleOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                  <span className="ms-3 text-gray-900 dark:text-white">Help</span>
                </div>
              </button>
            </li>
            <li>
              <button className="w-full" onClick={handleLogout}>
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FaSignOutAlt className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
                  <span className="ms-3 text-gray-900 dark:text-white">Logout</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <dialog id="helpModal" className="modal">
        <div className="modal-box w-4/12 max-w-5xl">
          <h3 className="font-bold text-2xl text-primary text-center uppercase dark:text-white">
            Support Info
          </h3>

          <ul className="mt-8 grid grid-cols-3 italic text-gray-800 dark:text-gray-200">
            <li>
              <p>Technical</p>
              <div className="divider"></div>
              <p>Operations</p>
              <div className="divider"></div>
              <p>Feedback & Bug Reports</p>
            </li>
            <li className="col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <MdEmail className="w-5 h-5" />
                <span>support@example.com</span>
              </div>
              <div className="divider"></div>
              <div className="flex items-center gap-4">
                <MdEmail className="w-5 h-5" />
                <span>ops@example.com</span>
              </div>
              <div className="divider"></div>
              <div className="flex items-center gap-4">
                <MdEmail className="w-5 h-5" />
                <span>feedback@example.com</span>
              </div>
            </li>
          </ul>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Sidebar;
