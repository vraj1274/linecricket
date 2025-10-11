/**
 * Comprehensive data validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class DataValidator {
  private rules: Record<string, ValidationRule> = {};

  addRule(field: string, rule: ValidationRule) {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, value] of Object.entries(data)) {
      const rule = this.rules[field];
      if (!rule) continue;

      const error = this.validateField(field, value, rule);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateField(field: string, value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${field} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${field} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${field} must be less than ${rule.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${field} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }
}

// Predefined validation rules for common fields
export const validationRules = {
  // User profile validation
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Full name must be 2-50 characters and contain only letters and spaces'
  },
  
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
  },
  
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  phone: {
    required: false,
    pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
    message: 'Please enter a valid phone number'
  },
  
  age: {
    required: false,
    custom: (value: any) => {
      const age = parseInt(value);
      if (isNaN(age)) return null;
      if (age < 13 || age > 100) {
        return 'Age must be between 13 and 100';
      }
      return null;
    }
  },
  
  bio: {
    required: false,
    maxLength: 500,
    message: 'Bio must be less than 500 characters'
  },
  
  location: {
    required: false,
    maxLength: 100,
    message: 'Location must be less than 100 characters'
  },
  
  organization: {
    required: false,
    maxLength: 100,
    message: 'Organization must be less than 100 characters'
  }
};

// Cricket-specific validation rules
export const cricketValidationRules = {
  battingSkill: {
    required: false,
    custom: (value: any) => {
      const skill = parseInt(value);
      if (isNaN(skill)) return null;
      if (skill < 0 || skill > 100) {
        return 'Batting skill must be between 0 and 100';
      }
      return null;
    }
  },
  
  bowlingSkill: {
    required: false,
    custom: (value: any) => {
      const skill = parseInt(value);
      if (isNaN(skill)) return null;
      if (skill < 0 || skill > 100) {
        return 'Bowling skill must be between 0 and 100';
      }
      return null;
    }
  },
  
  fieldingSkill: {
    required: false,
    custom: (value: any) => {
      const skill = parseInt(value);
      if (isNaN(skill)) return null;
      if (skill < 0 || skill > 100) {
        return 'Fielding skill must be between 0 and 100';
      }
      return null;
    }
  },
  
  totalRuns: {
    required: false,
    custom: (value: any) => {
      const runs = parseInt(value);
      if (isNaN(runs)) return null;
      if (runs < 0) {
        return 'Total runs cannot be negative';
      }
      return null;
    }
  },
  
  totalWickets: {
    required: false,
    custom: (value: any) => {
      const wickets = parseInt(value);
      if (isNaN(wickets)) return null;
      if (wickets < 0) {
        return 'Total wickets cannot be negative';
      }
      return null;
    }
  },
  
  battingAverage: {
    required: false,
    custom: (value: any) => {
      const average = parseFloat(value);
      if (isNaN(average)) return null;
      if (average < 0) {
        return 'Batting average cannot be negative';
      }
      return null;
    }
  },
  
  bowlingAverage: {
    required: false,
    custom: (value: any) => {
      const average = parseFloat(value);
      if (isNaN(average)) return null;
      if (average < 0) {
        return 'Bowling average cannot be negative';
      }
      return null;
    }
  }
};

// Experience and Achievement validation
export const experienceValidationRules = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Experience title must be 2-100 characters'
  },
  
  role: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Role must be 2-100 characters'
  },
  
  duration: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Duration must be 2-50 characters'
  },
  
  description: {
    required: false,
    maxLength: 500,
    message: 'Description must be less than 500 characters'
  }
};

export const achievementValidationRules = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Achievement title must be 2-100 characters'
  },
  
  year: {
    required: true,
    pattern: /^(19|20)\d{2}$/,
    message: 'Year must be a valid 4-digit year'
  },
  
  description: {
    required: false,
    maxLength: 500,
    message: 'Description must be less than 500 characters'
  }
};

// Utility functions for common validations
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(phone);
};

export const validateUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeNumber = (num: any): number | null => {
  const parsed = parseFloat(num);
  return isNaN(parsed) ? null : parsed;
};

export const sanitizeInteger = (num: any): number | null => {
  const parsed = parseInt(num);
  return isNaN(parsed) ? null : parsed;
};

// Form data sanitization
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
