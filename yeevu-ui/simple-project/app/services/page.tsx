export default function Services() {
  const services = [
    {
      title: "New Construction",
      description: "From foundation to finish, we build quality structures that stand the test of time.",
    },
    {
      title: "Renovations",
      description: "Transform your existing space with our expert renovation services.",
    },
    {
      title: "Commercial Projects",
      description: "Large-scale commercial construction for businesses and organizations.",
    },
    {
      title: "Project Management",
      description: "Full project oversight ensuring timely completion within budget.",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">{service.title}</h2>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Modeun?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">25+ Years Experience</h3>
              <p className="text-gray-600">Decades of construction expertise</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Licensed & Insured</h3>
              <p className="text-gray-600">Full protection for every project</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quality Guarantee</h3>
              <p className="text-gray-600">We stand behind our work</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}