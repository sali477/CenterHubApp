import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    chatbotOpen: false,
    searchQuery: '',
    location: null,
    filters: {
      distance: 50,
      rating: 0,
      price: '',
      subject: '',
      popularity: false,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleChatbot: (state) => {
      state.chatbotOpen = !state.chatbotOpen;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        distance: 50,
        rating: 0,
        price: '',
        subject: '',
        popularity: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  toggleChatbot,
  setSearchQuery,
  setLocation,
  setFilters,
  resetFilters,
} = uiSlice.actions;
export default uiSlice.reducer;
