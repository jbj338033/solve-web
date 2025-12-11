interface Props {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-medium">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
