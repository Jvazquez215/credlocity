import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, Clock, Pen, RotateCcw, Download } from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SignatureCanvas({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  }, [isDrawing, getPos]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const save = () => {
    if (!hasSignature) { toast.error('Please draw your signature'); return; }
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          data-testid="signature-canvas"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-300 text-sm">Draw your signature here</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={clear} className="flex-1" data-testid="clear-signature-btn">
          <RotateCcw className="w-4 h-4 mr-2" /> Clear
        </Button>
        <Button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-700" data-testid="submit-signature-btn">
          <Pen className="w-4 h-4 mr-2" /> Sign Agreement
        </Button>
      </div>
    </div>
  );
}

export default function SignAgreement() {
  const { signToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyToken();
  }, [signToken]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/esign/public/verify/${signToken}`);
      if (!res.ok) throw new Error('Invalid link');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('This signing link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureData) => {
    setSigning(true);
    try {
      const res = await fetch(`${API_URL}/api/esign/public/sign/${signToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: signatureData })
      });
      if (!res.ok) throw new Error('Signing failed');
      const result = await res.json();
      setData({ status: 'signed', signed_at: result.signed_at, signer_name: data.signer_name });
      toast.success('Agreement signed successfully!');
    } catch (err) {
      toast.error('Failed to sign agreement. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (data?.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-500">This signing link has expired. Please contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  if (data?.status === 'signed' || data?.status === 'already_signed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center" data-testid="signed-confirmation">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agreement Signed</h1>
          <p className="text-gray-500 mb-1">Signed by: <span className="font-semibold">{data.signer_name}</span></p>
          <p className="text-gray-400 text-sm mb-6">{data.signed_at ? new Date(data.signed_at).toLocaleString() : ''}</p>
          <Button onClick={() => window.open(`${API_URL}/api/esign/public/download/${signToken}`, '_blank')} variant="outline" data-testid="download-signed-btn">
            <Download className="w-4 h-4 mr-2" /> Download Signed Agreement
          </Button>
        </div>
      </div>
    );
  }

  // Pending - show agreement and signature pad
  const agr = data?.agreement || {};
  const minTotal = (agr.min_accounts || 0) * (agr.rate_per_account || 0);
  const maxTotal = (agr.max_accounts || 0) * (agr.rate_per_account || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4" data-testid="sign-agreement-page">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontVariant: 'small-caps' }}>Credlocity</h1>
          <p className="text-sm text-slate-500 mt-1">E-Signature Portal</p>
        </div>

        {/* Agreement Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <h2 className="text-xl font-bold text-white">Credit Repair Outsourcing Service Agreement</h2>
            <p className="text-blue-100 text-sm mt-1">Please review and sign below</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Signer info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Signing as:</span> {data.signer_name} ({data.signer_email})
              </p>
            </div>

            {/* Agreement Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Agreement Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="font-semibold text-gray-900 text-sm">{agr.provider_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-semibold text-gray-900 text-sm">{data.partner?.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Package</p>
                  <p className="font-semibold text-gray-900 text-sm">{agr.package_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Rate Per Account</p>
                  <p className="font-semibold text-gray-900 text-sm">${(agr.rate_per_account || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Account Range</p>
                  <p className="font-semibold text-gray-900 text-sm">{agr.min_accounts} - {agr.max_accounts} accounts</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Monthly Cost Range</p>
                  <p className="font-semibold text-green-700 text-sm">${minTotal.toFixed(2)} - ${maxTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Legal disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                By signing below, you acknowledge that you have read, understood, and agree to the terms of this Credit Repair Outsourcing Service Agreement. This electronic signature is legally binding and has the same force and effect as a handwritten signature.
              </p>
            </div>

            {/* Signature Pad */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Your Signature</h3>
              {signing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-500">Processing signature...</span>
                </div>
              ) : (
                <SignatureCanvas onSave={handleSign} />
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Expires: {data.expires_at ? new Date(data.expires_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by Credlocity E-Signature</p>
      </div>
    </div>
  );
}
