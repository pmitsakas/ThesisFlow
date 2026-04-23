import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import studentsImg from '../assets/students.jpg';
import teachersImg from '../assets/teachers.jpg';
import adminImg from '../assets/administration.webp';

const SLIDES = [
  {
    image: studentsImg,
    title: 'For Students',
    text: 'Browse available dissertation topics, apply for topics that match your interests, and track your progress throughout your research journey.'
  },
  {
    image: teachersImg,
    title: 'For Teachers',
    text: 'Create and manage dissertation topics, supervise multiple students, monitor progress, and provide feedback throughout the research process.'
  },
  {
    image: adminImg,
    title: 'For Admins',
    text: 'Oversee the entire system, manage users and permissions, generate reports, and configure system-wide settings and deadlines.'
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    if (idx === current) return;
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ height: '500px' }}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/40 to-transparent" />
      </div>

      <div className={`absolute left-10 top-1/2 -translate-y-1/2 max-w-sm transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-3xl font-bold text-white mb-3">{slide.title}</h3>
        <p className="text-blue-100 text-base leading-relaxed">{slide.text}</p>
      </div>

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition backdrop-blur-sm"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition backdrop-blur-sm"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            Dissertation
            <span className="text-blue-600"> Administration</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your dissertation management process with our comprehensive system.
            Track progress, collaborate with supervisors, and manage deadlines efficiently.
          </p>
        </div>

        <div className="mt-14">
          <Slider />
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Academic Tracks Available</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Computer Science', 'Software Engineering', 'Data Science', 'Artificial Intelligence',
              'Cybersecurity', 'Information Systems', 'Computer Networks', 'Human-Computer Interaction'
            ].map(track => (
              <span key={track} className="px-4 py-2 bg-white text-gray-700 rounded-full shadow-md text-sm font-medium">
                {track}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;