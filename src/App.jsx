import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../Component/Login";
import Register from "../Component/Register";
import Dashboard from "../Component/AdminDashBoard";
import AssignedTickets from "../Component/DataMemberDashboard";
import OpenTickets from "../Component/OpenTickets";
import Requester from "../Component/Requester";
import ManageDataMember from "../Component/ManageDataMember";
import RequesterDashboard from "../Component/RequesterDashBoard";
import Navbar from "../Component/Navbar";

function App() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getHomeRoute = () => {
    if (!user) return "/login";

    switch (user.role?.toLowerCase()) {
      case "admin":
        return "/dashboard";
      case "datamember":
        return "/assigned-tickets";
      case "requester":
        return "/requesterDashboard";
      default:
        return "/login";
    }
  };

  return (
    <BrowserRouter>
      <div className="app-with-navbar">
        <Navbar role={user?.role || ""} setUser={setUser} />
        <div className="app-body">
          <Routes>
          
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

      
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manageDataMember" element={<ManageDataMember />} />

          
          <Route path="/assigned-tickets" element={<AssignedTickets />} />

        
          <Route path="/requesterDashboard" element={<RequesterDashboard />} />
          <Route path="/open-tickets" element={<OpenTickets />} />
          <Route path="/requester" element={<Requester />} />

          
          <Route
            path="*"
            element={<Navigate to={getHomeRoute()} replace />}
          />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
