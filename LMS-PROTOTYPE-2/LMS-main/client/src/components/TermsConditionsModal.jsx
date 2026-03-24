import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

const TermsConditionsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setAcknowledged(false);
  };

  const handleAccept = () => {
    if (acknowledged) {
      // Store acceptance in localStorage
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      closeModal();
    }
  };

  return (
    <>
      {/* Terms & Conditions Button */}
      <button
        onClick={openModal}
        className="p-2 rounded-full bg-white hover:bg-gray-200 transition"
        title="Terms & Conditions"
      >
        <FileText className="w-5 h-5 text-black" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Terms & Conditions</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Welcome Message */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Welcome to EduMentor LMS</h3>
                <p className="text-gray-600">
                  Please read and review our Terms & Conditions carefully before using our Learning Management System.
                </p>
              </div>

              {/* Terms Content */}
              <div className="prose max-w-none">
                <h4 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h4>
                <p className="text-gray-600 mb-4">
                  By accessing and using EduMentor LMS, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h4 className="text-lg font-semibold mb-3">2. Use License</h4>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily download one copy of the materials on EduMentor LMS for personal, non-commercial transitory viewing only.
                </p>

                <h4 className="text-lg font-semibold mb-3">3. Disclaimer</h4>
                <p className="text-gray-600 mb-4">
                  The materials on EduMentor LMS are provided on an 'as is' basis. EduMentor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                </p>

                <h4 className="text-lg font-semibold mb-3">4. Limitations</h4>
                <p className="text-gray-600 mb-4">
                  In no event shall EduMentor or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EduMentor LMS.
                </p>

                <h4 className="text-lg font-semibold mb-3">5. Privacy Policy</h4>
                <p className="text-gray-600 mb-4">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our LMS platform.
                </p>

                <h4 className="text-lg font-semibold mb-3">6. User Account</h4>
                <p className="text-gray-600 mb-4">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </p>

                <h4 className="text-lg font-semibold mb-3">7. Intellectual Property</h4>
                <p className="text-gray-600 mb-4">
                  The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary rights.
                </p>

                <h4 className="text-lg font-semibold mb-3">8. Termination</h4>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
                </p>

                <h4 className="text-lg font-semibold mb-3">9. Governing Law</h4>
                <p className="text-gray-600 mb-4">
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which our platform operates.
                </p>

                <h4 className="text-lg font-semibold mb-3">10. Changes to Terms</h4>
                <p className="text-gray-600 mb-4">
                  We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
                </p>
              </div>
            </div>

            {/* Footer with Checkbox and Accept Button */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="acknowledge"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acknowledge" className="ml-3 text-sm text-gray-700">
                  <strong>I acknowledge</strong> that I have read, understood, and agree to be bound by the Terms & Conditions of EduMentor LMS. I understand that this is a legally binding agreement and I accept all responsibilities outlined herein.
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!acknowledged}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    acknowledged
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TermsConditionsModal;
