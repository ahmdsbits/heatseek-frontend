import { useState, useEffect } from "react";
import "../styles/LeaveRequests.css";
import Card from "../components/Card/Card";
import Modal from "../components/Modal/Modal";
import { useAuth } from "../auth/useAuth.js";

function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, employee } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  const fetchLeaveRequests = async () => {
    if (token && employee) {
      try {
        setLoading(true);
        let url = `https://heatseek-api.onrender.com/api/leave-requests/?ordering=-date`;
        if (employee.employee_type !== "PRIVILEGED") {
          url = `https://heatseek-api.onrender.com/api/leave-requests/?employee_id=${employee.employee_id}&ordering=-date`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch leave requests");
        }
        const data = await response.json();
        setLeaveRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [token, employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("https://heatseek-api.onrender.com/api/leave-requests/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          date: date,
          message: message,
          status: "PENDING",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to submit leave request");
      }

      // Refresh the list after submitting
      fetchLeaveRequests();
      setDate("");
      setMessage("");
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setCurrentAction(action);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setCurrentAction(null);
    setResponseMessage("");
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    if (currentAction === "approve") {
      handleApprove(selectedRequest.uuid, responseMessage);
    } else if (currentAction === "deny") {
      handleDeny(selectedRequest.uuid, responseMessage);
    }
    closeModal();
  };

  const handleApprove = async (uuid, response_message) => {
    try {
      const response = await fetch(
        `https://heatseek-api.onrender.com/api/leave-requests/${uuid}/approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ response_message }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve leave request");
      }
      setLeaveRequests((prevRequests) => ({
        ...prevRequests,
        results: prevRequests.results.map((req) =>
          req.uuid === uuid
            ? { ...req, status: "APPROVED", response_message }
            : req
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeny = async (uuid, response_message) => {
    try {
      const response = await fetch(
        `https://heatseek-api.onrender.com/api/leave-requests/${uuid}/deny/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ response_message }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to deny leave request");
      }
      setLeaveRequests((prevRequests) => ({
        ...prevRequests,
        results: prevRequests.results.map((req) =>
          req.uuid === uuid ? { ...req, status: "DENIED", response_message } : req
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "var(--cream-yellow)";
      case "APPROVED":
        return "var(--neon-green)";
      case "DENIED":
        return "var(--pastel-red)";
      default:
        return "var(--fg)";
    }
  };

  return (
    <div className="leave-requests-page">
      <h1>Leave Requests</h1>
      <form onSubmit={handleSubmit} className="leave-request-form">
        <div className="input-wrapper message-input">
          <textarea
            placeholder="Optional message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="input-wrapper date-input">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary-button submit-button">
          Submit Request
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <h2>{employee?.employee_type === 'PRIVILEGED' ? "All Requests" : "Your Requests"}</h2>
      {loading && <p>Loading requests...</p>}
      <div className="leave-requests-list">
        {!loading &&
          !error &&
          leaveRequests.results &&
          leaveRequests.results.map((request) => (
            <Card key={request.uuid} title={request.date}>
              {employee?.employee_type === "PRIVILEGED" &&
                request.employee.employee_id !== employee.employee_id &&
                request.status === "PENDING" && (
                  <div className="actions">
                    <button
                      className="primary-button"
                      onClick={() => openModal(request, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="primary-button danger-button"
                      onClick={() => openModal(request, "deny")}
                    >
                      Deny
                    </button>
                  </div>
                )}
              <div className="leave-request-card-content">
                <div className="leave-request-card-details">
                  <h3 className="employee-name">
                    {request.employee.first_name} {request.employee.last_name}
                  </h3>
                  <p className="employee-id">
                    {request.employee.employee_id}
                  </p>
                  <p className="message"><span className="normal">Message:</span> {request.message || "No message"}</p>
                  <p className="response-message">
                    <span className="normal">Response:</span> {request.response_message || "No response message"}
                  </p>
                </div>
                <div className="leave-request-card-footer">
                  <p
                    className="status"
                    style={{ color: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </p>
                </div>
              </div>
            </Card>
          ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Add a response message"
      >
        <textarea
          placeholder="Optional response message"
          value={responseMessage}
          onChange={(e) => setResponseMessage(e.target.value)}
          style={{ width: "100%", minHeight: "100px" }}
        ></textarea>
      </Modal>
    </div>
  );
}

export default LeaveRequests;
