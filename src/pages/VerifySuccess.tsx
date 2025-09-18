import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifySuccess = () => {
  const [searchParams] = useSearchParams();
  const [position, setPosition] = useState<number | null>(null);
  const [email, setEmail] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const positionParam = searchParams.get('position');
    const emailParam = searchParams.get('email');
    
    if (positionParam) {
      setPosition(parseInt(positionParam));
    }
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleShareToFriend = async () => {
    const shareUrl = window.location.origin;
    const shareText = `🌲 Join me on the AAStar waiting list! Be the first to know about revolutionary Web3 innovations. ${shareUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join AAStar Waiting List',
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard",
        });
      } catch (clipboardError) {
        console.error('Clipboard failed:', clipboardError);
        toast({
          title: "Share Failed",
          description: "Please manually copy the link to share",
          variant: "destructive"
        });
      }
    }
  };

  // Background emoji animation similar to main page
  const backgroundEmojis = ['🌲', '🌿', '🍃', '🌸', '☁️', '🌳', '🦌', '🐰', '🐻'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
      {/* Background Emojis */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`emoji-${i}-${Math.random()}`}
            className="forest-emoji absolute text-4xl opacity-20 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            {backgroundEmojis[Math.floor(Math.random() * backgroundEmojis.length)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 mb-2">
              Welcome to AAStar Waiting List!
            </CardTitle>
            <p className="text-lg text-green-600">
              Congratulations! Your email has been verified successfully.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Position Display */}
            {position && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-lg font-semibold">Your Position</span>
                </div>
                <div className="text-4xl font-bold">#{position}</div>
                <p className="text-green-100 mt-2">
                  You're among the first to join our exclusive waiting list!
                </p>
              </div>
            )}

            {/* Welcome Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                  <p className="text-blue-800 leading-relaxed">
                    We'll be the first to notify you about AAStar's revolutionary Web3 innovations, 
                    exclusive features, and launch updates. Keep an eye on your inbox at{' '}
                    <span className="font-mono bg-blue-100 px-1 rounded text-sm">
                      {email.replace(/(.{2}).*(@.*)/, '$1***$2')}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Invite Your Friends
                </h3>
                <p className="text-purple-800 mb-4">
                  Share the excitement! Invite your friends to join the AAStar waiting list.
                </p>
                <Button 
                  onClick={handleShareToFriend}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform transition-all hover:scale-105"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Friends
                </Button>
              </div>
            </div>

            {/* Return Button */}
            <div className="text-center pt-4">
              <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Link to="/">
                  🌲 Return to Waiting List
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifySuccess;
