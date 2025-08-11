import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={64} />
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              אירעה שגיאה במערכת
            </h1>
            
            <p className="text-gray-600 mb-6">
              משהו השתבש. אנא נסה לרענן את הדף או חזור לעמוד הבית.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                רענן דף
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home size={20} />
                חזור לעמוד הבית
              </button>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  פרטי שגיאה (מצב פיתוח)
                </summary>
                <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-semibold text-red-600 mb-2">Error:</h3>
                  <p className="text-sm text-gray-700 mb-3">{this.state.error.message}</p>
                  
                  {this.state.error.stack && (
                    <>
                      <h3 className="font-semibold text-red-600 mb-2">Stack Trace:</h3>
                      <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <h3 className="font-semibold text-red-600 mb-2 mt-3">Component Stack:</h3>
                      <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                אם הבעיה נמשכת, אנא פנה לתמיכה הטכנית
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}