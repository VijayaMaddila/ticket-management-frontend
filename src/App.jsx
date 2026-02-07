import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../Login";
import Register from "../Component/Register";
import Dashboard from "../Component/DashBoard";
import CreateTicket from "../Component/CreateTicket";
import TicketDetails from "../Component/TicketDetails";
import AdminPanel from "../Component/Admin";
import AssignedTickets from "../Component/DataMember";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
      
        {!user && (
          <>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

      
        {user && (
          <>
          
            <Route path="/" element={<Dashboard user={user} setUser={setUser} />} />

          
            <Route
              path="/create-ticket"
              element={
                user.role.toLowerCase() === "requester" ? (
                  <CreateTicket user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            
            <Route
              path="/assigned-tickets"
              element={
                user.role.toLowerCase() === "datamember" ? (
                  <AssignedTickets user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            
            <Route
              path="/ticket/:id"
              element={
                ["admin", "requester"].includes(user.role.toLowerCase()) ? (
                  <TicketDetails user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

          
            <Route
              path="/admin"
              element={
                user.role.toLowerCase() === "admin" ? (
                  <AdminPanel user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
