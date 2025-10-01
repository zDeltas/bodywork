export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class AuthValidator {
  static validateEmail(email: string): ValidationResult {
    if (!email) {
      return { isValid: false, error: 'L\'email est requis' };
    }

    if (!email.trim()) {
      return { isValid: false, error: 'L\'email ne peut pas être vide' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Format d\'email invalide' };
    }

    // Check for common email providers to give better UX
    const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domain = email.trim().split('@')[1]?.toLowerCase();
    
    if (domain && !commonProviders.includes(domain) && !domain.includes('.')) {
      return { isValid: false, error: 'Domaine email suspect, vérifiez l\'orthographe' };
    }

    return { isValid: true };
  }

  static validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, error: 'Le mot de passe est requis' };
    }

    if (password.length < 6) {
      return { isValid: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Le mot de passe ne peut pas dépasser 128 caractères' };
    }

    // Check for common weak passwords
    const weakPasswords = ['123456', 'password', 'azerty', 'qwerty', '000000', '111111'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return { isValid: false, error: 'Ce mot de passe est trop faible' };
    }

    return { isValid: true };
  }

  static validatePasswordStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Au moins 8 caractères');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Au moins une minuscule');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Au moins une majuscule');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Au moins un chiffre');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Au moins un caractère spécial');
    }

    return {
      score: Math.min(score, 4),
      feedback,
      isStrong: score >= 3
    };
  }

  static getPasswordStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return '#ef4444'; // Red
      case 2:
        return '#f59e0b'; // Orange
      case 3:
        return '#eab308'; // Yellow
      case 4:
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray
    }
  }

  static getPasswordStrengthText(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Très faible';
      case 2:
        return 'Faible';
      case 3:
        return 'Moyen';
      case 4:
        return 'Fort';
      default:
        return 'Inconnu';
    }
  }
}

export default AuthValidator;
