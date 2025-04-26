import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, MapPin } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';
import { useLocationService } from '../../hooks/useLocationService';
import { setLocation } from '../../redux/slices/locationSlice';
import useAlertService from '@/hooks/useAlertService';

export const Locations: React.FC = () => {
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  // const [selectedLocation, setSelectedLocation] = useState<string>('GCE - Cascades Casino Langley');
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const locationService = useLocationService();
  const alertService = useAlertService();

  useEffect(() => {
    getLocations();
  }, []);

  const getLocations = async () => {
    try {
      const locations: any = await locationService.getLocations();
      const filteredLocations = locations.filter(
        (location: any) => !location?.ext?.hideInMSSP
      );
      setAllLocations(filteredLocations);
      setSelectedLocation(filteredLocations[0].name);
      dispatch(setLocation({ location: filteredLocations[0].number }));
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  }

  const handleLocationChange = (locationName: string) => {
    const location = allLocations.find(loc => loc.name === locationName);
    if (location) {
      dispatch(setLocation({ location: location.number }));
    }
    setSelectedLocation(locationName);
  };

  if (!allLocations.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-64 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <div className="flex items-center">
          {/* <svg
            className="w-5 h-5 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg> */}

          <svg
            width="20.000000pt" height="20.000000pt" viewBox="0 0 20 23">
            <g transform="translate(0.000000,20.000000) scale(0.023000,-0.023000)"
              fill="#000000" stroke="none">
              <path d="M194 671 c-72 -33 -111 -107 -100 -189 6 -46 28 -90 80 -156 16 -21
                        42 -62 56 -90 15 -28 33 -51 40 -51 7 0 25 23 40 51 14 28 40 69 56 90 95 122
                        108 216 42 300 -27 33 -92 64 -138 64 -19 0 -53 -9 -76 -19z m157 -77 c37 -35
                        46 -83 26 -135 -15 -37 -96 -158 -107 -158 -10 0 -91 118 -106 155 -27 65 0
                        138 61 165 35 15 95 3 126 -27z"/>
              <path d="M116 225 c-47 -43 -26 -93 51 -119 122 -42 283 2 283 77 0 21 -46 67
                      -67 67 -23 0 -34 -43 -15 -58 13 -10 13 -15 3 -25 -17 -17 -186 -17 -203 1
                      -11 11 -10 15 3 22 22 13 13 60 -11 60 -9 0 -29 -11 -44 -25z"/>
            </g>
          </svg>

          <span className="truncate">{selectedLocation}</span>
        </div>
        <svg
          className="w-5 h-5 ml-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 mt-1 bg-white rounded-md shadow-lg">
          <ul className="py-1 overflow-auto text-sm max-h-60">
            {allLocations.map((location) => (
              <li
                key={location.id}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedLocation === location.name ? 'bg-orange-50' : ''
                  }`}
                onClick={() => {
                  setSelectedLocation(location.name);
                  setIsOpen(false);
                  handleLocationChange(location.name)
                }}
              >
                <span className="truncate">{location.name}</span>
                {selectedLocation === location.name && (
                  <Check className="w-4 h-4 text-orange-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};