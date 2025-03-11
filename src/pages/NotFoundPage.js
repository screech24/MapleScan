import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-maple-red mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-maple-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage; 