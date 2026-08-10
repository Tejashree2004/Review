import { useState } from "react";
import {
  FaArrowLeft,
  FaHeart,
  FaMapMarkerAlt,
  FaCommentAlt,
  FaTrash,
  FaCheck,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import "../styles/Notifications.css";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "favorite",
      title: "Added to Favorites",
      message: "ABC Restaurant was added to your favorites.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      type: "place",
      title: "Place Update",
      message: "XYZ Cafe has updated its information.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      type: "review",
      title: "Review Activity",
      message: "There is new activity related to one of your reviews.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  // Delete single notification
  const handleDelete = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    if (type === "favorite") {
      return <FaHeart />;
    }

    if (type === "place") {
      return <FaMapMarkerAlt />;
    }

    return <FaCommentAlt />;
  };

  return (
    <MainLayout>

      {/* =========================
          Header
      ========================= */}

      <div className="notifications-header">

        <div className="notifications-title-section">

          <button
            className="notification-back-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your REVIO activity
            </p>
          </div>

        </div>

        {/* Mark All Read */}

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            className="mark-read-btn"
            onClick={handleMarkAllRead}
          >
            <FaCheck />
            <span>Mark all as read</span>
          </button>
        )}

      </div>


      {/* =========================
          Notification Count
      ========================= */}

      {notifications.length > 0 && (
        <div className="notification-summary">

          <span>
            {notifications.length}{" "}
            {notifications.length === 1
              ? "Notification"
              : "Notifications"}
          </span>

          {unreadCount > 0 && (
            <span className="unread-count">
              {unreadCount} Unread
            </span>
          )}

        </div>
      )}


      {/* =========================
          Empty State
      ========================= */}

      {notifications.length === 0 ? (

        <div className="empty-notifications">

          <div className="empty-notification-icon">
            <FaCheck />
          </div>

          <h2>You're all caught up!</h2>

          <p>
            You don't have any notifications right now.
          </p>

        </div>

      ) : (

        <div className="notifications-list">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`notification-card ${
                notification.unread
                  ? "notification-unread"
                  : ""
              }`}
            >

              {/* Icon */}

              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>


              {/* Content */}

              <div className="notification-content">

                <div className="notification-title-row">

                  <h3>
                    {notification.title}
                  </h3>

                  {notification.unread && (
                    <span className="unread-dot"></span>
                  )}

                </div>

                <p>
                  {notification.message}
                </p>

                <span className="notification-time">
                  {notification.time}
                </span>

              </div>


              {/* Delete */}

              <button
                className="delete-notification-btn"
                onClick={() =>
                  handleDelete(notification.id)
                }
                title="Delete notification"
              >
                <FaTrash />
              </button>

            </div>

          ))}

        </div>

      )}


      {/* =========================
          Clear All
      ========================= */}

      {notifications.length > 0 && (

        <div className="clear-notifications-wrapper">

          <button
            className="clear-notifications-btn"
            onClick={handleClearAll}
          >
            <FaTrash />
            <span>Clear All Notifications</span>
          </button>

        </div>

      )}

    </MainLayout>
  );
}

export default Notifications;