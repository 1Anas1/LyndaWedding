interface HeroProps {
  names: string[]
  date: string
  message?: string
}

export function Hero({ names, date, message }: HeroProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          {names.join(' & ')}
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground">{date}</p>
        {message && (
          <p className="text-lg md:text-xl mt-8 max-w-xl mx-auto">{message}</p>
        )}
      </div>
    </section>
  )
}
