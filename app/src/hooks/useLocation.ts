import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setLocation, clearLocation } from '../redux/slices/locationSlice';

export const useLocation = () => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.location.location);

  const updateLocation = (newLocation: string) => {
    dispatch(setLocation({ location: newLocation }));
  };

  const resetLocation = () => {
    dispatch(clearLocation());
  };

  return {
    location,
    updateLocation,
    resetLocation
  };
};
