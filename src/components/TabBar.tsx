import Link from "next/link";

const TABS = [
  { href: "/", label: "Heute" },
  { href: "/tagebuch", label: "Tagebuch" },
  { href: "/profil", label: "Profil" },
] as const;

export function TabBar({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav className="tabbar" aria-label="Hauptnavigation">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} aria-current={tab.href === active ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
