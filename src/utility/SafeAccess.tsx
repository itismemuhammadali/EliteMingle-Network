/**
 * Utility functions for safely accessing nested properties
 * to avoid using optional chaining
 */

/**
 * Safely get profile avatar URL with fallback
 */
export const getProfileAvatar = (item: any, defaultValue: string = '') => {
  try {
    return (item && item.profileAvatar) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get online status
 */
export const getIsOnline = (item: any, defaultValue: boolean = false) => {
  try {
    return (item && item.isOnline) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get user name
 */
export const getUserName = (
  item: any,
  path: string = '',
  defaultValue: string = 'Unknown',
) => {
  try {
    if (path === 'lawyer') {
      return (item && item.lawyer && item.lawyer.userName) || defaultValue;
    }
    return (item && item.userName) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get verification status
 */
export const getIsVerified = (item: any, defaultValue: boolean = false) => {
  try {
    return (item && item.isVerified) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get province name
 */
export const getProvinceName = (
  item: any,
  path: string = '',
  defaultValue: string = 'N/A',
) => {
  try {
    if (path === 'lawyer') {
      return (
        (item &&
          item.lawyer &&
          item.lawyer.province &&
          item.lawyer.province.name) ||
        defaultValue
      );
    }
    return (item && item.province && item.province.name) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get rating information
 */
export const getRating = (
  item: any,
  defaultValue = {average: '0', total: '0'},
) => {
  try {
    return {
      average: (item && item.averageRating) || defaultValue.average,
      total: (item && item.totalRatings) || defaultValue.total,
    };
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get raw rating value
 */
export const getRateValue = (item: any, defaultValue: number = 0) => {
  try {
    return (item && item.rateValue) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get legal service name
 */
export const getLegalServiceName = (
  item: any,
  defaultValue: string = 'Not specified',
) => {
  try {
    return (
      (item &&
        item.legalServices &&
        item.legalServices.length > 0 &&
        item.legalServices[0].name) ||
      defaultValue
    );
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get years of experience
 */
export const getExperience = (item: any, defaultValue: string = '0') => {
  try {
    return (item && item.yearsOfExperience) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get selected status
 */
export const getIsSelected = (item: any, defaultValue: boolean = false) => {
  try {
    return (item && item.isSelected) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get good/bad fit status
 */
export const getIsGoodFit = (item: any, defaultValue: boolean = false) => {
  try {
    return (item && item.isGoodFit) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get lawyer email
 */
export const getLawyerEmail = (item: any, defaultValue: string = 'N/A') => {
  try {
    return (item && item.lawyer && item.lawyer.email) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get lawyer phone
 */
export const getLawyerPhone = (item: any, defaultValue: string = 'N/A') => {
  try {
    return (item && item.lawyer && item.lawyer.phoneNumber) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get website URL
 */
export const getWebsite = (item: any, defaultValue: string = 'N/A') => {
  try {
    return (
      (item &&
        item.lawyer &&
        item.lawyer.company &&
        item.lawyer.company.website) ||
      defaultValue
    );
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get question text
 */
export const getQuestion = (item: any, defaultValue: string = '') => {
  try {
    return (item && item.question && item.question.question) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get review text
 */
export const getReview = (item: any, defaultValue: string = '') => {
  try {
    return (item && item.review) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get client experience review
 */
export const getClientExperienceReview = (
  item: any,
  defaultValue: string = '',
) => {
  try {
    return (
      (item && item.clientExperince && item.clientExperince.review) ||
      defaultValue
    );
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely get status
 */
export const getStatus = (item: any, defaultValue: string = '') => {
  try {
    return (item && item.status) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const SafeAccess = {
  getProfileAvatar,
  getIsOnline,
  getUserName,
  getIsVerified,
  getProvinceName,
  getRating,
  getRateValue,
  getLegalServiceName,
  getExperience,
  getIsSelected,
  getIsGoodFit,
  getLawyerEmail,
  getLawyerPhone,
  getWebsite,
  getQuestion,
  getReview,
  getClientExperienceReview,
  getStatus,
};

export default SafeAccess;
