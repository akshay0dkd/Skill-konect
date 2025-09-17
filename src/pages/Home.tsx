import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 font-sans">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary to-blue-500 text-white text-center p-8 md:p-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Skill Konect</h1>
        <p className="text-lg md:text-xl mb-8">The platform where you can connect with professionals, learn new skills, and mentor others.</p>
        <Link to="/skills" className="bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition duration-300">Explore Skills</Link>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Why Choose Skill Konect?</h2>
          <div className="flex flex-wrap -mx-4">
            
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Learn from Experts</h3>
                <p className="text-gray-600">Find experienced professionals to guide you in your learning journey. Get personalized feedback and accelerate your growth.</p>
              </div>
            </div>

            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Share Your Knowledge</h3>
                <p className="text-gray-600">Become a mentor and help others achieve their goals. Enhance your leadership skills and give back to the community.</p>
              </div>
            </div>

            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Build Your Network</h3>
                <p className="text-gray-600">Connect with like-minded individuals, expand your professional network, and collaborate on exciting projects.</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
