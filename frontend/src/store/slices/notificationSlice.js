import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n._id === action.payload._id);
        if (index !== -1) {
          state.list[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
