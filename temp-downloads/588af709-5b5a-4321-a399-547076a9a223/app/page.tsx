export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'white',
          fontFamily: "'Playfair Display', serif",
        }}>
          ✍️ ModernBlog
        </h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#features" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
          <a href="#get-started" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        color: 'white',
      }}>
        <h2 style={{
          fontSize: '4rem',
          fontWeight: 900,
          margin: '0 0 1.5rem 0',
          fontFamily: "'Playfair Display', serif",
          lineHeight: 1.2,
        }}>
          Modern Blogging,<br />Powered by Markdown
        </h2>
        <p style={{
          fontSize: '1.5rem',
          maxWidth: '700px',
          margin: '0 auto 3rem',
          opacity: 0.95,
          fontWeight: 300,
        }}>
          Create beautiful, fast, and SEO-friendly blog posts with the simplicity of Markdown and the power of Next.js
        </p>
        <button style={{
          padding: '1rem 3rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          backgroundColor: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
        }}>
          Start Writing Today
        </button>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '5rem 2rem',
        backgroundColor: 'white',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
            fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a',
          }}>
            Why Choose ModernBlog?
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#f8f9ff',
              borderRadius: '20px',
              border: '2px solid #e0e7ff',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#667eea',
              }}>
                Markdown Support
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Write your content in pure Markdown. Support for code blocks, tables, images, and all standard Markdown syntax. Focus on writing, not formatting.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#fff8f0',
              borderRadius: '20px',
              border: '2px solid #ffe7cc',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#f59e0b',
              }}>
                Lightning Fast
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Built on Next.js 14 with App Router. Static generation, server components, and optimized performance out of the box. Your blog loads instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '20px',
              border: '2px solid #d1fae5',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#10b981',
              }}>
                Beautiful Design
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Modern, responsive design that looks great on all devices. Syntax highlighting for code, optimized typography, and customizable themes.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#fef2f2',
              borderRadius: '20px',
              border: '2px solid #fecaca',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#ef4444',
              }}>
                SEO Optimized
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Built-in SEO best practices. Meta tags, Open Graph support, sitemap generation, and semantic HTML for maximum discoverability.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#f5f3ff',
              borderRadius: '20px',
              border: '2px solid #ddd6fe',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#8b5cf6',
              }}>
                File-Based Content
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Store your posts as Markdown files. Easy to version control with Git, no database required. Perfect for developers and writers alike.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#ecfeff',
              borderRadius: '20px',
              border: '2px solid #cffafe',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h4 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#06b6d4',
              }}>
                Easy Deployment
              </h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                Deploy to Vercel, Netlify, or any hosting platform in minutes. Automatic builds and instant preview deployments for every commit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '5rem 2rem',
        backgroundColor: '#1a1a1a',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
            fontFamily: "'Playfair Display', serif",
          }}>
            How It Works
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#667eea',
                minWidth: '50px',
              }}>
                01
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Write in Markdown</h4>
                <p style={{ color: '#999', lineHeight: 1.8 }}>
                  Create your blog posts using simple Markdown syntax. Add frontmatter for metadata like title, date, author, and tags. Write naturally without worrying about HTML.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#667eea',
                minWidth: '50px',
              }}>
                02
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Automatic Processing</h4>
                <p style={{ color: '#999', lineHeight: 1.8 }}>
                  Our system uses gray-matter to parse frontmatter and marked.js to convert Markdown to HTML. Posts are automatically indexed and sorted by date.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#667eea',
                minWidth: '50px',
              }}>
                03
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Static Generation</h4>
                <p style={{ color: '#999', lineHeight: 1.8 }}>
                  Next.js generates static pages at build time for incredible performance. Each post gets its own optimized route with perfect SEO and sharing capabilities.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#667eea',
                minWidth: '50px',
              }}>
                04
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Deploy & Share</h4>
                <p style={{ color: '#999', lineHeight: 1.8 }}>
                  Push to your Git repository and deploy automatically. Share your beautifully rendered blog posts with the world. No backend management required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" style={{
        padding: '5rem 2rem',
        backgroundColor: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{
            fontSize: '2.5rem',
            marginBottom: '2rem',
            fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a',
          }}>
            Ready to Start Blogging?
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2rem',
            lineHeight: 1.8,
          }}>
            Join thousands of writers and developers who trust ModernBlog for their content publishing needs. Simple, powerful, and completely customizable.
          </p>
          
          <div style={{
            backgroundColor: '#f8f9ff',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'left',
            marginTop: '3rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          }}>
            <div style={{ color: '#667eea', marginBottom: '1rem', fontWeight: 600 }}>
              Quick Start:
            </div>
            <div style={{ color: '#1a1a1a', lineHeight: 2 }}>
              <div>$ npm install</div>
              <div>$ npm run dev</div>
              <div style={{ color: '#999', marginTop: '1rem' }}>
                # Create your first post in /posts/my-first-post.md
              </div>
              <div style={{ color: '#999' }}>
                # Visit http://localhost:3000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        backgroundColor: '#1a1a1a',
        color: 'white',
        textAlign: 'center',
      }}>
        <p style={{
          margin: 0,
          opacity: 0.8,
        }}>
          Built with ❤️ using Next.js, React, and Markdown
        </p>
        <p style={{
          margin: '1rem 0 0 0',
          opacity: 0.6,
          fontSize: '0.9rem',
        }}>
          © 2024 ModernBlog. A modern blogging platform for the modern web.
        </p>
      </footer>
    </div>
  )
}
