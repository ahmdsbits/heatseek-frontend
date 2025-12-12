import { useState, useEffect } from "react";
import "../styles/dash.css";
import Card from "../components/Card/Card";
import InvertedCard from "../components/InvertedCard/InvertedCard";
import { useAuth } from "../auth/useAuth.js";

function Dash() {
  const [attendanceData, setAttendanceData] = useState({ logs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, employee } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [month, setMonth] = useState()

  const fetchEmployees = async () => {
    if (token && employee?.employee_type === "PRIVILEGED") {
      try {
        const response = await fetch("http://localhost:8000/api/employees/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        setEmployees(data.results);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const fetchAttendance = async () => {
    let targetEmployeeId = selectedEmployeeId || employee?.employee_id;
    if (token && targetEmployeeId) {
      try {
        setLoading(true);
        let date = month || (new Date().toISOString().slice(0, 7));
        let url = `http://localhost:8000/api/attendances/${date}/`;
        if (employee?.employee_type === "PRIVILEGED" && targetEmployeeId) {
          url = `http://localhost:8000/api/attendances/${date}/${targetEmployeeId}/`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        const data = await response.json();
        setAttendanceData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token, employee]);

  useEffect(() => {
    fetchAttendance();
  }, [token, employee, selectedEmployeeId]);

  const handleStatusChange = async (record, newStatus) => {
    const targetEmployeeId = selectedEmployeeId || employee.employee_id;
    if (!targetEmployeeId) return;

    if (targetEmployeeId === employee.employee_id) {
      return
    }

    if (record.status === "ON_LEAVE") {
      return
    }

    if (record.status === "ABSENT") {
      try {
        const response = await fetch(
          `http://localhost:8000/api/attendances/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ status: newStatus, employee_id: targetEmployeeId, date: record.date }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update attendance status");
        }
        fetchAttendance(); // Refresh data
      } catch (err) {
        setError(err.message);
      }
      return
    }
    if (newStatus === "ABSENT") { // Delete
      try {
        const response = await fetch(
          `http://localhost:8000/api/attendances/${record.date}/${targetEmployeeId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete attendance record");
        }
        fetchAttendance(); // Refresh data
      } catch (err) {
        setError(err.message);
      }
    } else { // Update
      try {
        const response = await fetch(
          `http://localhost:8000/api/attendances/${record.date}/${targetEmployeeId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update attendance status");
        }
        fetchAttendance(); // Refresh data
      } catch (err) {
        setError(err.message);
      }
    }
  }


  return (
    <>
      <div className="dash-grid">
        <h1 className="greeting">
          Welcome
          <br />
          {employee.first_name}
        </h1>

        <div className="stats-grid">
          <Card title={attendanceData.absent_this_month + " " + (attendanceData.absent_this_month === 1 ? "day" : "days")} color="var(--pastel-red)">
            Absent this month
          </Card>
          <Card title={attendanceData.absent_last_month + " " + (attendanceData.absent_last_month === 1 ? "day" : "days")} color="var(--pastel-red)">
            Absent last month
          </Card>
          <Card title={(15 - attendanceData.available_paid_leaves) + " " + (employee.available_paid_leaves === 14 ? "leave" : "leaves")} color="var(--cream-yellow)">
            Used up
          </Card>
          <InvertedCard title={attendanceData.available_paid_leaves + " " + (employee.available_paid_leaves === 1 ? "leave" : "leaves")} color="var(--backdrop-green)">
            Remaining
          </InvertedCard>
        </div>
        {employee?.employee_type === "PRIVILEGED" && (
          <div className="employee-selector">
            <select onChange={(e) => setSelectedEmployeeId(e.target.value)} value={selectedEmployeeId || ''}>
              <option value="" disabled>Select an employee</option>
              {employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_id} - {emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="month-picker">
          <input type="month" onChange={(e) => {
            setMonth(e.target.value)
          }} />
          <button className="primary-button" onClick={() => {
            fetchAttendance()
          }}>
            Fetch
          </button>
        </div>
        <div className="rtable">
          {loading && <p>Loading attendance...</p>}
          {error && <p>Error: {error}</p>}
          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.logs.map((record, index) => (
                  <tr key={index}>
                    <td>{record.day}</td>
                    <td>{record.date}</td>
                    <td className="status-cell">
                      {employee?.employee_type === 'PRIVILEGED' ? (
                        <div className="status-buttons">
                          <button
                            onClick={() => handleStatusChange(record, "PRESENT")}
                            className={record.status === "PRESENT" ? "primary-button" : "secondary-button"}
                          >
                            PRESENT
                          </button>
                          <button
                            onClick={() => handleStatusChange(record, "LATE")}
                            className={record.status === "LATE" ? "warning-button" : "secondary-button"}
                          >
                            LATE
                          </button>
                          <button
                            onClick={() => handleStatusChange(record, "ABSENT")}
                            className={record.status === "ABSENT" ? "danger-button" : "secondary-button"}
                          >
                            ABSENT
                          </button>
                          <button
                            className={record.status === "ON_LEAVE" ? "warning-button" : "secondary-button"}
                          >
                            ON LEAVE
                          </button>
                        </div>
                      ) : (
                        <div className="status-buttons">
                          <button
                            className={record.status === "PRESENT" ? "primary-button" : "secondary-button"}
                          >
                            PRESENT
                          </button>
                          <button
                            className={record.status === "LATE" ? "warning-button" : "secondary-button"}
                          >
                            LATE
                          </button>
                          <button
                            className={record.status === "ABSENT" ? "danger-button" : "secondary-button"}
                          >
                            ABSENT
                          </button>
                          <button
                            className={record.status === "ON_LEAVE" ? "warning-button" : "secondary-button"}
                          >
                            ON LEAVE
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default Dash;
