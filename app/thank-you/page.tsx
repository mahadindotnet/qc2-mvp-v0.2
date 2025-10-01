'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Receipt, CheckCircle2, Home, ShoppingBag, Phone, Mail } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || 'N/A';
  const total = searchParams.get('total') || '0';
  const [showConfetti, setShowConfetti] = useState(false);

  // Prevent backward navigation and duplicate orders
  useEffect(() => {
    // Disable browser back button
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Auto-trigger confetti on mount
  useEffect(() => {
    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      setShowConfetti(true);
      
      // Play success sound effect automatically
      try {
        // Create an excited celebration sound - like people shouting with joy!
        const createCelebrationSound = () => {
          const sampleRate = 44100;
          const duration = 2.0; // Longer for more excitement
          const length = sampleRate * duration;
          
          const buffer = new ArrayBuffer(44 + length * 2);
          const view = new DataView(buffer);
          
          // WAV header
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };
          
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + length * 2, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, length * 2, true);
          
          // Multiple excited melodies playing simultaneously
          const melodies = [
            // Main celebration melody - ascending excitement
            { freq: 440, start: 0, duration: 0.3, vol: 0.3 },      // A4
            { freq: 523.25, start: 0.1, duration: 0.3, vol: 0.3 }, // C5
            { freq: 659.25, start: 0.2, duration: 0.3, vol: 0.3 },  // E5
            { freq: 783.99, start: 0.3, duration: 0.3, vol: 0.3 },  // G5
            { freq: 1046.50, start: 0.4, duration: 0.4, vol: 0.4 }, // C6
            { freq: 1318.51, start: 0.6, duration: 0.4, vol: 0.4 },  // E6
            { freq: 1567.98, start: 0.8, duration: 0.4, vol: 0.4 },   // G6
            { freq: 2093.00, start: 1.0, duration: 0.5, vol: 0.5 }, // C7
            
            // Shouting "YAY!" effect - quick bursts
            { freq: 880, start: 0.2, duration: 0.1, vol: 0.2 },    // A5
            { freq: 1174.66, start: 0.3, duration: 0.1, vol: 0.2 }, // D6
            { freq: 1760, start: 0.4, duration: 0.1, vol: 0.2 },   // A6
            { freq: 2349.32, start: 0.5, duration: 0.1, vol: 0.2 },  // D7
            
            // Crowd cheering - lower frequencies
            { freq: 220, start: 0.5, duration: 0.8, vol: 0.2 },     // A3
            { freq: 330, start: 0.6, duration: 0.8, vol: 0.2 },     // E4
            { freq: 440, start: 0.7, duration: 0.8, vol: 0.2 },     // A4
            
            // Final excited burst
            { freq: 1046.50, start: 1.2, duration: 0.3, vol: 0.4 }, // C6
            { freq: 1318.51, start: 1.3, duration: 0.3, vol: 0.4 }, // E6
            { freq: 1567.98, start: 1.4, duration: 0.3, vol: 0.4 }, // G6
            { freq: 2093.00, start: 1.5, duration: 0.5, vol: 0.5 }, // C7
          ];
          
          for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // Add all melodies
            melodies.forEach(note => {
              if (time >= note.start && time < note.start + note.duration) {
                const noteTime = time - note.start;
                const envelope = Math.exp(-noteTime * 2) * (1 - noteTime / note.duration);
                const noteSample = Math.sin(2 * Math.PI * note.freq * time) * envelope * note.vol;
                sample += noteSample;
              }
            });
            
            // Add excited crowd noise (white noise with envelope)
            if (time > 0.5 && time < 1.5) {
              const crowdNoise = (Math.random() - 0.5) * 0.1 * Math.exp(-Math.abs(time - 1.0) * 2);
              sample += crowdNoise;
            }
            
            // Add some excitement with frequency modulation
            const excitement = Math.sin(2 * Math.PI * 10 * time) * 0.05;
            sample += excitement;
            
            // Apply overall envelope for natural sound
            const overallEnvelope = Math.exp(-time * 0.8);
            sample *= overallEnvelope;
            
            // Clamp the sample
            sample = Math.max(-1, Math.min(1, sample));
            view.setInt16(44 + i * 2, sample * 32767, true);
          }
          
          const blob = new Blob([buffer], { type: 'audio/wav' });
          return URL.createObjectURL(blob);
        };
        
        // Play the celebration sound
        const audio = new Audio();
        audio.src = createCelebrationSound();
        audio.volume = 1.0;
        
        // Try to play immediately
        audio.play().catch((error) => {
          console.log('Autoplay blocked:', error);
          // Don't set up click listeners to avoid sound on button clicks
        });
        
        // Clean up the object URL after playing
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audio.src);
        });
        
      } catch (error) {
        console.log('Audio not available:', error);
      }
      
      // Trigger confetti automatically on page load
      try {
        // First burst - center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'],
          shapes: ['square', 'circle'],
          scalar: 1.2,
        });

        // Second burst with slight delay
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x: 0.3, y: 0.4 },
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
            shapes: ['circle'],
            scalar: 1,
          });
        }, 200);

        // Third burst
        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { x: 0.7, y: 0.6 },
            colors: ['#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'],
            shapes: ['square'],
            scalar: 0.8,
          });
        }, 400);
      } catch (error) {
        console.log('Confetti not available:', error);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // No auto-redirect - users can stay on the page as long as they want

  // Handle manual navigation
  const handleHomeClick = () => {
    router.push('/');
  };

  const handleNewOrderClick = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spotlight Background - Same as Landing Page */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-200/30 via-transparent to-transparent"></div>
        
        {/* Spread Out Circular Spotlights - Responsive */}
        <div className="absolute top-0 left-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-36 h-36 sm:w-54 sm:h-54 md:w-72 md:h-72 bg-amber-300/18 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 sm:w-66 sm:h-66 md:w-88 md:h-88 bg-yellow-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-orange-400/12 rounded-full blur-2xl"></div>
        
        {/* Center and Edge Spotlights - Responsive */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 w-28 h-28 sm:w-42 sm:h-42 md:w-56 md:h-56 bg-amber-400/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/2 w-36 h-36 sm:w-54 sm:h-54 md:w-72 md:h-72 bg-orange-500/12 rounded-full blur-3xl"></div>
        
        {/* Corner Spotlights - Responsive */}
        <div className="absolute top-1/6 left-1/6 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-yellow-500/8 rounded-full blur-2xl"></div>
        <div className="absolute top-1/6 right-1/6 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/6 left-1/6 w-28 h-28 sm:w-42 sm:h-42 md:w-56 md:h-56 bg-orange-600/6 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/6 right-1/6 w-20 h-20 sm:w-30 sm:h-30 md:w-40 md:h-40 bg-yellow-600/8 rounded-full blur-xl"></div>
      </div>


      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon with Animation */}
          <div className="relative flex justify-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center bg-green-100 rounded-full shadow-lg">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </div>
            {showConfetti && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </div>

          {/* Main Success Message */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎉 Congratulations! 🎉
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-4">
            Your Custom T-Shirt Order Has Been Placed!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We&apos;ve received your order and will start working on it right away. You&apos;ll receive a confirmation email shortly.
          </p>

          {/* Important Notice */}
          <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>💡 Important:</strong> You will pay when your order is delivered. Please keep <span className="font-bold text-blue-900">${total}</span> ready for the delivery person.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="mb-8 rounded-xl border-2 border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-orange-200">
                <div className="p-6">
                  <div className="text-sm uppercase text-gray-500 font-medium mb-2">Order ID</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-lg font-bold text-gray-900 font-mono">
                      {orderId.length > 12 ? `${orderId.substring(0, 8)}...` : orderId}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(orderId)
                        toast.success('Order ID copied to clipboard!')
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                      title="Copy full Order ID"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Click the copy icon to copy full ID</div>
                </div>
              <div className="p-6">
                <div className="text-sm uppercase text-gray-500 font-medium mb-2">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">${total}</div>
                <div className="text-xs text-gray-400 mt-1">Cash on Delivery</div>
              </div>
            </div>
            
            {/* Additional Order Information */}
            <div className="border-t border-orange-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs uppercase text-gray-500 font-medium mb-1">Order Status</div>
                  <div className="text-sm font-semibold text-green-600">Confirmed</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 font-medium mb-1">Payment Status</div>
                  <div className="text-sm font-semibold text-blue-600">Pending (COD)</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 font-medium mb-1">Order Date</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="mb-8 rounded-xl border-2 border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3 text-sm text-green-800">
              <Receipt className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Payment Method: Cash on Delivery (COD)</p>
                <p>No payment required now. Pay <span className="font-bold">${total}</span> when your order arrives at your doorstep.</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8 text-left rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing (Within 1 hour)</p>
                  <p className="text-xs text-gray-500">We&apos;ll review your order details and prepare for production</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Design Creation (1-2 hours)</p>
                  <p className="text-xs text-gray-500">Our expert team will create your custom design based on your requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Design Proof (If Requested)</p>
                  <p className="text-xs text-gray-500">We&apos;ll send you a preview for approval before printing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">4</span>
                </div>
                <div>
                  <p className="font-medium">Production & Quality Check</p>
                  <p className="text-xs text-gray-500">Your t-shirt will be printed with premium materials and quality-checked</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">5</span>
                </div>
                <div>
                  <p className="font-medium">Delivery (Same Day)</p>
                  <p className="text-xs text-gray-500">We&apos;ll deliver to your address and collect payment upon delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleHomeClick}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors cursor-pointer shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={handleNewOrderClick}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold transition-colors cursor-pointer shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Place Another Order
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Phone Support</p>
                  <a 
                    href="tel:+16514881244" 
                    className="text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    +1 (651) 488-1244
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Email Support</p>
                  <p className="text-blue-700">support@quickcopy2.com</p>
                </div>
              </div>

            </div>
            <p className="text-xs text-blue-600 mt-4">
              Reference your Order ID: <span className="font-mono font-bold">
                {orderId.length > 12 ? `${orderId.substring(0, 8)}...` : orderId}
              </span> when contacting us.
            </p>
          </div>

          {/* Manual navigation notice */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Take your time to review your order details. Use the buttons above to navigate when you&apos;re ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
