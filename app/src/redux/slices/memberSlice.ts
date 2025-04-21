import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Member } from '../../types';

const initialState: Member = {} as Member;

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<{ member: Member }>) => {
      return { ...action.payload.member };
    },
    clearMember: () => initialState
  }
});

export const { addMember, clearMember } = memberSlice.actions;
export default memberSlice.reducer;
