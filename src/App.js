import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./App_Home";
import Reader from "./Reader";
import Series from "./Series";
import Browse from "./Browse";
import Auth from "./Auth";
import ResetPassword from "./ResetPassword";
import Admin from "./Admin";
import Profile from "./Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/series/:id" element={<Series />} />
        <Route path="/read/:series/:chapter" element={<Reader />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}