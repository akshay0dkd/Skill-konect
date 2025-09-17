import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./redux/store";
import { setupAuthListener } from "./redux/features/auth/authListener";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Navbar from "./components/Navbar";
import ActivityLog from "./pages/ActivityLog";
import AllSessions from "./pages/AllSessions";
import FinishLogin from "./pages/FinishLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";

const App: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = setupAuthListener(dispatch);
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, [dispatch]);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/finishLogin" element={<FinishLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/sessions" element={<AllSessions />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
