import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-warm-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-semibold text-charcoal tracking-tight">Wedex</span>
        <Link
          href="/login"
          className="text-sm text-charcoal/70 hover:text-charcoal transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <p className="text-sm font-medium text-blush uppercase tracking-widest mb-4">
          For Singapore couples
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal mb-6 max-w-3xl leading-tight text-balance">
          Your wedding budget,{' '}
          <span className="text-blush">planned smart.</span>
        </h1>
        <p className="text-lg text-charcoal/60 max-w-xl mb-10 text-balance">
          Plan what you&apos;ll spend. Assign the right credit card to each vendor.
          Wedex watches and makes every dollar work harder.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-blush text-white px-8 py-4 rounded-full text-base font-medium hover:bg-blush-600 transition-colors shadow-sm"
        >
          Start planning free
        </Link>
        <p className="mt-4 text-sm text-charcoal/40">
          No credit card required · Takes 5 minutes
        </p>
      </section>

      {/* Feature pills */}
      <section className="flex flex-wrap gap-3 justify-center px-6 pb-16">
        {[
          '💳 Miles optimisation',
          '📊 Budget breakdown',
          '🏨 Vendor tracker',
          '🍯 Ang bao projections',
          '✈️ Honeymoon equivalency',
        ].map((feature) => (
          <span
            key={feature}
            className="px-4 py-2 bg-white border border-charcoal/10 rounded-full text-sm text-charcoal/70 shadow-sm"
          >
            {feature}
          </span>
        ))}
      </section>
    </main>
  )
}
