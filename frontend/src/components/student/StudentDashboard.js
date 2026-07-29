import { useState } from "react";
import Sidebar from "../shared/Sidebar";
import StudentHome from "./StudentHome";
import AptitudeTest from "./AptitudeTest";
import StudentResults from "./StudentResults";
import MaterialsPanel from "../admin/MaterialsPanel";
import ApplicationTracker from "../admin/ApplicationTracker";
import TechnicalPanel from "../admin/TechnicalPanel";
import { CompaniesPanel } from "../admin/CompaniesPanel";
import NotificationsPanel from "../admin/NotificationsPanel";
import "./StudentDashboard.css";

function StudentDashboard({ user, onLogout }) {
  const [active, setActive] = useState("dashboard");

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return <StudentHome studentId={user.id} />;
      case "materials":
        return <MaterialsPanel role="student" />;
      case "aptitude-test":
        return <AptitudeTest studentId={user.id} />;
      case "technical-q":
        return <TechnicalPanel role="student" />;
        case "tracker": // Matches the ID we put in Sidebar.js
        return <ApplicationTracker role="student" user={user} />;
      case "companies":
        return <CompaniesPanel role="student" />;
      case "results":
        return <StudentResults studentId={user.id} />;
      case "notifications":
        return <NotificationsPanel role="student" userId={user.id} />;
      default:
        return <StudentHome studentId={user.id} />;
    }
  };

  return (
    <div className="student-layout">
      <Sidebar
        role="student"
        active={active}
        setActive={setActive}
        user={user}
        onLogout={onLogout}
      />
      <main className="student-main">
        <div className="student-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default StudentDashboard;
