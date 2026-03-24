import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserPlus,
  School,
  Database
} from "lucide-react";
import { useAuth } from "../auth/auth";
import QuotaLimitModal from './QuotaLimitModal';
import { useSimpleTranslation } from "../context/SimpleTranslationContext";
import { useTranslation } from "../context/TranslationContext";
import AnnouncementBell from "./AnnouncementBell";
import core5Logo from '../../../core5 logo with hat.png';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { currentLanguage, supportedLanguages, changeLanguage } = useSimpleTranslation();
  const { t } = useTranslation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaDetails, setQuotaDetails] = useState(null);

  const { API, token } = useAuth();

  const handleNavClick = async (e, item) => {
    // Intercept database export & calendar navigation to check feature access
    const isDatabaseExport = item.path === '/admin/database-export';
    const isCalendar = item.path && item.path.includes('/calendar');

    if (isDatabaseExport || isCalendar) {
      e.preventDefault();
      try {
        if (!token) {
          setQuotaDetails({ type: 'feature', resourceType: isCalendar ? 'calendar' : 'database export', message: 'Please login to access this feature.' });
          setShowQuotaModal(true);
          return;
        }

        const res = await fetch(`${API}/subscriptions/check-feature-access`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Feature check failed');
        }

        const data = await res.json();
        if ((isDatabaseExport && data && data.canExportData === false) || (isCalendar && data && data.canAccessCalendar === false)) {
          setQuotaDetails({ type: 'feature', resourceType: isCalendar ? 'calendar' : 'database export', message: 'Your account is on the Free plan — upgrade to access this feature.' });
          setShowQuotaModal(true);
          return;
        }

        // allowed
        navigate(item.path);
      } catch (err) {
        console.error('Feature check error', err);
        setQuotaDetails({ type: 'feature', resourceType: isCalendar ? 'calendar' : 'database export', message: 'Your account is on the Free plan — upgrade to access this feature.' });
        setShowQuotaModal(true);
      }
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  /* ================= SIDEBAR ITEMS ================= */
  const navItems = [
    { path: "/admin/dashboard", nameKey: 'nav_dashboard', icon: <LayoutDashboard size={20} /> },
    { path: "/admin/users", nameKey: 'nav_users', icon: <Users size={20} /> },
    { path: "/admin/database-export", nameKey: 'nav_database_export', icon: <Database size={20} /> },
    { path: "/admin/fee-structure", nameKey: 'nav_fee_structure', icon: <BarChart3 size={20} /> },
    { path: "/admin/calendar", nameKey: 'nav_calendar', icon: <Calendar size={20} /> },

    /* ===== BELOW CALENDAR ===== */
    { path: "/admin/add-student", nameKey: 'nav_add_student', icon: <UserPlus size={20} /> },
    { path: "/admin/add-teacher", nameKey: 'nav_add_teacher', icon: <UserPlus size={20} /> },

    /* ===== CLASSROOMS (JUST BELOW ADD TEACHER) ===== */
    { path: "/admin/classrooms", nameKey: 'nav_classrooms', icon: <School size={20} /> },
  ];

  const currentPage =
    navItems.find((item) => item.path === location.pathname)?.nameKey
      ? t(navItems.find((item) => item.path === location.pathname)?.nameKey)
      : t('nav_dashboard');

  return (
    <div className="min-h-screen bg-background">
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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center rounded-lg px-3 py-3 transition-colors
                    ${isActive ? "bg-white/10 text-white border-l-4 border-blue-500" : "hover:bg-white/5 text-gray-300 hover:text-white"}
                    ${sidebarCollapsed ? "justify-center" : ""}
                  `}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{t(item.nameKey)}</span>}
                </Link>
              );
            })}
            <QuotaLimitModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} quotaDetails={quotaDetails} />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
            >
              {sidebarCollapsed ? <ChevronRight /> : <>{t('nav_collapse')} <ChevronLeft /></>}
            </button>

            <button
              onClick={handleLogout}
              className={`mt-3 w-full flex items-center p-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && <span className="ml-3">{t('nav_logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`transition-all ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 bg-white border-b z-30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <ChevronRight />
              </button>
              <h1 className="text-xl font-bold">{currentPage}</h1>
            </div>

            {/* Announcement Bell */}
            <AnnouncementBell />
          </div>
        </header>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden">
            <div className="w-64 bg-white h-full p-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => { setMobileMenuOpen(false); handleNavClick(e, item); }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                >
                  {item.icon}
                  <span>{t(item.nameKey)}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-6 w-full flex justify-center gap-2 p-3 bg-danger/10 text-danger rounded-lg"
              >
                <LogOut size={18} />
                {t('nav_logout')}
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
