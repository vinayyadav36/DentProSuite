"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Code2, User, Phone, BookOpen, Briefcase, Github, Linkedin,
  Twitter, Mail, MapPin, Calendar, ArrowRight, CheckCircle,
  Globe, Database, Brain, Terminal, Layout
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Console banner for development
const consoleBanner = `
%c
  ██████╗  █████╗ ██████╗  █████╗ 
  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗
  ██████╔╝███████║██████╔╝███████║
  ██╔══██╗██╔══██║██╔══██╗██╔══██║
  ██████╔╝██║  ██║██████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝
  
  Created by Baba
`;
const styles = 'color: white; background-color: black; font-size: 20px; padding: 5px; border-radius: 5px;';
console.log(consoleBanner, styles); 

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const journeyRef = useRef<HTMLDivElement>(null);

  const scrollToJourney = (e: React.MouseEvent) => {
    e.preventDefault();
    if (journeyRef.current) {
      const offset = 80; // Adjust this value based on your header height
      const elementPosition = journeyRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Display console banner
    console.log(consoleBanner, 'color: #fbbf24; font-family: monospace; font-size: 12px;');
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const skills = [
    { 
      icon: Globe, 
      name: "Frontend Development", 
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI/UX Design", "Responsive Design"] ,
      href: "#frontend-development" // Add href for navigation
    },
    { 
      icon: Database, 
      name: "Financial Expertise", 
      items: ["Investment Strategy", "Portfolio Management", "Market Analysis", "Risk Assessment"],
      href: "#financial-expertise" // Add href for navigation

    },
    { 
      icon: Brain, 
      name: "Digital Marketing", 
      items: ["SEO Optimization", "Content Strategy", "Social Media", "Analytics"],
      href: "#digital-marketing" // Add href for navigation
    },
    { 
      icon: Terminal, 
      name: "Trading & Investment", 
      items: ["Technical Analysis", "Fundamental Analysis", "Risk Management", "Portfolio Optimization"],
      href: "#trading-and-investment" // Add href for navigation 
    },
    { 
      icon: Layout, 
      name: "Design Skills", 
      items: ["UI/UX Design", "Wireframing", "Prototyping", "Brand Identity"],
      href: "#frontend-development" // Add href for navigation 
    },
    { 
      icon: Briefcase, 
      name: "Advisory Services", 
      items: ["Personal Finance", "Investment Planning", "Wealth Management", "Financial Education"],
      href: "#frontend-development" // Add href for navigation 
    }
  ];

  const experiences = [
    {
      title: "Senior Full Stack Developer",
      company: "Shree Nandi Marketing Services",
      period: "2021 - Present",
      description: "Leading development of enterprise-scale applications using modern technologies.",
      achievements: [
        "Reduced application load time by 60%",
        "Implemented microservices architecture",
        "Mentored junior developers"
      ]
    },
    { 
      title: "Full Stack Developer",
      company: "Photofactory0707",
      period: "2019 - 2021",
      description: "Developed and maintained multiple client projects using React and Node.js.",
      achievements: [
        "Delivered 15+ successful projects",
        "Introduced automated testing",
        "Improved code quality standards"
      ]
    },
    {
      title: "Tele Sales Parnter",
      company: "SquadStacks(formerly Squadrun)",
      period: "2021 - Present",
      description: "As a Tele Sales Partner at SquadStacks, I have excelled in engaging with potential clients, understanding their needs, and providing tailored solutions to drive sales and enhance customer satisfaction.",
      achievements: [
        "Conducting outbound calls to prospective clients and presenting our services.",
        "Building and maintaining strong client relationships.",
        "Collaborating with the team to ensure seamless project execution.",
        "Providing exceptional customer service and support.",
        
      ]
    }
  ];

  const projects = [
    {
      title: "E-Commerce Platform",
      description: "A full-featured online shopping platform with real-time inventory management.",
      image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&auto=format&fit=crop&q=60",
      tags: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"]
    },
    {
      title: "AI Task Manager",
      description: "Smart task management system with AI-powered prioritization.",
      image: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop&q=60",
      tags: ["React", "Python", "TensorFlow", "MongoDB"]
    },
    {
      title: "Real-time Analytics Dashboard",
      description: "Interactive dashboard for monitoring business metrics in real-time.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
      tags: ["Vue.js", "D3.js", "Node.js", "WebSocket"]
    }
  ];

  return (
    <main className="min-h-screen bg-black">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 215, 0, 0.15), transparent 80%)`,
        }}
      />
      {/* <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/10 hover:bg-yellow-500/10 hover:scale-105 transition duration-300 ease-in-out"/> */}
                

      <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-sm border-b border-yellow-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Code2 className="w-8 h-8 text-yellow-500" />
              <span className="text-yellow-500 font-bold text-xl">Vinay.dev</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { icon: User, text: "About", href: "#about" },
                { icon: BookOpen, text: "Journey", onClick: scrollToJourney },
                { icon: Briefcase, text: "Portfolio", href: "#portfolio" },
                { icon: Phone, text: "Contact", href: "#contact" },
              ].map(({ icon: Icon, text, href, onClick }) => (
                <motion.div
                  key={text}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={href || '#'}
                    onClick={onClick}
                    className="text-gray-300 hover:text-yellow-500 flex items-center space-x-2 transition-colors group"
                  >
                    <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="relative">
                      {text}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div style={{ opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent" />
        </motion.div>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500">
              Vinay Developer
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-400">
              Crafting Digital Experiences Through Code
            </p>
            <p className="mt-4 text-lg text-gray-500">
              Full Stack Developer • UI/UX Enthusiast • Tech Innovator
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              {[
                { icon: Github, href: "https://github.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
                { 
                  icon: ArrowRight, 
                  href: "/resume.pdf",
                  download: true,
                  className: "p-3 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 transition-colors"
                },
                { icon: Mail, href: "mailto:contact@vinay.dev" },
              ].map(({ icon: Icon, href, download, className }) => (
                <motion.a
                  key={href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href={href}
                  target={download ? undefined : "_blank"}
                  rel={download ? undefined : "noopener noreferrer"}
                  download={download}
                  className={className || "p-3 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 transition-colors"}
                >
                  <Icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


{/* this section is for about  */}



      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500">Professional Expertise</h2>
            <p className="mt-4 text-gray-400">Mastering multiple disciplines in technology and finance</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map(({ icon: Icon, name, items, href }) => (
              <Link href={href} key={name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="h-full p-6 rounded-xl bg-yellow-500/10 transition duration-500 ease-in-out border border-yellow-500/10 hover:border-yellow-500/30 transition-colors hover:scale-105 cursor-pointer flex flex-col"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-yellow-500">{name}</h3>
                  </div>
                  <ul className="space-y-2 flex-grow">
                    {items.map((item) => (
                      <li key={item} className="text-gray-400 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-yellow-500/70 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* <Link href="/about">
  <span className="text-gray-300 hover:text-yellow-500">About</span>
</Link> */}


{/* from here the professional journey section starts */}

      <section id="journey" ref={journeyRef} className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Desert background elements with modern twist */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/5 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/10 to-transparent"></div>
          {/* Modern geometric patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold text-yellow-500 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              My Journey
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Navigate through the sands of time
            </motion.p>
          </motion.div>
          
          <div className="relative">
            {/* Enhanced vertical road with glow */}
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full"
              initial={{ scaleY: 0, transformOrigin: "top" }}
              whileInView={{ 
                scaleY: 1,
                transition: {
                  duration: 1.2,
                  ease: "easeInOut"
                }
              }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700 shadow-lg"></div>
              <div className="absolute inset-0 bg-yellow-500/20 blur-sm"></div>
            </motion.div>
            
            {/* Modern sand dunes */}
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2 w-48 h-48 bg-yellow-900/20 rounded-full blur-3xl -bottom-16"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ 
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.8,
                  delay: 0.4
                }
              }}
              viewport={{ once: false, amount: 0.3 }}
            />
            
            <motion.div 
              className="space-y-24"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ 
                scale: 1,
                opacity: 1,
                transition: {
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              viewport={{ once: false, amount: 0.3 }}
            >
              {experiences.map((exp, index) => (
                <Link href={`#experience-${index}`} key={index}>
                  <motion.div
                    initial={{ 
                      opacity: 0,
                      y: 50,
                      scale: 0.8,
                      rotateX: 90,
                      transformOrigin: "top center"
                    }}
                    whileInView={{ 
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      rotateX: 0,
                      transition: {
                        duration: 0.6,
                        delay: index * 0.15,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    exit={{
                      opacity: 0,
                      y: 50,
                      scale: 0.8,
                      rotateX: 90,
                      transition: {
                        duration: 0.4,
                        delay: (experiences.length - index - 1) * 0.08,
                        ease: "easeIn"
                      }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="relative group cursor-pointer"
                    style={{
                      marginLeft: index % 2 === 0 ? '0' : 'auto',
                      marginRight: index % 2 === 0 ? 'auto' : '0',
                      width: 'fit-content',
                      marginTop: `${index * 160}px`,
                      perspective: "1000px"
                    }}
                  >
                    {/* Modern timeline marker */}
                    <motion.div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, rotate: 180 }}
                      whileInView={{ 
                        scale: 1,
                        rotate: 0,
                        transition: {
                          duration: 0.5,
                          delay: index * 0.15 + 0.15,
                          ease: "backOut"
                        }
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full relative shadow-lg shadow-yellow-500/20">
                        <div className="absolute inset-1 rounded-full bg-yellow-500/20 animate-pulse"></div>
                      </div>
                    </motion.div>

                    {/* Enhanced card with modern design */}
                    <motion.div 
                      className="relative"
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="w-80 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/10 backdrop-blur-sm">
                        {/* Modern glass effect */}
                        <motion.div 
                          className="absolute inset-0 bg-black/95 rounded-2xl backdrop-blur-[4px] group-hover:opacity-0 transition-all duration-500 ease-out"
                          initial={{ opacity: 1 }}
                          whileHover={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="absolute inset-0 bg-[url('/window-pattern.png')] opacity-5"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60"></div>
                          <div className="absolute inset-0 border-2 border-yellow-500/10 rounded-2xl"></div>
                        </motion.div>

                        {/* Card content with modern typography */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-yellow-500 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-300">
                              {exp.title}
                            </h3>
                            <span className="text-gray-400 flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{exp.period}</span>
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4 font-medium">{exp.company}</p>
                          <p className="text-gray-400 mb-4">{exp.description}</p>
                          
                          {/* Modern achievements list */}
                          <div className="mt-4">
                            <h4 className="text-yellow-500 font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-300">
                              Key Achievements
                            </h4>
                            <ul className="space-y-2">
                              {exp.achievements.map((achievement, i) => (
                                <motion.li 
                                  key={i} 
                                  className="text-gray-200 flex items-start space-x-2"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ 
                                    opacity: 1, 
                                    x: 0,
                                    transition: {
                                      delay: i * 0.1,
                                      duration: 0.3
                                    }
                                  }}
                                  viewport={{ once: true }}
                                >
                                  <ArrowRight className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* professional journey section ends */}

{/* from here the portfolio section starts */}

      <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500">Featured Projects</h2>
            <p className="mt-4 text-gray-400">Showcasing innovation through code</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Link href={`#project-${index}`} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:border-yellow-500/30 cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-yellow-500 mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Mountain background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-64">
            {/* Mountain range */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48">
              {/* Mountain peaks */}
              <div className="absolute bottom-0 left-1/4 w-32 h-24 bg-gradient-to-t from-yellow-800/30 to-transparent clip-path-mountain"></div>
              <div className="absolute bottom-0 left-1/2 w-40 h-32 bg-gradient-to-t from-yellow-800/40 to-transparent clip-path-mountain"></div>
              <div className="absolute bottom-0 right-1/4 w-36 h-28 bg-gradient-to-t from-yellow-800/35 to-transparent clip-path-mountain"></div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-8">Lets Connect</h2>
            <p className="text-gray-400 mb-8">
              I am always interested in hearing about new projects and opportunities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="mailto:contact@vinay.dev"
                className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors"
              >
                <Mail className="w-6 h-6 text-yellow-500" />
                <span className="text-gray-300">contact@vinay.dev</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors"
              >
                <MapPin className="w-6 h-6 text-yellow-500" />
                <span className="text-gray-300">Haryana , India</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .clip-path-mountain {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </main>
  );
}