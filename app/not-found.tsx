import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state">
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>
            The page you requested does not exist or the content has not been
            published yet.
          </p>
          <Link className="button" href="/">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
