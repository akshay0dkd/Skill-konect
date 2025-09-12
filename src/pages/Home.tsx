import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add this import

const Home: React.FC = () => {
  const skills = [
    { title: "Web Development", icon: "💻" },
    { title: "Design & UI/UX", icon: "🎨" },
    { title: "Music & Arts", icon: "🎵" },
    { title: "Languages", icon: "🌍" },
    { title: "Software Development", icon: "⚙️" },
    { title: "Programming Languages", icon: "📜" },
    { title: "Data Science", icon: "📊" },
    { title: "AI & Machine Learning", icon: "🤖" },
    { title: "Business & Marketing", icon: "📈" },
    { title: "Photography & Editing", icon: "📷" },
    { title: "Cooking & Culinary Arts", icon: "🍳" },
    { title: "Fitness & Wellness", icon: "💪" },
  ];

  const navigate = useNavigate(); // Add this hook

  const handleLoginClick = () => {
    navigate('/login'); // Add this function
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="px-8 py-4 flex justify-between items-center bg-blue-900/80 backdrop-blur-md shadow-md sticky top-0 z-50"
      >
        <h1 className="text-2xl font-extrabold tracking-wide">Skill Konect</h1>
        <ul className="flex gap-6 text-lg font-medium">
          <li className="hover:text-blue-300 cursor-pointer transition">Home</li>
          <li className="hover:text-blue-300 cursor-pointer transition">Explore</li>
          <li className="hover:text-blue-300 cursor-pointer transition">Profile</li>
          <li className="hover:text-blue-300 cursor-pointer transition">Messages</li>
          {/* Add Login button to navbar */}
          <li 
            className="hover:text-blue-300 cursor-pointer transition bg-yellow-400 text-blue-900 px-4 py-1 rounded-md font-semibold"
            onClick={handleLoginClick}
          >
            Login
          </li>
        </ul>
      </motion.nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20">
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold mb-6 drop-shadow-lg"
        >
          Welcome to <span className="text-yellow-400">Skill Konect</span>
        </motion.h2>

        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl max-w-2xl mb-8"
        >
          A community-driven platform to connect, share, and exchange skills.
          Learn from others and grow together.
        </motion.p>

        {/* Update Get Started button to navigate to login */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transition"
          onClick={handleLoginClick}
        >
          Get Started
        </motion.button>
      </section>

      {/* Skills Grid */}
      <section className="px-8 py-16 bg-white text-gray-900">
        <h3 className="text-4xl font-bold text-center mb-12">Explore Popular Skills</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-100 rounded-xl shadow-lg p-8 flex flex-col items-center transition cursor-pointer"
            >
              <span className="text-5xl mb-4">{skill.icon}</span>
              <h4 className="text-xl font-semibold">{skill.title}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-center py-6 mt-auto text-white/80 text-sm">
        © {new Date().getFullYear()} Skill Konect — Connect. Share. Grow.
      </footer>
    </div>
  );
};

export default Home;