export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modeun Construction
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Building excellence, one project at a time
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg hover:bg-gray-800 transition-colors">
            Get Quote
          </button>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Residential</h3>
              <p className="text-gray-600">
                Custom homes and renovations built to your specifications
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Commercial</h3>
              <p className="text-gray-600">
                Office buildings and retail spaces designed for success
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Industrial</h3>
              <p className="text-gray-600">
                Warehouses and manufacturing facilities built to last
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-xl mb-8">Contact us for a free consultation</p>
          <div className="space-y-2">
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@modeunconstruction.com</p>
          </div>
        </div>
      </section>
    </main>
  )
}