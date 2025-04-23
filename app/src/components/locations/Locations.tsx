import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MapPin } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';
import { useLocationService } from '../../hooks/useLocationService';
import { setLocation } from '../../redux/slices/locationSlice';
import useAlertService from '@/hooks/useAlertService';

export const Locations: React.FC = () => {
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const dispatch = useDispatch();
  const locationService = useLocationService();
  const alertService = useAlertService();

  useEffect(() => {
    getLocations();
  }, []);

  const getLocations = async () =>{
    try {
      const locations: any = await locationService.getLocations();
      const filteredLocations = locations.filter(
        (location: any) => !location?.ext?.hideInMSSP
      );
      setAllLocations(filteredLocations);
      setSelectedLocation(filteredLocations[0].name);
      handleLocationChange(filteredLocations[0].name);
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
    <div className="flex items-center gap-2">
      <MapPin className="w-5 h-5 text-[#475467]" />
      <Select
        value={selectedLocation}
        onChange={(e) => handleLocationChange(e.target.value)}
        className="min-w-[220px]"
        variant="outlined"
        size="small"
        sx={{
          height: '40px',
          '.MuiOutlinedInput-input': {
            padding: '8px 14px',
            fontSize: '14px',
            color: '#475467',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E8E7E4',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D0D5DD',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e86a10',
          },
        }}
      >
        {allLocations.map((option) => (
          <MenuItem 
            key={option.name} 
            value={option.name}
            sx={{
              fontSize: '14px',
              color: '#475467',
              '&:hover': {
                backgroundColor: '#FFF7ED',
              },
            }}
          >
            {option.ext.operator && option.ext.operator !== 'PlayNow'
              ? `${option.ext.operator} - ${option.name}`
              : option.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};