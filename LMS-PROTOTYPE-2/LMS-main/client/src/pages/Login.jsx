import React, { useState } from 'react';
import { useAuth } from '../auth/auth';
import { useTranslation } from '../context/TranslationContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, Eye, EyeOff, Chrome, Twitter, Gamepad2 } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import TermsConditionsModal from '../components/TermsConditionsModal';
import videoBg from '../assets/login-bg.mp4';
import core5Logo from '../../../core5 logo with hat.png';

/* ============================================================
   LOGIN COMPONENT
   ============================================================ */

const Login = () => {
  const { loginUser, API: contextAPI } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Ensure API URL is always set
  const API = contextAPI || '/api';

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /* ================= LOGIN LOGIC ================= */
  const performLogin = async (email, password) => {
    setIsLoading(true);
    try {
      console.log(`🔐 Logging in to: ${API} with email: ${email}`);

      const response = await axios.post(`${API}/auth/login`, { email, password });
      console.log('✅ Login response:', response.data);
      
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response received from server');
      }

      // Store auth data
      loginUser(token, user);
      console.log('✅ User logged in successfully:', user);
      toast.success('Login successful! Redirecting...');

      // Navigate based on role
      const role = user.role || 'student';
      console.log(`🧭 Navigating for role: ${role}`);
      
      switch (role) {
        case 'superadmin':
          navigate('/superadmin/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'mentor':
        case 'teacher':
          navigate('/mentor/dashboard');
          break;
        case 'accountant':
          navigate('/accountant/dashboard');
          break;
        case 'storekeeper':
          navigate('/storekeeper/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/dashboard');
          break;
        case 'student':
        default:
          navigate('/student/dashboard');
          break;
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
    performLogin(email, password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(formData.email, formData.password);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">

      {/* ================= VIDEO BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        >
          <source src={videoBg} type="video/mp4" />
        </video>
      </div>

      {/* ================= DARK OVERLAY ================= */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-start -pt-40 pb-12 sm:px-6 lg:px-8">

        {/* Language selector and Terms & Conditions top-right */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          <TermsConditionsModal />
          <LanguageSelector />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">

          <div className="text-center">
            <div className="flex justify-center">
              <img
                src={core5Logo}
                alt="Core5 Academy"
                className="h-[28rem] sm:h-[32rem] w-auto object-contain drop-shadow-lg mx-auto mb-0 -translate-y-12"
              />
            </div>
          </div>

          <div className="-mt-32 sm:-mt-40 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white/10 backdrop-blur-xl py-6 px-3 shadow-2xl sm:rounded-2xl sm:px-8 border border-white/10">

              {/* ================= FORM ================= */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-white/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('email_placeholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-white/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder={t('password_placeholder')}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 text-white border-white/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-white/60 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:from-primary to-secondary hover:from-secondary to-primary transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white border-t-transparent"></div>
                      <span className="ml-2">{t('logging_in')}</span>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      <span>{t('sign_in_button')}</span>
                    </span>
                  )}
                </button>
              </form>

            {/* ================= DEMO CREDENTIALS ================= */}
            <div className="mt-6 p-4 bg-black/20 rounded-lg">
              <p className="text-white/80 text-sm font-semibold mb-3">{t('demo_accounts')}</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('superadmin@core5.com', 'superadmin123')}
                  className="w-full text-left p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Superadmin</p>
                      <p className="text-white/60 text-xs">superadmin@core5.com / superadmin123</p>
                    </div>
                    <span className="text-red-400 text-xs group-hover:text-red-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('admin@gmail.com', '12345678')}
                  className="w-full text-left p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t('admin_role')}</p>
                      <p className="text-white/60 text-xs">admin@gmail.com / 12345678</p>
                    </div>
                    <span className="text-blue-400 text-xs group-hover:text-blue-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('mentor@gmail.com', '12345678')}
                  className="w-full text-left p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t('mentor_role')}</p>
                      <p className="text-white/60 text-xs">mentor@gmail.com / 12345678</p>
                    </div>
                    <span className="text-green-400 text-xs group-hover:text-green-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('student@gmail.com', '12345678')}
                  className="w-full text-left p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t('student_role')}</p>
                      <p className="text-white/60 text-xs">student@gmail.com / 12345678</p>
                    </div>
                    <span className="text-purple-400 text-xs group-hover:text-purple-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('accountant@demo.com', '12345678')}
                  className="w-full text-left p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t('accountant_role')}</p>
                      <p className="text-white/60 text-xs">accountant@demo.com / 12345678</p>
                    </div>
                    <span className="text-purple-400 text-xs group-hover:text-purple-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('storekeeper@demo.com', '12345678')}
                  className="w-full text-left p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t('storekeeper_role')}</p>
                      <p className="text-white/60 text-xs">storekeeper@demo.com / 12345678</p>
                    </div>
                    <span className="text-orange-400 text-xs group-hover:text-orange-300">{t('click_to_login')}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('vendor@test.com', '12345678')}
                  className="w-full text-left p-2 bg-teal-600/20 hover:bg-teal-600/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Vendor</p>
                      <p className="text-white/60 text-xs">vendor@test.com / 12345678</p>
                    </div>
                    <span className="text-teal-400 text-xs group-hover:text-teal-300">{t('click_to_login')}</span>
                  </div>
                </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
