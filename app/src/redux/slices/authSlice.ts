import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  isLoading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ token: string }>) => {
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        isLoading: false,
      };
    },
    setUnauthenticated: (state) => {
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        isLoading: false,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
  },
});

export const { setAuthenticated, setUnauthenticated, setLoading } = authSlice.actions;

export default authSlice.reducer;
