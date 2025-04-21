```typescript
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent 
} from '@mui/material';
import { useLocationService } from '../../hooks/useLocationService';
import { useAlertService } from '../../hooks/useAlertService';
import { setLocation } from '../../redux/slices/locationSlice';

export const Locations: React.FC = () => {
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const dispatch = useDispatch();
  const locationService = useLocationService();
  const alertService = useAlertService();

  useEffect(() => {
    locationService.getLocations().subscribe({
      next: (locations) => {
        const filteredLocations = locations.filter(
          (location) => !location.ext.hideInMSSP
        );
        setAllLocations(filteredLocations);
        setSelectedLocation(filteredLocations[0].name);
        handleLocationChange(filteredLocations[0].name);
      },
      error: (error) => {
        alertService.errorAlert(error?.error?.error || error?.message);
      }
    });
  }, []);

  const handleLocationChange = (locationName: string) => {
    const location = allLocations.find(loc => loc.name === locationName);
    if (location) {
      dispatch(setLocation({ location: location.number }));
    }
    setSelectedLocation(locationName);
  };

  if (!allLocations.length) return null;

  return (
    <div className="flex flex-col flex-1 items-center">
      <FormControl variant="outlined" className="p-0">
        <Select
          value={selectedLocation}
          onChange={(event: SelectChangeEvent) => 
            handleLocationChange(event.target.value)}
          className="location-select"
          startAdornment={
            <span className="material-symbols-outlined distance-icon">
              distance
            </span>
          }
        >
          {allLocations.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              {option.ext.operator && option.ext.operator !== 'PlayNow'
                ? `${option.ext.operator} - ${option.name}`
                : option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
```