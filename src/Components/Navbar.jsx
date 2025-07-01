import { Link } from 'react-router-dom';
import { Themes } from '../Mocks/data';
import { useEffect } from 'react';

const Navbar = () => {
  const handleChangeTheme = (e) => {
    const { value: selectedTheme, dataset: { theme: themeClass } } = e.target;
    const html = document.documentElement;

    // Set DaisyUI theme
    html.dataset.theme = selectedTheme;

    // Reset and apply Tailwind theme class
    html.className = '';
    html.classList.add(themeClass);

    // Persist to localStorage
    localStorage.setItem(
      'themeInfo',
      JSON.stringify({ selectedTheme, themeClass })
    );

    // Broadcast event for AG Grid or other listeners
    window.dispatchEvent(
      new CustomEvent('themeChange', {
        detail: { selectedTheme, themeClass },
      })
    );
  };

  const toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('translate-x-0');
  };

  // On mount, restore persisted theme
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('themeInfo'));
    if (!data) return;
    const html = document.documentElement;
    html.dataset.theme = data.selectedTheme;
    html.className = '';
    html.classList.add(data.themeClass);
  }, []);

  return (
    <nav className="navbar bg-base-300 text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="sm:hidden p-2 ml-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6 fill-current text-gray-700 dark:text-gray-300"
            viewBox="0 0 20 20"
          >
            <path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <Link to="/" className="btn btn-ghost text-xl ml-4">
          E-Medical Record
        </Link>
      </div>

      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn mr-4">
            Theme
            <svg
              className="inline-block w-3 h-3 ml-1 fill-current opacity-60"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
            </svg>
          </button>
          <ul
            tabIndex={-1}
            className="dropdown-content p-2 shadow bg-base-300 rounded-box w-52 mt-2"
            onChange={handleChangeTheme}
          >
            {Themes.map(({ label, value, theme }) => (
              <li key={value}>
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  data-theme={theme}
                  className="hidden"
                  id={`theme-${value}`}
                />
                <label
                  htmlFor={`theme-${value}`}
                  className="block cursor-pointer px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
