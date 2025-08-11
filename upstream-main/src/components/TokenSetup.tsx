import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface TokenSetupProps {
  onTokenSet: (token: string) => void;
  currentToken?: string;
}

export default function TokenSetup({ onTokenSet, currentToken }: TokenSetupProps) {
  const [token, setToken] = useState(currentToken || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  const validateToken = async (tokenToValidate: string) => {
    if (!tokenToValidate.startsWith('hf_')) {
      setValidationResult('invalid');
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test validation',
          parameters: { max_new_tokens: 10 }
        })
      });

      if (response.ok || response.status === 503) {
        setValidationResult('valid');
        return true;
      } else {
        setValidationResult('invalid');
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setValidationResult('invalid');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await validateToken(token)) {
      onTokenSet(token);
    }
  };

  const useDefaultToken = () => {
    const defaultToken = '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';
    setToken(defaultToken);
    onTokenSet(defaultToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Justice Platform</h1>
          <p className="text-gray-600">Connect to analysis services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Token
            </label>
            <div className="relative">
              <input
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            {validationResult === 'valid' && (
              <div className="mt-2 flex items-center text-green-600 text-sm">
                <CheckCircle size={16} className="mr-1" />
                Token validated successfully
              </div>
            )}
            {validationResult === 'invalid' && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                Invalid token format
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer" className="underline">huggingface.co</a></li>
              <li>Create account and sign in</li>
              <li>Go to Settings → Access Tokens</li>
              <li>Create new token with "Read" permissions</li>
              <li>Copy and paste the token above</li>
            </ol>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <ExternalLink size={14} className="mr-1" />
              Open Token Settings
            </a>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isValidating || !token}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Validating...
                </>
              ) : (
                'Connect Services'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>

            <button
              type="button"
              onClick={useDefaultToken}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Use Demo Token
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your token is stored locally and used only for service connections
          </p>
        </div>
      </div>
    </div>
  );
}