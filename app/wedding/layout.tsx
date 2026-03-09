import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mariage Lynda & Aymen',
  description: 'Mariage Lynda & Aymen - 09 avril 2026',
}

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="wedding-page">
      {children}
    </div>
  )
}
