import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link: missing token');
      return;
    }

    // Call verification API
    fetch(`/api/verify?token=${token}`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          if (data.position) {
            setPosition(data.position);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus('error');
          setMessage(errorData.error || 'Verification failed');
        }
      })
      .catch((error) => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error occurred during verification');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && '🔄 Verifying...'}
            {status === 'success' && '✅ Email Verified!'}
            {status === 'error' && '❌ Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-green-700 font-medium">{message}</p>
              {position && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    🎯 Your position: <strong>#{position}</strong>
                  </p>
                </div>
              )}
              <p className="text-gray-600">
                📧 A welcome email has been sent to your inbox.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-700 font-medium">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  Please check your email for a valid verification link, or try registering again.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link to="/">
                🌲 Return to Waiting List
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;
