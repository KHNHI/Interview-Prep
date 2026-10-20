import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="main-area">
        <Header />
        <main id="workspace-content" className="page-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
