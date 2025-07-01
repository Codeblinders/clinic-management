import { Card } from '../Components';
import { HomeData } from '../Mocks/data';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

const Dashboard = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800">
            <main className="flex flex-col gap-8 px-4 py-6 xl:py-10 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <header className="flex flex-col items-center text-center gap-4">
                    <h2 className="text-3xl xl:text-5xl font-extrabold text-blue-600 italic">
                        <TypeAnimation
                            sequence={[
                                'Welcome Admin',
                                2000,
                                'Wishing you a productive day',
                                2000,
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                        />
                    </h2>
                    <span className="text-4xl hidden lg:block">🙋‍♂️</span>
                </header>

                {/* Cards Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {HomeData.map((item) => (
                        <Link to={item.link} key={item.name} className="transition-transform hover:scale-[1.02]">
                            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <Card image={item.img} name={item.name} />
                            </article>
                        </Link>
                    ))}
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-auto text-center py-4 bg-gray-200 text-gray-700">
                <p className="font-medium">&copy; 2025 — All rights reserved by Vivek</p>
            </footer>
        </div>
    );
};

export default Dashboard;
