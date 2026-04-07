import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from "../auth/auth";
import QuotaLimitModal from './QuotaLimitModal';
import { useTranslation } from "../context/TranslationContext";
import AnnouncementBell from "./AnnouncementBell";
import LoginFooter from './LoginFooter';
import whiteLogo from '../../../White Logo.png';

const StudentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaDetails, setQuotaDetails] = useState(null);
  const { API, token } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleNavClick = async (e, item) => {
    // Allow dashboard to always work
    if (item.path === '/student/dashboard') {
      return;
    }

    // All other features are restricted on free plan
    const restrictedFeatures = {
      '/student/timetable': 'timetable',
      '/student/attendance': 'attendance',
      '/student/pay-fees': 'fee payments',
      '/student/results': 'results',
      '/student/calendar': 'calendar'
    };

    const featureName = restrictedFeatures[item.path];

    if (featureName) {
      e.preventDefault();
      try {
        if (!token) {
          setQuotaDetails({ 
            type: 'feature', 
            resourceType: featureName, 
            message: 'Please login to access this feature.' 
          });
          setShowQuotaModal(true);
          return;
        }

        const res = await fetch(`${API}/api/subscriptions/check-feature-access`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('feature check failed');
        const data = await res.json();

        // Check if current plan is 'free'
        if (data.currentPlan === 'free') {
          setQuotaDetails({ 
            type: 'feature', 
            resourceType: featureName, 
            message: 'Your account is on the Free plan — upgrade to access this feature.' 
          });
          setShowQuotaModal(true);
          return;
        }

        // If not free plan, allow navigation
        navigate(item.path);
      } catch (err) {
        console.error('Feature check error', err);
        setQuotaDetails({ 
          type: 'feature', 
          resourceType: featureName, 
          message: 'Your account is on the Free plan — upgrade to access this feature.' 
        });
        setShowQuotaModal(true);
      }
    }
  };

  // Language selector removed from Student portal

  const navItems = [
    {
      path: '/student/dashboard',
      nameKey: 'nav_dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/student/timetable', // ✅ ADD TIMETABLE
      nameKey: 'timetable_label',
      icon: <Calendar size={20} />,
    },
    {
      path: '/student/attendance',
      nameKey: 'attendance',
      icon: <FileText size={20} />,
    },
    {
      path: '/student/pay-fees',
      nameKey: 'pay_fees',
      icon: <Award size={20} />, // Use Award or another icon
    },
    {
      path: '/student/results',
      nameKey: 'results',
      icon: <FileText size={20} />,
    },
    {
      path: '/student/calendar',
      nameKey: 'nav_calendar',
      icon: <Calendar size={20} />,
    },
  ];

  const currentPage =
    navItems.find(item => item.path === location.pathname)?.nameKey 
      ? t(navItems.find(item => item.path === location.pathname)?.nameKey)
      : t('nav_dashboard');

  return (
    <div className="h-screen bg-background overflow-hidden">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`
        fixed top-0 left-0 h-full z-40
        hidden lg:block transition-all duration-300
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        bg-gradient-to-b from-purple-700 via-purple-600 to-purple-500
        text-white shadow-xl
      `}
      >
        <div className="flex flex-col h-full">

          {/* ================= SIDEBAR HEADER (LOGO) ================= */}
          <div className="h-24 sm:h-28 border-b border-white/10 flex items-center justify-center">
            {!sidebarCollapsed && (
              <img
                src={whiteLogo}
                alt="Core5 Academy"
                className="max-h-full w-auto object-contain"
              />
            )}
            {sidebarCollapsed && (
              <img
                src={whiteLogo}
                alt="Core5 Academy"
                className="h-16 w-auto object-contain"
              />
            )}
          </div>

          {/* ================= USER INFO ================= */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-white">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-white/70 text-xs truncate">
                    {user?.email || 'student@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= NAVIGATION ================= */}
          <nav className="flex-1 min-h-0 p-4 overflow-y-auto hide-scrollbar">
            <div className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`
                      flex items-center rounded-xl px-3 py-3 transition-all
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-white/70'}`}>
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium">{t(item.nameKey)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ================= SIDEBAR FOOTER ================= */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                w-full flex items-center justify-center p-3 rounded-xl
                bg-white/10 text-white hover:bg-white/20 transition
                ${sidebarCollapsed ? '' : 'justify-between'}
              `}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <span className="text-sm font-medium">{t('nav_collapse')}</span>
                  <ChevronLeft size={18} />
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`
                mt-3 w-full flex items-center p-3 rounded-xl
                bg-red-500/20 text-white hover:bg-red-500/30 transition
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && (
                <span className="ml-3 font-medium">{t('nav_logout')}</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className={`
        transition-all duration-300 flex-1 overflow-hidden
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        h-screen flex flex-col
      `}
      >

        {/* ================= TOP BAR ================= */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRight size={24} className="text-text" />
                </button>
                <h1 className="text-xl font-bold text-text">{currentPage}</h1>
              </div>

              <div className="flex items-center space-x-3">
                {/* Language selector removed for Student portal */}
                
                {/* Announcement Bell */}
                <AnnouncementBell />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-text"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline font-medium text-sm">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MOBILE SIDEBAR ================= */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-700 to-purple-500 text-white shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Student Portal</h1>
                    <p className="text-white/70 text-sm">Welcome back</p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <div className="space-y-1">
                  {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, item); }}
                        className={`
                          flex items-center space-x-3 rounded-xl px-3 py-3 transition
                          ${isActive
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10'
                          }
                        `}
                      >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* ================= CONTENT AREA ================= */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>

      </main>
      
      {/* Footer */}
      <LoginFooter />

      {/* ================= QUOTA MODAL (OVERLAY) ================= */}
      <QuotaLimitModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} quotaDetails={quotaDetails} />
    </div>
  );
};

export default StudentLayout;
