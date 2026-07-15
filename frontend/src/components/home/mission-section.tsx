export function MissionSection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="heading-secondary mb-6">Our Mission</h2>
            <p className="mb-4 text-gray-600 leading-relaxed">
              TK Concepts was founded with a singular vision: to create products
              that point people back to what matters most. In a world full of noise,
              we believe in creating things of substance.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every product we create is intentionally designed to reflect our three core
              pillars: Faith, Purpose, and Identity. We are not just selling products
              we are building a movement of people who live with intention.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4">
              {["Faith", "Purpose", "Identity"].map((value) => (
                <div key={value} className="flex h-32 w-32 items-center justify-center rounded-xl bg-accent/10 text-center">
                  <span className="text-sm font-bold text-accent">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
