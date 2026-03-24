import { useState, useEffect } from "react";
import { useAuth } from "../../auth/auth";
import { useTranslation } from "../../context/TranslationContext";
import { toast } from "react-toastify";
import { Building2, MapPin, User, Mail, Key, Copy } from "lucide-react";

const CreateUniversityForm = ({ onSuccess }) => {
  const { API, token } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    universityName: "",
    area: "",
    adminName: "",
    adminEmail: "",
  });

  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);

  // Set up countdown timer
  useEffect(() => {
    if (!generatedPassword) return;

    // Reset countdown to 5 when password is set
    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setGeneratedPassword(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generatedPassword]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast.success("✅ Password copied to clipboard!");
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`${API}/superadmin/create-university`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setGeneratedPassword(data.generatedPassword);
      toast.success("✅ University created successfully!");

      setForm({
        universityName: "",
        area: "",
        adminName: "",
        adminEmail: "",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Failed to create university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏛️ Create New Institute</h1>
            <p className="text-gray-600">Build a new institution in your educational empire</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            {/* University Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                Institute Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="universityName"
                      placeholder="e.g., Tech Institute"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      value={form.universityName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Area / Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="area"
                      placeholder="e.g., New York, USA"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      value={form.area}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Administrator Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-purple-600" size={20} />
                Administrator Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="adminName"
                      placeholder="e.g., John Smith"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      value={form.adminName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="adminEmail"
                      type="email"
                      placeholder="admin@institute.edu"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      value={form.adminEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Institute...
                  </>
                ) : (
                  <>
                    <Building2 size={20} />
                    Create Institute
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Key className="text-white" size={20} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">🔐 Admin Credentials Generated</h4>
                  <p className="text-gray-600">Share these credentials securely with the institute administrator</p>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${
                    countdown <= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500 text-white'
                  }`}>
                    {countdown}s
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{form.adminEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Password</p>
                    <p className="font-mono font-bold text-lg text-blue-600">{generatedPassword}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={copyPasswordToClipboard}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copy Password
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                <span>⚠️</span>
                This password will disappear in {countdown} seconds. Copy it now!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUniversityForm;
