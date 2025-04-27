
import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <p className="mb-4">
        Welcome to our About page. This is a placeholder that can be customized with your company or project information.
      </p>
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold mt-6 mb-4">Our Mission</h2>
        <p>
          Our mission is to provide valuable information and services to our users in an accessible and user-friendly way.
        </p>
        
        <h2 className="text-2xl font-bold mt-6 mb-4">Our Team</h2>
        <p>
          We are a dedicated team of professionals committed to excellence and innovation.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
