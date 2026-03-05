import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchGoals = createAsyncThunk('goals/list', async (params, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.get('/goals', {
      params: params || {},
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const createGoal = createAsyncThunk('goals/create', async (payload, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.post('/goals', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const updateGoal = createAsyncThunk('goals/update', async ({ id, updates }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.put(`/goals/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    await client.delete(`/goals/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

const goalsSlice = createSlice({
  name: 'goals',
  initialState: { items: [], listStatus: 'idle', createStatus: 'idle', error: null, filter: 'all' },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload
      })
      .addCase(createGoal.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.items = [action.payload, ...state.items]
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.items = state.items.map((g) => (g._id === action.payload._id ? action.payload : g))
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload)
      })
  },
})

export const { setFilter } = goalsSlice.actions
export default goalsSlice.reducer
