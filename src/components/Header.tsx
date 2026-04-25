import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          search={{ week: undefined }}
          className="order-1 mr-auto text-base font-bold tracking-tight text-(--sea-ink) no-underline sm:text-lg"
        >
          Level 31
        </Link>

        <div className="order-2 ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <ThemeToggle />
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            search={{ week: undefined }}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Home
          </Link>
          <Link
            to="/leaderboard"
            search={{ month: undefined }}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Leaderboard
          </Link>
          <Link
            to="/teams"
            search={{}}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Teams
          </Link>
          <Link
            to="/scores"
            search={{}}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Scores
          </Link>
          <Link
            to="/about"
            search={{}}
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
