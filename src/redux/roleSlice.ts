import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type RoleState = {
  user: boolean;
  admin: boolean;
  /** Larger typography in the user flow when Simplified UI is enabled. */
  simplifiedUi: boolean;
  /** User font-size preference: added to every FontSize.VALUE (points). */
  fontScale: number;
  /** Read content aloud */
  ttsEnabled: boolean;
  /** Voice commands navigation control */
  voiceCommandsEnabled: boolean;
  /** Brain-Computer Interface / Assistive Switch Access */
  bciEnabled: boolean;
};

const initialState: RoleState = {
  user: true,
  admin: false,
  simplifiedUi: false,
  fontScale: 0,
  ttsEnabled: false,
  voiceCommandsEnabled: false,
  bciEnabled: false,
};

const roleSlice = createSlice({
  name: 'role',
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
    setTtsEnabled: (state, action: PayloadAction<boolean>) => {
      state.ttsEnabled = action.payload;
    },
    setVoiceCommandsEnabled: (state, action: PayloadAction<boolean>) => {
      state.voiceCommandsEnabled = action.payload;
    },
    setBciEnabled: (state, action: PayloadAction<boolean>) => {
      state.bciEnabled = action.payload;
    },
    setAllAccessibility: (state, action: PayloadAction<Partial<RoleState>>) => {
      if (action.payload.simplifiedUi !== undefined) state.simplifiedUi = action.payload.simplifiedUi;
      if (action.payload.fontScale !== undefined) state.fontScale = action.payload.fontScale;
      if (action.payload.ttsEnabled !== undefined) state.ttsEnabled = action.payload.ttsEnabled;
      if (action.payload.voiceCommandsEnabled !== undefined) state.voiceCommandsEnabled = action.payload.voiceCommandsEnabled;
      if (action.payload.bciEnabled !== undefined) state.bciEnabled = action.payload.bciEnabled;
    },
  },
});

export const {
  selectUser,
  selectAdmin,
  setSimplifiedUi,
  setFontScale,
  setTtsEnabled,
  setVoiceCommandsEnabled,
  setBciEnabled,
  setAllAccessibility,
} = roleSlice.actions;
export default roleSlice.reducer;

