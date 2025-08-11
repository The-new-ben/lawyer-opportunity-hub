import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'אימייל נדרש';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'כתובת אימייל לא תקינה';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'סיסמה נדרשת';
    } else if (formData.password.length < 8) {
      errors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
    } else if (mode === 'register' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'סיסמה חייבת להכיל אות קטנה, אות גדולה ומספר';
    }

    // Name validation (register only)
    if (mode === 'register') {
      if (!formData.name) {
        errors.name = 'שם מלא נדרש';
      } else if (formData.name.length < 2) {
        errors.name = 'שם חייב להכיל לפחות 2 תווים';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'lawyer', // Default role
        });
      }

      if (!result.success) {
        setError(result.error || 'שגיאה לא צפויה');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">HyperCourt</h1>
          <p className="text-gray-600">מערכת משפטית מתקדמת</p>
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'login' ? 'התחברות למערכת' : 'יצירת חשבון חדש'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם מלא *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="הזן שם מלא"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {validationErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כתובת אימייל *
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="הזן כתובת אימייל"
                disabled={isLoading}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה *
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pr-10 pl-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={mode === 'register' ? 'לפחות 8 תווים עם אות גדולה, קטנה ומספר' : 'הזן סיסמה'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Role info (register only) */}
          {mode === 'register' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>הערה:</strong> חשבונות חדשים נרשמים כעורכי דין כברירת מחדל. 
                מנהל המערכת יכול לשנות הרשאות לאחר הרישום.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                מעבד...
              </>
            ) : (
              mode === 'login' ? 'התחבר למערכת' : 'הירשם למערכת'
            )}
          </button>

          {/* Toggle mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
            >
              {mode === 'login' 
                ? 'אין לך חשבון? הירשם כאן' 
                : 'יש לך כבר חשבון? התחבר כאן'
              }
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            המערכת מאובטחת עם הצפנת SSL ואימות מתקדם
          </p>
        </div>
      </div>
    </div>
  );
}