import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  Building2,
  Users,
  Plus,
  UserPlus
} from "lucide-react";
import { useAuth } from "../auth/auth";
import AnnouncementBell from "./AnnouncementBell";
import core5Logo from '../../../core5 logo with hat.png';

const SuperAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timer, setTimer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [planName, setPlanName] = useState('Free');
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

  // Fetch subscription data on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`${API_BASE}/subscriptions/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (data.success) {
          setSubscription(data.subscription);
          setPlanName(data.subscription.planName);
          
          // Set initial timer based on subscription status and remaining time
          const remainingSeconds = data.subscription.remainingSeconds;
          const isActive = data.subscription.status === 'active';
          
          if (isActive && remainingSeconds > 0) {
            // Active subscription with time remaining
            setTimer(remainingSeconds);
            setShowPopup(false);
          } else if (isActive && remainingSeconds <= 0) {
            // Active subscription but time expired (shouldn't happen but handle it)
            setShowPopup(true);
            setTimer(0);
          } else {
            // Expired subscription
            setShowPopup(true);
            setTimer(0);
          }
        } else {
          console.error('Failed to fetch subscription:', data.message);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Calculate time units
  const days = Math.floor(timer / 86400);
  const hours = Math.floor((timer % 86400) / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  // Timer countdown effect
  useEffect(() => {
    if (loading || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          // Timer reached zero, show popup and refresh subscription data
          setShowPopup(true);
          // Refresh subscription data to get updated status
          fetchSubscription();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, timer]);

  // Helper function to refresh subscription data
  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data.success) {
        setSubscription(data.subscription);
        setPlanName(data.subscription.planName);
        
        const remainingSeconds = data.subscription.remainingSeconds;
        const isActive = data.subscription.status === 'active';
        
        if (isActive && remainingSeconds > 0) {
          setTimer(remainingSeconds);
          setShowPopup(false);
        } else {
          setTimer(0);
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription and downgrade to Free?')) return;
    try {
      const response = await fetch(`${API_BASE}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${text || 'no body'}`);
      const data = text ? JSON.parse(text) : null;
      if (data && data.success) {
        // update local state and timer
        setSubscription(data.subscription);
        setPlanName(data.subscription.planName || 'Free');
        const remaining = data.subscription.remainingSeconds ?? Math.max(0, Math.floor((new Date(data.subscription.expiryDate) - new Date()) / 1000));
        setTimer(Math.max(0, remaining));
        setShowPopup(false);
        // clear localStorage subscription flags
        localStorage.setItem('superadminPlanName', data.subscription.planName || 'Free');
        localStorage.setItem('superadminSubscriptionStatus', data.subscription.status || 'active');
        alert('Subscription cancelled — you have been moved to the Free plan.');
      } else {
        throw new Error((data && data.message) || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Cancel subscription error:', err);
      alert('Failed to cancel subscription: ' + (err.message || err));
    }
  };

  /* ================= SIDEBAR ITEMS ================= */
  const navItems = [
    { path: "/superadmin/dashboard", name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: "/superadmin/dashboard?tab=universities", name: 'Institutes', icon: <Building2 size={20} /> },
    { path: "/superadmin/dashboard?tab=createUniversity", name: 'Add Institute', icon: <Plus size={20} /> },
    { path: "/superadmin/dashboard?tab=createUser", name: 'Add Staff', icon: <UserPlus size={20} /> },
    { path: "/superadmin/dashboard?tab=users", name: 'All Staff', icon: <Users size={20} /> },
    { path: "/superadmin/subscription", name: 'Subscription', icon: <Star size={20} /> },
  ];

  const currentPage =
    navItems.find((item) => {
      if (item.path.includes('?')) {
        const basePath = item.path.split('?')[0];
        const tabParam = item.path.split('?')[1].split('=')[1];
        return location.pathname === basePath && location.search.includes(tabParam);
      }
      return location.pathname === item.path && !location.search.includes('tab=');
    })?.name || 'Overview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg z-40 hidden lg:block transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="h-24 sm:h-28 border-b border-white/10 flex items-center justify-center">
            {!sidebarCollapsed && (
              <img
                src={core5Logo}
                alt="Core5 Academy"
                className="max-h-full w-auto object-contain"
              />
            )}
            {sidebarCollapsed && (
              <img
                src={core5Logo}
                alt="Core5 Academy"
                className="h-12 w-auto object-contain"
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto hide-scrollbar">
            {navItems.map((item) => {
              let isActive = false;
              if (item.path.includes('?')) {
                const basePath = item.path.split('?')[0];
                const tabParam = item.path.split('?')[1].split('=')[1];
                isActive = location.pathname === basePath && location.search.includes(tabParam);
              } else {
                isActive = location.pathname === item.path && !location.search.includes('tab=');
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center rounded-lg px-3 py-3 transition-colors
                    ${isActive ? "bg-white/10 text-white border-l-4 border-blue-500" : "hover:bg-white/5 text-gray-300 hover:text-white"}
                    ${sidebarCollapsed ? "justify-center" : ""}
                  `}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center rounded-lg p-3 hover:bg-white/10 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE MENU ================= */}
      <div className={`lg:hidden fixed inset-0 bg-black/50 z-50 ${mobileMenuOpen ? "block" : "hidden"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="h-24 sm:h-28 border-b border-white/10 flex items-center justify-between px-4">
            <img
              src={core5Logo}
              alt="Core5 Academy"
              className="max-h-full w-auto object-contain"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              let isActive = false;
              if (item.path.includes('?')) {
                const basePath = item.path.split('?')[0];
                const tabParam = item.path.split('?')[1].split('=')[1];
                isActive = location.pathname === basePath && location.search.includes(tabParam);
              } else {
                isActive = location.pathname === item.path && !location.search.includes('tab=');
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center rounded-lg px-3 py-3 transition-colors
                    ${isActive ? "bg-white/10 text-white border-l-4 border-blue-500" : "hover:bg-white/5 text-gray-300 hover:text-white"}
                  `}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center rounded-lg p-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 transition-colors"
            >
              <LogOut size={20} />
              <span className="ml-3 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className={`lg:ml-${sidebarCollapsed ? "20" : "64"} transition-all duration-300`}>
        {/* Desktop Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 hidden lg:block">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">{currentPage}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Subscription Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors duration-300 ${
                timer === 0 
                  ? 'bg-red-100 border-red-300' 
                  : 'bg-blue-100 border-blue-300'
              }`}>
                <Star className={timer === 0 ? 'text-red-600' : 'text-blue-600'} size={16} />
                {timer === 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-red-700">PLAN EXPIRED</div>
                      <div className="text-xs font-bold text-red-800">Upgrade to continue</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">PLAN</div>
                      <div className="text-sm font-bold text-blue-800">{planName}</div>
                    </div>
                    <span className="text-blue-400 mx-2">•</span>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">DAYS</div>
                      <div className="text-sm font-bold text-blue-800">{days.toString().padStart(2, '0')}</div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">:</span>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">HRS</div>
                      <div className="text-sm font-bold text-blue-800">{hours.toString().padStart(2, '0')}</div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">:</span>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">MIN</div>
                      <div className="text-sm font-bold text-blue-800">{minutes.toString().padStart(2, '0')}</div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">:</span>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">SEC</div>
                      <div className="text-sm font-bold text-blue-800">{seconds.toString().padStart(2, '0')}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">{currentPage}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Subscription Timer Mobile */}
              <div className={`flex items-center gap-1 px-2 py-1 border rounded-lg transition-colors duration-300 ${
                timer === 0 
                  ? 'bg-red-100 border-red-300' 
                  : 'bg-blue-100 border-blue-300'
              }`}>
                <Star className={timer === 0 ? 'text-red-600' : 'text-blue-600'} size={12} />
                {timer === 0 ? (
                  <div className="text-center">
                    <div className="text-xs font-bold text-red-700">EXPIRED</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">D</div>
                      <div className="text-xs font-bold text-blue-800">{days.toString().padStart(2, '0')}</div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">:</span>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-700">H</div>
                      <div className="text-xs font-bold text-blue-800">{hours.toString().padStart(2, '0')}</div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Subscription Expired Popup */}
      {showPopup && timer === 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-red-600" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscription Expired!
              </h2>
              
              <p className="text-gray-600 mb-2">
                Your {planName} plan has expired.
              </p>
              
              <p className="text-gray-600 mb-6">
                To continue using the superadmin portal, please upgrade to a subscription plan.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    navigate("/superadmin/subscription");
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Upgrade Now
                </button>
                
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLayout;
