import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchCenters = createAsyncThunk(
  'centers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/centers', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCenter = createAsyncThunk(
  'centers/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/centers/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const smartSearchCenters = createAsyncThunk(
  'centers/smartSearch',
  async (searchData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/smart-search', searchData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const centerSlice = createSlice({
  name: 'centers',
  initialState: {
    list: [],
    current: null,
    reviews: [],
    interpretation: null,
    loading: false,
    error: null,
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    clearCurrentCenter: (state) => {
      state.current = null;
      state.reviews = [];
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(fetchCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCenter.fulfilled, (state, action) => {
        state.current = action.payload.data;
        state.reviews = action.payload.reviews || [];
      })
      .addCase(smartSearchCenters.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.interpretation = action.payload.interpretation;
        state.loading = false;
      });
  },
});

export const { clearCurrentCenter, setFilters } = centerSlice.actions;
export default centerSlice.reducer;
