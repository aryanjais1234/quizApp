import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllQuestions } from '../../api/api';

// Async thunk for fetching questions
export const fetchQuestions = createAsyncThunk(
  'question/fetchQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllQuestions();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

const initialState = {
  // Raw data as received from the backend — never mutated by UI actions
  originalFromBackend: [],

  // UI-only state: loading flags, errors, filters, selection
  uiState: {
    loading: false,
    error: null,
    selectedQuestionId: null,
    searchQuery: '',
    selectedCategory: 'all',
    selectedDifficulty: 'all',
  },

  // Working copy the user is editing before saving back to the backend
  modifiedState: null,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    // UI state actions
    setSelectedQuestion(state, action) {
      state.uiState.selectedQuestionId = action.payload;
    },
    setSearchQuery(state, action) {
      state.uiState.searchQuery = action.payload;
    },
    setSelectedCategory(state, action) {
      state.uiState.selectedCategory = action.payload;
    },
    setSelectedDifficulty(state, action) {
      state.uiState.selectedDifficulty = action.payload;
    },
    clearError(state) {
      state.uiState.error = null;
    },

    // Modified state actions
    startEditingQuestion(state, action) {
      const question = state.originalFromBackend.find((q) => q.id === action.payload);
      state.modifiedState = question ? { ...question } : null;
    },
    updateModifiedQuestion(state, action) {
      if (state.modifiedState) {
        state.modifiedState = { ...state.modifiedState, ...action.payload };
      }
    },
    cancelEditingQuestion(state) {
      state.modifiedState = null;
    },

    // Direct backend update
    updateQuestionInStore(state, action) {
      const index = state.originalFromBackend.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.originalFromBackend[index] = action.payload;
      }
      state.modifiedState = null;
    },
    removeQuestionFromStore(state, action) {
      state.originalFromBackend = state.originalFromBackend.filter(
        (q) => q.id !== action.payload
      );
    },
    addQuestionToStore(state, action) {
      state.originalFromBackend.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.uiState.loading = true;
        state.uiState.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.uiState.loading = false;
        state.originalFromBackend = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.uiState.loading = false;
        state.uiState.error = action.payload;
      });
  },
});

export const {
  setSelectedQuestion,
  setSearchQuery,
  setSelectedCategory,
  setSelectedDifficulty,
  clearError,
  startEditingQuestion,
  updateModifiedQuestion,
  cancelEditingQuestion,
  updateQuestionInStore,
  removeQuestionFromStore,
  addQuestionToStore,
} = questionSlice.actions;

// Selectors
export const selectQuestions = (state) => state.question.originalFromBackend;
export const selectQuestionUiState = (state) => state.question.uiState;
export const selectModifiedQuestion = (state) => state.question.modifiedState;

export default questionSlice.reducer;
