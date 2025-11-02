import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Coffee } from 'lucide-react';

// FIX: Corrected typo from React.-FC to React.FC
const LoginScreen: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleKeyPress = (key: string) => {
    if (accessCode.length < 4) {
      setAccessCode(accessCode + key);
    }
  };

  const handleDelete = () => {
    setAccessCode(accessCode.slice(0, -1));
  };

  const handleLogin = async () => {
    if (accessCode.length !== 4) {
      setError('Access code must be 4 digits.');
      return;
    }
    setLoading(true);
    setError('');
    const success = await login(accessCode);
    if (!success) {
      setError('Invalid access code.');
      setAccessCode('');
    }
    setLoading(false);
  };

  const pinDisplay = '••••'.split('').map((char, index) => (
    <div key={index} className={`w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-md flex items-center justify-center text-3xl
      ${accessCode.length > index ? 'bg-primary-500 border-primary-500' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
      {accessCode.length > index ? '•' : ''}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                <Coffee className="w-12 h-12 text-primary-600 dark:text-primary-300" />
            </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Sinja Coffee</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your access code</p>
        </div>

        <div className="flex justify-center space-x-3 mb-4">
          {pinDisplay}
        </div>
        
        {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handleKeyPress(num.toString())} className="h-16 text-2xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {num}
            </button>
          ))}
          <button onClick={handleDelete} className="h-16 text-2xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            &larr;
          </button>
          <button onClick={() => handleKeyPress('0')} className="h-16 text-2xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            0
          </button>
          <button onClick={handleLogin} disabled={loading} className="h-16 text-2xl font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50">
            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Go'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;