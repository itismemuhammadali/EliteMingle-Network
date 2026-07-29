import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type RoleState = {
  user: boolean;
  admin: boolean;
  /** Larger typography in the user flow when Simplified UI is enabled. */
  simplifiedUi: boolean;
  /** User font-size preference: added to every FontSize.VALUE (points). */
  fontScale: number;
};

const initialState: RoleState = {
  user: true,
  admin: false,
  simplifiedUi: false,
  fontScale: 0,
};

const roleSlice = createSlice({
  name: 'role',
  // Root state shape is { user, admin, simplifiedUi }
  initialState,
  reducers: {
    selectUser: state => {
      state.user = true;
      state.admin = false;
    },
    selectAdmin: state => {
      state.user = false;
      state.admin = true;
    },
    setSimplifiedUi: (state, action: PayloadAction<boolean>) => {
      state.simplifiedUi = action.payload;
    },
    setFontScale: (state, action: PayloadAction<number>) => {
      state.fontScale = action.payload;
    },
  },
});

export const { selectUser, selectAdmin, setSimplifiedUi, setFontScale } =
  roleSlice.actions;
export default roleSlice.reducer;

