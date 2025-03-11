import Quagga from 'quagga';
import Tesseract from 'tesseract.js';

// Initialize barcode scanner
export const initBarcodeScanner = (elementId, onDetected) => {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector(`#${elementId}`),
      constraints: {
        width: { min: 640 },
        height: { min: 480 },
        facingMode: "environment",
        aspectRatio: { min: 1, max: 2 }
      },
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: navigator.hardwareConcurrency || 4,
    decoder: {
      readers: [
        "ean_reader",
        "ean_8_reader",
        "upc_reader",
        "upc_e_reader",
        "code_128_reader",
        "code_39_reader",
        "code_39_vin_reader",
        "codabar_reader",
        "i2of5_reader"
      ]
    },
    locate: true
  }, (err) => {
    if (err) {
      console.error("Error initializing Quagga:", err);
      return;
    }
    
    Quagga.start();
  });

  // When a barcode is detected
  Quagga.onDetected((result) => {
    if (result && result.codeResult) {
      // Stop scanning
      Quagga.stop();
      
      // Call the callback with the barcode
      onDetected(result.codeResult.code);
    }
  });

  return () => {
    Quagga.stop();
  };
};

// Perform OCR on an image to extract text
export const performOCR = async (imageUrl) => {
  try {
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      { logger: m => console.log(m) }
    );
    
    return result.data.text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
};

// Extract potential product names from OCR text
export const extractProductInfo = (text) => {
  if (!text) return null;
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Simple heuristic: the first few non-empty lines might be the product name
  const potentialName = lines.slice(0, 3).join(' ');
  
  // Look for "Made in" text to identify country of origin
  const madeInMatch = text.match(/made in\s+([a-zA-Z\s]+)/i);
  const countryOfOrigin = madeInMatch ? madeInMatch[1].trim() : null;
  
  return {
    potentialName,
    countryOfOrigin
  };
};

const scanUtils = {
  initBarcodeScanner,
  performOCR,
  extractProductInfo
};

export default scanUtils; 