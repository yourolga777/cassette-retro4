interface SectionTitleProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionTitle({ label, title, subtitle, align = "left" }: SectionTitleProps) {
  return (
    <div className={`mb-10 ${align === "center" ? "text-center" : ""}`}>
      {label && (
        <span className="text-xs font-medium text-brass uppercase tracking-[0.15em] mb-3 block">
          {label}
        </span>
      )}
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted text-sm max-w-lg leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`section-divider mt-4 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
