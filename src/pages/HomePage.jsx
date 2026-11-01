import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import BeforeAfter from '../components/BeforeAfter';
import About from '../components/About';
import RevisionPolicy from '../components/RevisionPolicy';
import Testimonials from '../components/Testimonials';

const HomePage = ({ transformation }) => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <div className="page-fade-in">
      <Hero />
      <BeforeAfter transformation={transformation} />
      <About />
      <RevisionPolicy />
      <Testimonials />
    </div>
  );
};

export default HomePage;
