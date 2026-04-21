import Link from "next/link";

export default function Home() {
  return (
    <div className="dark">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-bg/60 backdrop-blur-3xl">
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">home_work</span>
            <span className="text-2xl font-bold tracking-tighter text-on-surface font-headline">Rentli</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm tracking-wide transition-colors duration-300 text-on-surface-variant hover:text-primary font-label">Features</a>
            <a href="#how-it-works" className="text-sm tracking-wide transition-colors duration-300 text-on-surface-variant hover:text-primary font-label">How it works</a>
            <a href="#pricing" className="text-sm tracking-wide transition-colors duration-300 text-on-surface-variant hover:text-primary font-label">Pricing</a>
          </div>
          <Link
            href="/auth/login"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm tracking-tight active:scale-95 transition-transform hover:opacity-90"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-50 grayscale-[30%]"
              alt="Modern apartment building exterior"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDXrz9jaxMuYPYJq1mMydELJyaA8O3Wk9VtqWBE-7dghj1HF1tM5Yvn0N6wDGWwTUadeVtBWB-fjxvtR7CiYUHs-b-Z7idCoL-go_fYJXYAJ3rlepjpz5uVe_18FJc7vPfXXO9sSJlzcERLnpkInQ0AU0N8MvmtHWZlddv3BKuAnvQ_7ya4avnh5a8EgNCMgQi-FDiFu9w40YL1sskzycaFL5uymAmo2WhHK1E4D6pjopk0YAf8y5bHaFAFGUtnBAXzglNlKg5n_hp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.2em] font-label text-on-surface-variant mb-6">
                Rent Management Made Simple
              </span>
              <h1 className="text-6xl md:text-8xl font-extrabold font-headline leading-[0.95] tracking-tighter text-on-surface mb-8">
                Collect Rent. <span className="text-primary">Track</span> Everything.
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                Rentli gives property managers and tenants a single platform to manage leases, log payments, issue receipts, and resolve disputes — built for African rental markets.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/auth/login"
                  className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-base transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                >
                  Get Started Free
                </Link>
                <a href="#how-it-works" className="flex items-center gap-2 text-on-surface-variant font-semibold hover:text-primary transition-colors text-sm">
                  <span className="material-symbols-outlined">play_circle</span>
                  See How It Works
                </a>
              </div>
            </div>
          </div>

          {/* Floating stats */}
          <div className="absolute bottom-12 right-8 z-10 hidden lg:flex gap-4">
            <div className="bg-surface-4/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 w-44">
              <div className="text-primary font-headline text-3xl font-bold mb-1">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Digital Receipts</div>
            </div>
            <div className="bg-surface-4/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 w-44">
              <div className="text-on-surface font-headline text-3xl font-bold mb-1">ZMW</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Kwacha-first platform</div>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main feature */}
            <div className="md:col-span-8 group bg-surface-1 rounded-[2rem] overflow-hidden p-12 relative flex flex-col justify-between min-h-[420px] border border-white/5">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">payments</span>
                <h3 className="text-4xl font-bold font-headline mb-4 text-on-surface">Payment Tracking</h3>
                <p className="text-on-surface-variant text-lg max-w-md">
                  Tenants log payments with a reference number. Property managers confirm or dispute. Receipts are auto-generated and stored — no spreadsheets needed.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-2/3 bg-gradient-to-tl from-primary/10 to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="absolute right-12 bottom-12 w-2/3 h-40 bg-surface-3 rounded-xl flex items-end p-4 gap-2 border border-white/5">
                {[40, 65, 100, 80, 55, 90].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm ${i === 2 ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Lease management */}
            <div className="md:col-span-4 bg-surface-3 rounded-[2rem] p-10 flex flex-col justify-center border border-white/5">
              <div className="bg-surface-5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">description</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-4 text-on-surface">Lease Management</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Track lease start and end dates, rent amounts, due days, and tenant history. Know exactly who owes what and when.
              </p>
              <div className="mt-10 space-y-3">
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant text-xs">Active Tenancies</span>
                  <span className="text-primary font-bold font-mono">Live sync</span>
                </div>
              </div>
            </div>

            {/* Invite system */}
            <div className="md:col-span-4 bg-surface-4 rounded-[2rem] p-10 border border-white/5">
              <h3 className="text-2xl font-bold font-headline mb-4 text-on-surface">Invite Tenants</h3>
              <p className="text-on-surface-variant font-body text-sm mb-8 leading-relaxed">
                Generate a secure link to onboard tenants to a specific unit. No manual entry. They accept and the lease is created automatically.
              </p>
              <div className="bg-surface-3 rounded-xl p-4 font-mono text-xs text-on-surface-muted break-all border border-white/5">
                rentli.app/invite/a3f9c2...
              </div>
            </div>

            {/* Disputes */}
            <div className="md:col-span-4 bg-surface-4 rounded-[2rem] p-10 border border-white/5">
              <div className="bg-surface-5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-4 text-on-surface">Dispute Resolution</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Tenants can raise disputes on payments. Property managers respond, mark in-progress, and close with a resolution note — all in one thread.
              </p>
            </div>

            {/* Dual role */}
            <div className="md:col-span-8 bg-surface-0 border border-white/5 rounded-[2rem] p-12 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold font-headline mb-4 text-on-surface">Built for Both Sides</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Property managers get a full portfolio dashboard with occupancy, payments, and tenants. Tenants get a clean view of their lease, balance, and payment history. One platform, two experiences.
                </p>
              </div>
              <div className="flex-none flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-surface-3 px-5 py-3 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-primary text-lg">domain</span>
                  <span className="text-sm font-bold">Property Manager Dashboard</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-3 px-5 py-3 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
                  <span className="text-sm text-on-surface-variant">Tenant Portal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-32 bg-surface-1 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
              <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label block mb-4">Simple by design</span>
              <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface">How Rentli Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: "login", title: "Sign Up & Add Properties", desc: "Create your property manager account, add your properties and units in minutes. Free plan covers up to 1 property and 5 units." },
                { step: "02", icon: "mail", title: "Invite Your Tenants", desc: "Generate a secure invite link per unit. Your tenant signs up, accepts the invite, and the lease is active — no paperwork." },
                { step: "03", icon: "receipt_long", title: "Track Payments & Receipts", desc: "Tenants log payments with a method and reference. You confirm or dispute. Receipts auto-generate with unique numbers." },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="bg-surface-4 rounded-[2rem] p-10 border border-white/5">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-primary/30 font-headline font-black text-5xl leading-none">{step}</span>
                    <span className="material-symbols-outlined text-primary text-3xl mt-2">{icon}</span>
                  </div>
                  <h4 className="text-xl font-bold font-headline mb-3">{title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label block mb-4">Transparent pricing</span>
              <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface">Start Free. Scale When Ready.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="bg-surface-3 rounded-[2rem] p-10 border border-white/5">
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-2">Free</p>
                  <p className="text-5xl font-extrabold font-headline">K0</p>
                  <p className="text-on-surface-variant text-sm mt-1">Forever free</p>
                </div>
                <ul className="space-y-3 text-sm mb-10">
                  {["1 property", "Up to 5 units", "Up to 5 tenants", "Payment tracking", "Digital receipts", "Dispute management"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">check</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="block text-center w-full py-4 bg-surface-5 text-on-surface font-bold rounded-full hover:bg-surface-bright transition-all">
                  Get Started
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-primary/5 rounded-[2rem] p-10 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-6 right-6 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Popular
                </div>
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-label mb-2">Pro</p>
                  <p className="text-5xl font-extrabold font-headline text-primary">K99</p>
                  <p className="text-on-surface-variant text-sm mt-1">per month</p>
                </div>
                <ul className="space-y-3 text-sm mb-10">
                  {["Unlimited properties", "Unlimited units", "Unlimited tenants", "Everything in Free", "Advanced dashboard", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-base">check</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="block text-center w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
          <div className="max-w-3xl mx-auto">
            <h2 className="text-6xl md:text-7xl font-extrabold font-headline tracking-tight text-on-surface mb-8">
              Ready to Stop Chasing Rent?
            </h2>
            <p className="text-xl text-on-surface-variant mb-12">
              Join property managers across Zambia who use Rentli to manage rent collection, leases, and tenants from their phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="bg-primary text-on-primary px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                className="bg-surface-bright text-on-surface px-10 py-5 rounded-full font-bold text-lg border border-white/10 hover:border-primary transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-1 w-full rounded-t-3xl border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <div className="text-xl font-bold text-on-surface mb-2 font-headline">Rentli</div>
            <div className="text-[11px] uppercase tracking-widest text-on-surface-variant font-label">
              © 2026 Rentli. Rent payment management for Africa.
            </div>
          </div>
          <div className="flex gap-10">
            <a href="#features" className="text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all font-label">Features</a>
            <a href="#how-it-works" className="text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all font-label">How it works</a>
            <a href="#pricing" className="text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all font-label">Pricing</a>
            <Link href="/auth/login" className="text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all font-label">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
