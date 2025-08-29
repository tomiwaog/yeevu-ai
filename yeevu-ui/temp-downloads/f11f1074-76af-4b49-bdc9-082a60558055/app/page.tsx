import Link from 'next/link'

const samplePosts = [
  {
    id: '1',
    title: 'Getting Started with Next.js',
    excerpt: 'Learn how to build modern web applications with Next.js and React.',
    date: '2024-01-15',
    slug: 'getting-started-nextjs'
  },
  {
    id: '2',
    title: 'Markdown in React Applications',
    excerpt: 'Discover how to integrate markdown content into your React applications.',
    date: '2024-01-10',
    slug: 'markdown-react-applications'
  },
  {
    id: '3',
    title: 'Styling with Tailwind CSS',
    excerpt: 'Master the art of utility-first CSS with Tailwind CSS.',
    date: '2024-01-05',
    slug: 'styling-tailwind-css'
  }
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Welcome to Modern Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Discover insightful articles about web development, technology, and design. 
          Built with Next.js, TypeScript, and Tailwind CSS with full markdown support.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {samplePosts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6">
              <time className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-3">
                <Link 
                  href={`/posts/${post.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.excerpt}
              </p>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center mt-16">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ready to start blogging?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This blog supports markdown files. Add your posts to the <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">posts</code> directory.
          </p>
          <Link
            href="/posts/sample-post"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            View Sample Post
          </Link>
        </div>
      </div>
    </div>
  )
}