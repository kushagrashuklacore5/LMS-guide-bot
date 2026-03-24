import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { io } from 'socket.io-client';

import CalendarHeader from "./CalendarHeader";
import CalendarSidebar from "./CalendarSidebar";
import EditEventModal from "./EditEventModal";
import QuotaLimitModal from "../components/QuotaLimitModal";
import { useNavigate } from 'react-router-dom';
import "./calendar.css";

const CalendarPage = ({ role }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("unstop_token");

  // Socket connection for real-time plan changes
  const [socket, setSocket] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      if (!token) {
        setError("Please login first");
        return;
      }

      const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";
      // Ensure we don't double the /api prefix
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      
      const res = await axios.get(`${baseUrl}/api/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map((e) => ({
        id: e.id || e._id,
        title: e.title,
        start: new Date(e.startDate),
        end: new Date(e.endDate),
        extendedProps: {
          createdByUser: e.createdByUser,
          createdByRole: e.createdByRole,
          publishFor: e.publishFor,
        },
        backgroundColor:
          e.createdByRole === "admin" ? "#2563eb" : "#16a34a",
      }));

      setEvents(formatted);
      setError(null);
      console.log(`✅ Fetched ${formatted.length} calendar events`);
    } catch (err) {
      console.error("Fetch events error", err);
      setError(err.response?.data?.message || "Failed to load events");
    }
  }, [token]);

  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaDetails, setQuotaDetails] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const navigate = useNavigate();

  const checkFeatureAccess = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";
      // Ensure we don't double the /api prefix
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      
      if (!token) {
        // unauthenticated users should not see calendar
        setQuotaDetails({ type: 'feature', resourceType: 'calendar', message: 'Please login to access the calendar.' });
        setShowQuotaModal(true);
        setIsCheckingAccess(false);
        return false;
      }

      console.log('🔍 Checking calendar feature access...');
      const res = await axios.get(`${baseUrl}/api/subscriptions/check-feature-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📊 Feature access response:', res.data);

      if (res.data && res.data.canAccessCalendar === false) {
        console.log('🚫 Calendar access denied - showing quota modal');
        const planMessage = res.data.currentPlan 
          ? `Your SuperAdmin is on the ${res.data.currentPlan.charAt(0).toUpperCase() + res.data.currentPlan.slice(1)} plan — ${res.data.currentPlan === 'free' ? 'upgrade' : 'contact support'} to access the calendar.`
          : res.data.message || 'Your account is on the Free plan — upgrade to access the calendar.';
        
        setQuotaDetails({ 
          type: 'feature', 
          resourceType: 'calendar', 
          message: planMessage,
          currentPlan: res.data.currentPlan,
          isExpired: res.data.isExpired
        });
        setShowQuotaModal(true);
        setIsCheckingAccess(false);
        return false;
      }

      console.log('✅ Calendar access granted');
      setIsCheckingAccess(false);
      return true;
    } catch (err) {
      console.error('❌ Feature-check failed:', err?.response?.data || err.message);
      // If API denies access or error occurs, show modal with available plan info
      const planData = err?.response?.data;
      const planMessage = planData?.currentPlan 
        ? `Your SuperAdmin is on the ${planData.currentPlan.charAt(0).toUpperCase() + planData.currentPlan.slice(1)} plan — ${planData.currentPlan === 'free' ? 'upgrade' : 'contact support'} to access the calendar.`
        : 'Unable to verify plan — please contact support.';
      
      setQuotaDetails({ 
        type: 'feature', 
        resourceType: 'calendar', 
        message: planMessage,
        currentPlan: planData?.currentPlan || 'unknown',
        isExpired: planData?.isExpired || false
      });
      setShowQuotaModal(true);
      setIsCheckingAccess(false);
      return false;
    }
  };

  useEffect(() => {
    // Initialize socket connection for real-time plan changes
    const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    // Listen for plan changes
    newSocket.on('planChanged', (planChangeData) => {
      console.log('🔄 [FRONTEND DEBUG] Plan change detected:', planChangeData);
      console.log('🔄 [FRONTEND DEBUG] Socket connected:', newSocket.connected);
      console.log('🔄 [FRONTEND DEBUG] Socket ID:', newSocket.id);
      
      // Force immediate re-check of feature access
      console.log('🔄 [FRONTEND DEBUG] Forcing immediate feature access re-check...');
      checkFeatureAccess().then(canAccess => {
        console.log('🔄 [FRONTEND DEBUG] Re-check result:', canAccess);
        if (!canAccess) {
          console.log('🚫 [FRONTEND DEBUG] Access revoked - showing quota modal');
          // Show quota modal if access was revoked
          setQuotaDetails({ 
            type: 'feature', 
            resourceType: 'calendar', 
            message: `Your SuperAdmin plan changed to ${planChangeData.planName}. Calendar access is now restricted.` 
          });
          setShowQuotaModal(true);
          // Clear any existing events when access is revoked
          setEvents([]);
        } else {
          console.log('✅ [FRONTEND DEBUG] Access granted - hiding quota modal');
          // Hide quota modal if access was granted
          setShowQuotaModal(false);
          // Refresh events if access was granted
          fetchEvents();
        }
      });
    });

    // Initial check and fetch
    (async () => {
      console.log('🚀 Starting calendar page - checking feature access...');
      const ok = await checkFeatureAccess();
      if (ok) {
        console.log('✅ Access granted - fetching events...');
        await fetchEvents();
      } else {
        console.log('🚫 Access denied - showing quota modal');
      }
    })();

    // Periodic re-check to ensure access is always current
    const periodicRecheck = setInterval(async () => {
      console.log('🔄 Periodic plan re-check...');
      const currentAccess = await checkFeatureAccess();
      if (!currentAccess && !showQuotaModal) {
        console.log('🔄 Access revoked - showing quota modal');
        setShowQuotaModal(true);
        setEvents([]);
      } else if (currentAccess && showQuotaModal) {
        console.log('🔄 Access granted - hiding quota modal');
        setShowQuotaModal(false);
        fetchEvents();
      }
    }, 10000); // Re-check every 10 seconds

    // Cleanup socket and interval on unmount
    return () => {
      clearInterval(periodicRecheck);
      newSocket.close();
    };
  }, [fetchEvents]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CalendarHeader />

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b", borderBottom: "1px solid #fca5a5" }}>
          ⚠️ {error}
        </div>
      )}

      <QuotaLimitModal isOpen={showQuotaModal} onClose={() => { setShowQuotaModal(false); navigate(role === 'admin' ? '/admin/dashboard' : '/'); }} quotaDetails={quotaDetails} />

      <div style={{ flex: 1, display: "flex" }}>
        <CalendarSidebar role={role} onEventCreated={fetchEvents} />

        <div style={{ flex: 1, padding: "12px" }}>
          {isCheckingAccess ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#374151' }}>
              <p style={{ fontSize: 18 }}>Checking calendar access...</p>
              <p style={{ marginTop: 8 }}>Please wait while we verify your subscription.</p>
            </div>
          ) : showQuotaModal ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#374151' }}>
              <p style={{ fontSize: 18 }}>Access to the calendar is restricted on your current plan.</p>
              <p style={{ marginTop: 8 }}>Please upgrade your plan to use this feature.</p>
            </div>
          ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={(info) => setSelectedEvent(info.event)}
            height="100%"
          />
          )}
        </div>
      </div>

      {/* EDIT / DELETE MODAL */}
      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          role={role}
          onClose={() => setSelectedEvent(null)}
          onRefresh={fetchEvents}
        />
      )}
    </div>
  );
};

export default CalendarPage;
