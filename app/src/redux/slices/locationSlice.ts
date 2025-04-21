import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  location: string;
}

const initialState: LocationState = {
  location: ''
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ location: string }>) => {
      state.location = action.payload.location;
    },
    clearLocation: () => initialState
  }
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
