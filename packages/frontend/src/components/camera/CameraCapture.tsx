import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCapture {
  photoData: string;
  onCapture: (photoData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCapture> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode, isStreaming, startCamera, stopCamera]);

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Take Photo</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleCamera}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Switch camera"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative bg-black aspect-video">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {!isStreaming && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="opacity-50">Starting camera...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <Camera size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-red-300">{error}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 px-4 py-2 bg-primary-600 rounded-lg text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex gap-3 justify-center">
          {!capturedImage ? (
            <button
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="flex items-center gap-2 btn-primary px-6"
            >
              <Camera size={18} />
              Capture
            </button>
          ) : (
            <>
              <button onClick={retake} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={18} />
                Retake
              </button>
              <button onClick={confirmCapture} className="btn-primary flex items-center gap-2">
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
