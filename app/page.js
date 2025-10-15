'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Home, MapPin, Search, Building2 } from 'lucide-react';

export default function PropertyDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suburb, setSuburb] = useState('Belmont North');
  const [propertyType, setPropertyType] = useState('house');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/properties?suburb=${encodeURIComponent(suburb)}&property_type=${propertyType}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }
      
      const data = await response.json();
      console.log('=== API Response ===');
      console.log('Total properties:', data.properties?.length);
      console.log('First property:', data.properties?.[0]);
      
      setProperties(data.properties || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProperties();
  };

  const getMetrics = () => {
    if (!properties.length) return null;

    const bedrooms = properties
      .filter(p => p.bedrooms && !isNaN(p.bedrooms) && p.bedrooms > 0)
      .map(p => p.bedrooms);
    
    const avgBedrooms = bedrooms.length > 0 
      ? (bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length).toFixed(1)
      : 0;

    const bathrooms = properties
      .filter(p => p.bathrooms && !isNaN(p.bathrooms) && p.bathrooms > 0)
      .map(p => p.bathrooms);
    
    const avgBathrooms = bathrooms.length > 0 
      ? (bathrooms.reduce((a, b) => a + b, 0) / bathrooms.length).toFixed(1)
      : 0;

    const suburbs = [...new Set(properties
      .map(p => p.suburb)
      .filter(s => s && s !== 'null' && s !== 'undefined'))];

    const withCarspaces = properties.filter(p => p.carspaces && p.carspaces > 0).length;

    return {
      totalProperties: properties.length,
      avgBedrooms,
      avgBathrooms,
      suburbs: suburbs.length,
      withCarspaces
    };
  };

  const getBedroomDistribution = () => {
    if (!properties.length) return [];

    const distribution = {};
    properties.forEach(p => {
      if (p.bedrooms && !isNaN(p.bedrooms) && p.bedrooms > 0) {
        const key = `${p.bedrooms} bed`;
        distribution[key] = (distribution[key] || 0) + 1;
      }
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const aNum = parseInt(a.name);
        const bNum = parseInt(b.name);
        return aNum - bNum;
      });
  };

  const getBathroomDistribution = () => {
    if (!properties.length) return [];

    const distribution = {};
    properties.forEach(p => {
      if (p.bathrooms && !isNaN(p.bathrooms) && p.bathrooms > 0) {
        const key = `${p.bathrooms} bath`;
        distribution[key] = (distribution[key] || 0) + 1;
      }
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const aNum = parseInt(a.name);
        const bNum = parseInt(b.name);
        return aNum - bNum;
      });
  };

  const getPropertyTypeDistribution = () => {
    if (!properties.length) return [];

    const distribution = {};
    properties.forEach(p => {
      const type = p.propertyType || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={fetchProperties}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();
  const bedroomDistribution = getBedroomDistribution();
  const bathroomDistribution = getBathroomDistribution();
  const propertyTypeDistribution = getPropertyTypeDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Australian Property Market Dashboard</h1>
          <p className="text-gray-600">Real-time insights for property investors</p>
        </header>

        {/* Search Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suburb
              </label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter suburb name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="house">House</option>
                <option value="unit">Unit</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search Properties
              </button>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        {properties.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Found <strong>{properties.length}</strong> properties in <strong>{suburb}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.totalProperties}</p>
                </div>
                <Home className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Bedrooms</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.avgBedrooms}</p>
                </div>
                <Home className="text-orange-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Bathrooms</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.avgBathrooms}</p>
                </div>
                <Building2 className="text-purple-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Parking</p>
                  <p className="text-2xl font-bold text-gray-800">{metrics.withCarspaces}</p>
                </div>
                <MapPin className="text-green-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {bedroomDistribution.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bedroom Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bedroomDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {bathroomDistribution.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Bathroom Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bathroomDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bathroomDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Property List */}
        {properties.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Property Listings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bedrooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bathrooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Land Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.slice(0, 10).map((property, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.bedrooms || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.bathrooms || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.carspaces || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.landSize ? `${property.landSize} m²` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {properties.length > 10 && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Showing 10 of {properties.length} properties
              </p>
            )}
          </div>
        )}

        {/* No data message */}
        {properties.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <Home className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try searching for a different suburb or property type.</p>
          </div>
        )}
      </div>
    </div>
  );
}