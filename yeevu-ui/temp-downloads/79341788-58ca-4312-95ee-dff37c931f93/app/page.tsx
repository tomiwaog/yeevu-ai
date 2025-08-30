export default function Home() {
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Welcome to Modern Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A beautifully crafted blog built with Next.js, TypeScript, and Tailwind CSS. 
            Write and share your thoughts with markdown support and modern design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Markdown Support
            </h2>
            <p className="text-gray-600">
              Write your blog posts in markdown with full support for code blocks, 
              tables, and GitHub-flavored markdown features.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Modern Design
            </h2>
            <p className="text-gray-600">
              Clean, responsive design built with Tailwind CSS that looks great 
              on all devices and screen sizes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              TypeScript Ready
            </h2>
            <p className="text-gray-600">
              Built with TypeScript for better developer experience, type safety, 
              and maintainable code.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Next.js Powered
            </h2>
            <p className="text-gray-600">
              Leverages Next.js 14 with app router for optimal performance, 
              SEO, and developer experience.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="/blog" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Read Blog Posts
          </a>
        </div>
      </div>
    </div>
  )
}