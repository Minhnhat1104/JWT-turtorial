import "./App.css";
import HomePage from "./Components/Home/HomePage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import NavBar from "./Components/NavBar/NavBar";

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">
        <Routes>
          <Route ket={1} path="/" element={<HomePage />} />
          <Route ket={2} path="/login" element={<Login />} />
          <Route ket={3} path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
