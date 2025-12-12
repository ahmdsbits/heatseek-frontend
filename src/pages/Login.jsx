import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import "../styles/login.css";

function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.token) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [auth.token, navigate, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,
          password: password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const employeeResponse = await fetch(`http://localhost:8000/api/employees/${data.employee_id}/`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          Authorization: `Token ${data.token}`,
        },
      })
      let employeeData = await employeeResponse.json();

      employeeData.token = data.token
      auth.login(data.token, employeeData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="login-page-grid">
        <h1>
          Log In
          <br />
          To Continue
        </h1>
        <form className="login-page-inputs" onSubmit={handleLogin}>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Employee ID"
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            ></input>
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            ></input>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit">
            Proceed
          </button>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
