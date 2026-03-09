interface RSVPCTAProps {
  slug: string
}

export function RSVPCTA({ slug }: RSVPCTAProps) {
  return (
    <section className="py-16 px-4 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border z-10 md:relative md:bg-transparent md:border-t-0 md:backdrop-blur-none">
      <div className="max-w-2xl mx-auto text-center">
        <a
          href={`/i/${slug}/rsvp`}
          className="inline-block px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto"
        >
          RSVP Now
        </a>
      </div>
    </section>
  )
}
