import { Link, Outlet } from 'react-router-dom';

/**
 * The Outlet component (from React Router) is a placeholder.
 * It tells React Router "render the active child route here."
 * So, your Home, PracticeDashboard, etc., will all be
 * rendered in place of <Outlet />.
 */

function Layout() {
  return (
    <>
      {/* This is your new global header.
        - 'fixed': Keeps it at the top.
        - 'z-50': Ensures it's above other content.
      */}
      <header className="fixed top-0 left-0 w-full p-6 z-50">
        <Link 
          to="/" 
          className="
            text-2xl font-bold 
            gradient-text  // Use the same gradient text from your index.css
            transition-all duration-300
            hover:opacity-80"
        >
          {">_  W H Y P P E R"}
        </Link>
      </header>

      {/* <Outlet /> renders the actual page component 
        (e.g., Home.js, PracticeDashboard.js).
        The page content itself will still have the 'hero-background'
        to fill the screen.
      */}
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;