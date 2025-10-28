'use client'

import { useState } from 'react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('about')

  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-featured online shopping platform built with Next.js, TypeScript, and Stripe integration. Features include product catalog, cart management, and secure checkout.',
      tech: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
      image: '🛍️',
    },
    {
      title: 'Task Management App',
      description: 'Collaborative task management application with real-time updates. Users can create boards, assign tasks, and track progress with an intuitive drag-and-drop interface.',
      tech: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
      image: '📋',
    },
    {
      title: 'Weather Dashboard',
      description: 'Real-time weather application displaying current conditions and 7-day forecasts. Features location search, favorite cities, and interactive weather maps.',
      tech: ['React', 'OpenWeather API', 'Chart.js', 'Tailwind CSS'],
      image: '🌤️',
    },
    {
      title: 'Blog Platform',
      description: 'Modern blogging platform with markdown support, syntax highlighting, and SEO optimization. Includes admin dashboard for content management.',
      tech: ['Next.js', 'MDX', 'Prisma', 'Vercel'],
      image: '✍️',
    },
  ]

  const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js', 'HTML/CSS'],
    backend: ['Node.js', 'Express', 'Python', 'Django', 'PostgreSQL', 'MongoDB'],
    tools: ['Git', 'Docker', 'AWS', 'Vercel', 'Figma', 'Jest'],
  }

  const experience = [
    {
      role: 'Senior Full-Stack Developer',
      company: 'TechCorp Solutions',
      period: '2021 - Present',
      description: 'Leading development of enterprise web applications, mentoring junior developers, and architecting scalable solutions.',
    },
    {
      role: 'Full-Stack Developer',
      company: 'StartupXYZ',
      period: '2019 - 2021',
      description: 'Built and maintained customer-facing applications, implemented CI/CD pipelines, and optimized application performance.',
    },
    {
      role: 'Frontend Developer',
      company: 'Digital Agency Co',
      period: '2017 - 2019',
      description: 'Created responsive websites and web applications for various clients, focusing on user experience and accessibility.',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alex Morgan
            </h1>
            <div className="flex gap-6">
              <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
              <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
              <a href="#skills" className="hover:text-blue-600 transition-colors">Skills</a>
              <a href="#experience" className="hover:text-blue-600 transition-colors">Experience</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-6xl">
                👨‍💻
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Full-Stack Developer
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Building exceptional digital experiences with modern technologies. 
              Passionate about creating scalable, user-friendly web applications.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="#projects" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                View My Work
              </a>
              <a 
                href="#contact" 
                className="px-8 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-lg"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold mb-8 text-center">About Me</h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Hi! I'm Alex, a passionate full-stack developer with over 6 years of experience 
                building web applications. I specialize in React, Next.js, and Node.js, creating 
                solutions that are both beautiful and functional.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                I love tackling complex problems and turning ideas into reality. When I'm not coding, 
                you can find me contributing to open-source projects, writing technical blog posts, 
                or exploring new technologies.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                I believe in writing clean, maintainable code and creating applications that provide 
                real value to users. Let's build something amazing together!
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-8 rounded-2xl">
              <h4 className="text-2xl font-bold mb-4">Quick Facts</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">📍</span>
                  <span>Based in San Francisco, CA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">💼</span>
                  <span>6+ years of professional experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🎓</span>
                  <span>BS in Computer Science</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🌟</span>
                  <span>50+ projects completed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">☕</span>
                  <span>Fueled by coffee and curiosity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold mb-4 text-center">Featured Projects</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Here are some of my recent works that showcase my skills and expertise
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-8 border border-gray-100 dark:border-slate-700"
              >
                <div className="text-6xl mb-4">{project.image}</div>
                <h4 className="text-2xl font-bold mb-3">{project.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    View Demo →
                  </button>
                  <button className="text-gray-600 dark:text-gray-400 hover:underline font-medium">
                    Source Code →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold mb-4 text-center">Skills & Technologies</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Technologies I work with to bring ideas to life
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">🎨</span>
                Frontend
              </h4>
              <div className="space-y-3">
                {skills.frontend.map((skill, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-lg">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">⚙️</span>
                Backend
              </h4>
              <div className="space-y-3">
                {skills.backend.map((skill, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                    <span className="text-lg">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">🛠️</span>
                Tools
              </h4>
              <div className="space-y-3">
                {skills.tools.map((skill, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-lg">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold mb-4 text-center">Work Experience</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            My professional journey in software development
          </p>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border-l-4 border-blue-600"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-bold mb-1">{exp.role}</h4>
                    <p className="text-xl text-blue-600 dark:text-blue-400">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 mt-2 md:mt-0">{exp.period}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold mb-4 text-center">Let's Work Together</h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Have a project in mind? Let's connect and make it happen!
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-blue-600 dark:text-blue-400">alex.morgan@example.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📱</span>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-blue-600 dark:text-blue-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-gray-700 dark:text-gray-300">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h5 className="font-semibold mb-4">Connect with me</h5>
                <div className="flex gap-4">
                  <button className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center text-xl">
                    💼
                  </button>
                  <button className="w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-xl">
                    🐙
                  </button>
                  <button className="w-12 h-12 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors flex items-center justify-center text-xl">
                    🐦
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6">Send a Message</h4>
              <form className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Alex Morgan. Built with Next.js and Tailwind CSS.
          </p>
          <p className="text-gray-400 mt-2">
            Designed & Developed with ❤️
          </p>
        </div>
      </footer>
    </main>
  )
}
