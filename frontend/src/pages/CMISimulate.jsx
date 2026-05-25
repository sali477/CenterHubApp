import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../api/index';

const CMISimulate = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const okUrl = searchParams.get('okUrl');

    const timer = setTimeout(async () => {
      try {
        await paymentAPI.cmiCallback({
          orderId,
          status: 'approved',
          hash: 'dev_simulate',
        });
      } catch {
        /* dev mode */
      }
      if (okUrl) window.location.href = okUrl;
    }, 2000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card p-8 text-center max-w-sm">
        <div className="w-12 h-12 border-4 border-morocco-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="font-bold text-lg">CMI Payment Gateway</h1>
        <p className="text-gray-500 text-sm mt-2">Simulating payment processing...</p>
        <p className="text-xs text-gray-400 mt-4">Dev mode — redirects automatically</p>
      </div>
    </div>
  );
};

export default CMISimulate;
