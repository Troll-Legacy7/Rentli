export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter font-headline text-primary">
            Rentli
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Premium Property Management</p>
        </div>
        {children}
      </div>
    </div>
  );
}
