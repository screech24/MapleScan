import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useAppContext } from '../context/AppContext';
import { getProductByBarcode } from '../services/api';
import { initBarcodeScanner, performOCR, extractProductInfo } from '../utils/scanUtils';
import toast from 'react-hot-toast';

const ScanPage = () => {
  const { setCurrentProduct, setLoading, setError, addToRecentScans, darkMode } = useAppContext();
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' or 'image'
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Clean up scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current();
      }
    };
  }, []);

  // Initialize barcode scanner
  const startBarcodeScanner = () => {
    setCameraActive(true);
    setScanMode('barcode');
    setCapturedImage(null);
    setOcrResult(null);
    
    // Use setTimeout to ensure the DOM element is ready
    setTimeout(() => {
      try {
        scannerRef.current = initBarcodeScanner('barcode-scanner', handleBarcodeDetected);
      } catch (err) {
        console.error('Failed to initialize barcode scanner:', err);
        toast.error('Failed to start barcode scanner. Please try again.');
      }
    }, 1000);
  };

  // Handle barcode detection
  const handleBarcodeDetected = async (barcode) => {
    if (!barcode) return;
    
    toast.success(`Barcode detected: ${barcode}`);
    setCameraActive(false);
    setLoading(true);
    
    try {
      const result = await getProductByBarcode(barcode);
      
      if (result && result.product) {
        setCurrentProduct(result.product);
        addToRecentScans(result.product);
        navigate(`/product/${barcode}`);
      } else {
        toast.error('Product not found. Try searching by name instead.');
        navigate('/search');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product information. Please try again.');
      toast.error('Failed to get product information.');
    } finally {
      setLoading(false);
    }
  };

  // Start image recognition mode
  const startImageRecognition = () => {
    setCameraActive(true);
    setScanMode('image');
    setCapturedImage(null);
    setOcrResult(null);
    
    // Stop barcode scanner if active
    if (scannerRef.current) {
      scannerRef.current();
      scannerRef.current = null;
    }
  };

  // Capture image for processing
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setCameraActive(false);
      processImage(imageSrc);
    }
  };

  // Process captured image with OCR
  const processImage = async (imageSrc) => {
    if (!imageSrc) return;
    
    setProcessingImage(true);
    
    try {
      const text = await performOCR(imageSrc);
      const productInfo = extractProductInfo(text);
      
      setOcrResult({
        text,
        productInfo
      });
      
      if (productInfo && productInfo.potentialName) {
        toast.success('Text extracted from image. You can search for this product.');
      } else {
        toast.error('Could not identify product from image. Try manual search.');
      }
    } catch (err) {
      console.error('OCR error:', err);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setProcessingImage(false);
    }
  };

  // Search for product based on OCR result
  const searchFromOCR = () => {
    if (ocrResult && ocrResult.productInfo && ocrResult.productInfo.potentialName) {
      navigate(`/search?q=${encodeURIComponent(ocrResult.productInfo.potentialName)}`);
    }
  };

  // Reset scan process
  const resetScan = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setCameraActive(false);
    
    if (scannerRef.current) {
      scannerRef.current();
      scannerRef.current = null;
    }
  };

  return (
    <div className="pb-16">
      <h1 className="text-2xl font-bold mb-6">Scan Product</h1>
      
      {/* Scan mode selection */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={startBarcodeScanner}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              scanMode === 'barcode' && cameraActive
                ? 'bg-maple-red text-white'
                : `${darkMode ? 'bg-dark-surface text-gray-300' : 'bg-white text-gray-700'} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
            } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            Scan Barcode
          </button>
          <button
            type="button"
            onClick={startImageRecognition}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              scanMode === 'image' && cameraActive
                ? 'bg-maple-red text-white'
                : `${darkMode ? 'bg-dark-surface text-gray-300' : 'bg-white text-gray-700'} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
            } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            Take Picture
          </button>
        </div>
      </div>
      
      {/* Camera view */}
      {cameraActive && (
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            {scanMode === 'barcode' ? (
              <div id="barcode-scanner" className="w-full h-64 bg-black rounded-lg overflow-hidden"></div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'environment',
                }}
                className="w-full h-64 rounded-lg"
              />
            )}
            
            {scanMode === 'image' && (
              <button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-maple-red text-white px-4 py-2 rounded-full shadow-md"
              >
                Capture
              </button>
            )}
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={resetScan}
              className="text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
          
          {scanMode === 'barcode' && (
            <p className="text-center text-gray-600 mt-4">
              Position the barcode in the center of the screen
            </p>
          )}
        </div>
      )}
      
      {/* Captured image */}
      {capturedImage && (
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <img
              src={capturedImage}
              alt="Captured product"
              className="w-full rounded-lg"
            />
          </div>
          
          {processingImage && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-maple-red border-t-transparent"></div>
              <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Processing image...</p>
            </div>
          )}
          
          {ocrResult && (
            <div className={`mt-4 p-4 ${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md`}>
              <h3 className="font-semibold mb-2">Extracted Information:</h3>
              
              {ocrResult.productInfo && ocrResult.productInfo.potentialName && (
                <div className="mb-2">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Product:</span> {ocrResult.productInfo.potentialName}
                  </p>
                </div>
              )}
              
              {ocrResult.productInfo && ocrResult.productInfo.countryOfOrigin && (
                <div className="mb-2">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Origin:</span> {ocrResult.productInfo.countryOfOrigin}
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={resetScan}
                  className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} underline`}
                >
                  Try Again
                </button>
                
                {ocrResult.productInfo && ocrResult.productInfo.potentialName && (
                  <button
                    onClick={searchFromOCR}
                    className="bg-maple-red text-white px-4 py-2 rounded-md"
                  >
                    Search This Product
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Instructions when no camera is active */}
      {!cameraActive && !capturedImage && (
        <div className={`text-center py-12 ${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Scan a product barcode or take a picture to check if it's made in Canada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startBarcodeScanner}
              className="bg-maple-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Scan Barcode
            </button>
            <button
              onClick={startImageRecognition}
              className={`${darkMode ? 'bg-dark-surface' : 'bg-white'} text-maple-red border border-maple-red px-6 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition duration-200`}
            >
              Take Picture
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage; 