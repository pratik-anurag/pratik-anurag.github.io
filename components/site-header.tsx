"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" href="/">
          <span className="brand__mark">PA</span>
          <span className="brand__text">
            <strong>{siteConfig.shortName}</strong>
            <span>{siteConfig.title}</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href={siteConfig.resumeHref}
            className={
              pathname.startsWith(siteConfig.resumeHref)
                ? "site-nav__link site-nav__link--active"
                : "site-nav__link"
            }
          >
            Resume
          </Link>
        </nav>
      </div>
    </header>
  );
}
