// pages/about.tsx

import { motion } from 'framer-motion';

/**
 * AboutPage component that provides an overview of the individual's expertise and professional background.
 * This page highlights the diverse skill set and experience in various fields such as MERN development,
 * financial advising, design, trading and investing, and digital marketing.
 */
const AboutPage = () => {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500">About Me</h2>
            <p className="mt-4 text-gray-400">
              I am a multifaceted professional with a passion for technology, finance, design, and marketing. 
              With extensive experience in MERN stack development, I craft seamless and efficient web applications. 
              As a financial advisor, I provide strategic insights to optimize investment portfolios and manage risks effectively. 
              My design skills enable me to create visually appealing and user-friendly interfaces, while my expertise in trading and investing 
              allows me to navigate the financial markets with confidence. Additionally, I leverage digital marketing strategies to enhance brand visibility 
              and drive business growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105">
              <h3 className="text-xl font-semibold text-yellow-500 mb-4">MERN Development</h3>
              <p className="text-gray-400">
                Specializing in the MERN stack (MongoDB, Express.js, React, Node.js), I build robust and scalable web applications that deliver exceptional user experiences.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105">
              <h3 className="text-xl font-semibold text-yellow-500 mb-4">Financial Advising</h3>
              <p className="text-gray-400">
                As a financial advisor, I offer expert guidance on investment strategies, portfolio management, and risk assessment to help clients achieve their financial goals.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105">
              <h3 className="text-xl font-semibold text-yellow-500 mb-4">Design</h3>
              <p className="text-gray-400">
                With a keen eye for design, I create intuitive and aesthetically pleasing interfaces that enhance user engagement and satisfaction.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105">
              <h3 className="text-xl font-semibold text-yellow-500 mb-4">Trading & Investing</h3>
              <p className="text-gray-400">
                Leveraging my expertise in trading and investing, I analyze market trends and make informed decisions to maximize returns and minimize risks.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105">
              <h3 className="text-xl font-semibold text-yellow-500 mb-4">Digital Marketing</h3>
              <p className="text-gray-400">
                I utilize digital marketing techniques to boost brand awareness, engage target audiences, and drive business growth through effective online campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
