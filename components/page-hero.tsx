import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  children
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{description}</p>
        </div>
        {children ? <div className="page-hero__aside">{children}</div> : null}
      </div>
    </section>
  );
}
