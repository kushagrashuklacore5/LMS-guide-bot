/**
 * API Error Handler Utility
 * Handles API responses and detects quota/feature restrictions
 * Shows appropriate modals based on response status
 */

export const handleApiError = (error, showQuotaModal) => {
  // Check if it's a 402 (Payment Required) status - quota exceeded
  if (error.response?.status === 402) {
    const data = error.response.data;

    // Extract quota details from error response
    const quotaDetails = {
      type: data.featureRestricted ? 'feature' : 'quota',
      resourceType: extractResourceType(data.message),
      currentUsage: data.currentCount || 0,
      limit: data.limit || 0,
      message: data.message || 'Your account is in free tier. Please contact your administrator to use the full feature.'
    };

    // Show the quota modal
    showQuotaModal(quotaDetails);
    return true; // Error handled
  }

  return false; // Error not handled by quota system
};

/**
 * Extract resource type from error message
 * Examples: "Classroom", "Student", "Announcement", etc.
 */
const extractResourceType = (message) => {
  if (!message) return 'resource';

  const resourcePatterns = [
    { pattern: /classroom/i, type: 'Classroom' },
    { pattern: /student/i, type: 'Student' },
    { pattern: /teacher/i, type: 'Teacher' },
    { pattern: /mentor/i, type: 'Mentor' },
    { pattern: /announcement/i, type: 'Announcement' },
    { pattern: /export/i, type: 'Export' },
    { pattern: /calendar/i, type: 'Calendar' },
  ];

  for (const { pattern, type } of resourcePatterns) {
    if (pattern.test(message)) {
      return type;
    }
  }

  return 'resource';
};

/**
 * Wrap API call with quota error handling
 * Example usage:
 * const result = await withQuotaErrorHandling(
 *   api.post('/classrooms', data),
 *   showQuotaModal
 * );
 */
export const withQuotaErrorHandling = async (apiCall, showQuotaModal) => {
  try {
    return await apiCall;
  } catch (error) {
    if (handleApiError(error, showQuotaModal)) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw error;
  }
};

export default {
  handleApiError,
  withQuotaErrorHandling,
  extractResourceType,
};
