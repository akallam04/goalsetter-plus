import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import client from '../../api/client'

const saved = localStorage.getItem('auth')
const initialAuth = saved ? JSON.parse(saved) : { user: null, token: null }

export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const { data } = await client.post('/users', payload)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const { data } = await client.post('/users/login', payload)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, thunkAPI) => {
  try {
    const { data } = await client.put('/users/me', payload)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initialAuth.user, token: initialAuth.token, status: 'idle', error: null },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('auth')
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      state.status = 'succeeded'
      state.error = null
      state.user = {
        _id: action.payload._id,
        name: action.payload.name,
        email: action.payload.email,
        avatar: action.payload.avatar || '',
      }
      state.token = action.payload.token
      localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }))
    }

    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => fulfilled(state, action))
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => fulfilled(state, action))
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          avatar: action.payload.avatar || '',
        }
        localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }))
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
