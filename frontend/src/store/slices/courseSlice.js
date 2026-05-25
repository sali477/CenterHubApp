import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/courses', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/enrollments', { courseId });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    current: null,
    enrollments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentCourse: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.current = action.payload.data;
        state.loading = false;
      });
  },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
