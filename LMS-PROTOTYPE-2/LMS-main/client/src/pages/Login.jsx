import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/auth';
import { useTranslation } from '../context/TranslationContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, Eye, EyeOff, Chrome, Twitter, Gamepad2, ArrowLeft, RefreshCw } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import TermsConditionsModal from '../components/TermsConditionsModal';
import LoginFooter from '../components/LoginFooter';
import OTPInput from '../components/OTPInput';
import videoBg from '../assets/login-bg.mp4';
import whiteLogo from '../../../White Logo.png';
import passwordResetService from '../services/passwordResetService';

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

  // Password reset states
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [resetData, setResetData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rate limiting states
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isPasswordReset) {
      setResetData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password reset handlers
  const startPasswordReset = () => {
    setIsPasswordReset(true);
    setResetStep(1);
    setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  };

  const cancelPasswordReset = () => {
    setIsPasswordReset(false);
    setResetStep(1);
    setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setCooldown(0);
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await passwordResetService.sendOTP(resetData.email);
      toast.success('OTP sent to your email');
      setResetStep(2);
      startCooldown();
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await passwordResetService.verifyOTP(resetData.email, resetData.otp);
      toast.success('OTP verified successfully');
      setResetStep(3);
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await passwordResetService.resetPassword(
        resetData.email,
        resetData.newPassword,
        resetData.confirmPassword
      );
      toast.success('Password reset successfully! Please login with your new password.');
      cancelPasswordReset();
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Cooldown timer
  const startCooldown = () => {
    setCooldown(60);
  };

  // Rate limiting timer effect
  useEffect(() => {
    let timer;
    if (isBlocked && blockTimeRemaining > 0) {
      timer = setTimeout(() => {
        setBlockTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isBlocked && blockTimeRemaining === 0) {
      setIsBlocked(false);
      setBlockTimeRemaining(0);
      setAttemptInfo(null);
      toast.info('You can now try logging in again');
    }
    
    return () => clearTimeout(timer);
  }, [isBlocked, blockTimeRemaining]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /* ================= LOGIN LOGIC ================= */
  const performLogin = async (email, password) => {
    setIsLoading(true);
    try {
      console.log(`🔐 Logging in to: ${API} with email: ${email}`);

      const response = await axios.post(`${API}/auth/login`, { email, password });
      console.log('✅ Login response:', response.data);
      
      const { token, user, attemptInfo: responseAttemptInfo } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response received from server');
      }

      // Reset rate limiting state on successful login
      setIsBlocked(false);
      setBlockTimeRemaining(0);
      setAttemptInfo(null);
      setLoginAttempts(0);

      // Store auth data
      loginUser(token, user);
      console.log('✅ User logged in successfully:', user);
      toast.success('Login successful! Redirecting...');

      // Navigate based on role
      const role = user.role || 'student';
      console.log(`🧭 Navigating for role: ${role}`);
      
      // Special redirect for portal@core5.co.in
      if (email === 'portal@core5.co.in') {
        console.log('🚪 Redirecting portal@core5.co.in to internal admin portal');
        navigate('/internal-admin-portal');
        return;
      }
      
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
      
      // Handle rate limiting responses
      if (err.response?.status === 429) {
        const { blocked, remainingTime, attemptInfo: responseAttemptInfo } = err.response.data;
        
        if (blocked) {
          setIsBlocked(true);
          setBlockTimeRemaining(remainingTime);
          toast.error(`Too many login attempts. Try again in ${remainingTime} seconds`);
        }
        
        if (responseAttemptInfo) {
          setAttemptInfo(responseAttemptInfo);
          setLoginAttempts(responseAttemptInfo.ipAttempts);
        }
      } else {
        // Handle regular login errors
        const errorMsg = err.response?.data?.message || err.message || 'Login failed';
        toast.error(errorMsg);
        
        // Update attempt info if available
        if (err.response?.data?.attemptInfo) {
          setAttemptInfo(err.response.data.attemptInfo);
          setLoginAttempts(err.response.data.attemptInfo.ipAttempts);
        }
      }
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
    <div className="relative min-h-screen overflow-hidden bg-black hide-scrollbar">

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
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-start -pt-40 pb-20 sm:px-6 lg:px-8">

        {/* Language selector top-right */}
        <div className="absolute top-6 right-6 z-30">
          <LanguageSelector />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">

          <div className="text-center">
            <div className="flex justify-center">
              <img
                src={whiteLogo}
                alt="Core5 Academy"
                className="h-[28rem] sm:h-[32rem] w-auto object-contain drop-shadow-lg mx-auto mb-0 -translate-y-12"
              />
            </div>
          </div>

          <div className="-mt-32 sm:-mt-40 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white/10 backdrop-blur-xl py-6 px-3 shadow-2xl sm:rounded-2xl sm:px-8 border border-white/10">

              {/* ================= FORM ================= */}
              {/* Login Form */}
              {!isPasswordReset ? (
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
                    disabled={isLoading || isBlocked}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:from-primary to-secondary hover:from-secondary to-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white border-t-transparent"></div>
                        <span className="ml-2">{t('logging_in')}</span>
                      </div>
                    ) : isBlocked ? (
                      <span className="flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        <span>Blocked ({blockTimeRemaining}s)</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        <span>{t('sign_in_button')}</span>
                      </span>
                    )}
                  </button>

                  {/* Rate Limiting Info */}
                  {isBlocked && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
                      <p className="text-red-200 text-sm font-medium">
                        Too many login attempts
                      </p>
                      <p className="text-red-300 text-xs mt-1">
                        Try again in {blockTimeRemaining} seconds
                      </p>
                    </div>
                  )}

                  {attemptInfo && !isBlocked && attemptInfo.remainingAttempts < 5 && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                      <p className="text-yellow-200 text-sm font-medium">
                        {attemptInfo.remainingAttempts} attempts remaining
                      </p>
                      <p className="text-yellow-300 text-xs mt-1">
                        Too many failed attempts will temporarily block login
                      </p>
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={startPasswordReset}
                      className="text-white/80 hover:text-white text-sm underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              ) : (
                /* Password Reset Form */
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={cancelPasswordReset}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-white font-semibold">Reset Password</h3>
                    <div className="w-5"></div>
                  </div>

                  {/* Step 1: Email Input */}
                  {resetStep === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-white/60" />
                        <input
                          type="email"
                          name="email"
                          value={resetData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:from-primary to-secondary hover:from-secondary to-primary transition-all duration-300 transform hover:scale-105"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white border-t-transparent"></div>
                            <span className="ml-2">Sending...</span>
                          </div>
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </form>
                  )}

                  {/* Step 2: OTP Verification */}
                  {resetStep === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-4 text-center">
                          Enter the 6-digit code sent to your email
                        </label>
                        <OTPInput
                          value={resetData.otp}
                          onChange={(value) => setResetData(prev => ({ ...prev, otp: value }))}
                          disabled={isLoading}
                          length={6}
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isLoading || resetData.otp.length !== 6}
                          className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:from-primary to-secondary hover:from-secondary to-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white border-t-transparent"></div>
                              <span className="ml-2">Verifying...</span>
                            </div>
                          ) : (
                            'Verify OTP'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isLoading || cooldown > 0}
                          className="flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cooldown > 0 ? (
                            <span className="flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              {cooldown}s
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resend
                            </span>
                          )}
                        </button>
                      </div>

                      {resetData.otp.length > 0 && resetData.otp.length < 6 && (
                        <p className="text-center text-white/60 text-sm">
                          Please enter all 6 digits
                        </p>
                      )}
                    </form>
                  )}

              {/* Step 3: Reset Password */}
              {resetStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-white/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={resetData.newPassword}
                      onChange={handleChange}
                      required
                      placeholder="New Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3.5 text-white/60 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-white/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm New Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:from-primary to-secondary hover:from-secondary to-primary transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white border-t-transparent"></div>
                        <span className="ml-2">Resetting...</span>
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

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

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default Login;
