import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import studentsImg from '../assets/students.jpg';
import teachersImg from '../assets/teachers.jpg';
import adminImg from '../assets/administration.webp';

const SLIDES = [
  {
    image: studentsImg,
    title: 'For Students',
    text: 'Submit dissertation proposals, collaborate with your supervisor, and track your progress throughout your research journey.'
  },
  {
    image: teachersImg,
    title: 'For Teachers',
    text: 'Review student proposals, supervise dissertations, provide feedback and monitor progress across all your students.'
  },
  {
    image: adminImg,
    title: 'For Admins',
    text: 'Oversee the entire system, manage users and permissions, and configure system-wide settings.'
  },
];

const FEATURES = [
  { icon: '📋', title: 'Proposal Management', text: 'Students submit proposals, supervisors review and approve with full edit control.' },
  { icon: '🤖', title: 'AI-Assisted Proposals', text: 'Generate dissertation proposals instantly using AI based on your academic profile.' },
  { icon: '💬', title: 'Collaboration', text: 'Real-time comments and file sharing between students and supervisors.' },
  { icon: '📊', title: 'Progress Tracking', text: 'Monitor dissertation progress with visual indicators and status updates.' },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => { setCurrent(prev => (prev + 1) % SLIDES.length); setFade(true); }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    if (idx === current) return;
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 300);
  };

  const slide = SLIDES[current];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ height: '480px' }}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b6e]/85 via-[#1a237e]/60 to-transparent" />
      </div>

      <div className={`absolute left-10 bottom-12 max-w-md transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-1 bg-[#f26522] mb-4 rounded-full" />
        <h3 className="text-3xl font-bold text-white mb-3">{slide.title}</h3>
        <p className="text-blue-100 text-base leading-relaxed">{slide.text}</p>
      </div>

      <button
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-[#f26522]/80 text-white flex items-center justify-center transition backdrop-blur-sm text-xl"
      >‹</button>
      <button
        onClick={() => goTo((current + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-[#f26522]/80 text-white flex items-center justify-center transition backdrop-blur-sm text-xl"
      >›</button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-[#f26522]' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      <div className="bg-[#1a237e] text-white py-12 px-4">
  <div className="max-w-7xl mx-auto text-center">

    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight tracking-tight">
      AI-Powered
      <span className="block text-[#f26522]">Dissertation Management</span>
    </h1>

    <p className="text-base text-blue-100 max-w-xl mx-auto mb-6 leading-relaxed">
      From AI-generated proposals to supervisor approval and progress tracking - everything your final year needs, in one platform.
    </p>

    <div className="flex flex-wrap justify-center gap-3">
      {user ? (
        <Link to="/dashboard" className={`${tw.btnAccent} px-6 py-2.5 text-sm shadow-lg hover:scale-105 transform`}>
          Go to Dashboard →
        </Link>
      ) : (
        <>
          <Link to="/login" className="bg-white text-[#1a237e] hover:bg-gray-100 font-semibold px-6 py-2.5 rounded-lg text-sm shadow-lg transition hover:scale-105 transform">
            Login
          </Link>
          <Link to="/register" className={`${tw.btnAccent} px-6 py-2.5 text-sm shadow-lg hover:scale-105 transform`}>
            Register →
          </Link>
        </>
      )}
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Slider />
      </div>

      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a237e] mb-2">Platform Features</h2>
            <div className="w-12 h-1 bg-[#f26522] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition group">
                <div className="w-14 h-14 rounded-full border-2 border-[#f26522] flex items-center justify-center text-2xl mb-4 group-hover:bg-[#f26522]/10 transition">
                  {f.icon}
                </div>
                <h3 className="text-[#1a237e] font-bold text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1a237e] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Academic Tracks</h2>
          <div className="w-12 h-1 bg-[#f26522] mx-auto rounded-full mb-8" />
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Web Technologies',
              'Business Informatics', 'Artificial Intelligence & Data Science'
            ].map(track => (
              <span key={track} className="px-5 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium hover:bg-[#f26522]/20 hover:border-[#f26522] transition">
                {track}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0d1b6e] py-6 px-4 text-center">
        <p className="text-blue-200 text-sm">
          © {new Date().getFullYear()} ThesisFlow
        </p>
      </div>
    </div>
  );
};

export default LandingPage;