import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import AdminHome from "./AdminHome";
import StudentsPanel from "./StudentsPanel";
import MaterialsPanel from "./MaterialsPanel";
import AptitudePanel from "./AptitudePanel";
import TechnicalPanel from "./TechnicalPanel";
import ApplicationTracker from "./ApplicationTracker";
import CompaniesPanel from "./CompaniesPanel";
import NotificationsPanel from "./NotificationsPanel";
import ReportsPanel from "./ReportsPanel";
import "./AdminDashboard.css";

function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return <AdminHome />;
      case "students":
        return <StudentsPanel />;
      case "materials":
        return <MaterialsPanel role="admin" />;
      case "aptitude":
        return <AptitudePanel role="admin" />;
      case "technical":
        return <TechnicalPanel role="admin" />;
        case "tracker": // Matches the ID we put in Sidebar.js
        return <ApplicationTracker role="admin" user={user} />;
      case "companies":
        return <CompaniesPanel role="admin" />;
      case "notifications":
        return <NotificationsPanel role="admin" />;
      case "reports":
        return <ReportsPanel />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar
        role="admin"
        active={active}
        setActive={setActive}
        user={user}
        onLogout={onLogout}
      />
      <main className="admin-main">
        <div className="admin-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default AdminDashboard;
