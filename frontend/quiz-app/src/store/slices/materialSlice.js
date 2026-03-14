import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyMaterials, deleteMaterial } from '../../api/api';

// Async thunk for fetching materials
export const fetchMaterials = createAsyncThunk(
  'material/fetchMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyMaterials();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const deleteMaterialThunk = createAsyncThunk(
  'material/deleteMaterial',
  async (id, { rejectWithValue }) => {
    try {
      await deleteMaterial(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete material');
    }
  }
);

const initialState = {
  // Raw data as received from the backend — never mutated by UI actions
  originalFromBackend: [],

  // UI-only state: loading flags, errors, editing state
  uiState: {
    loading: false,
    error: null,
    uploadSuccess: false,
    uploadError: null,
    uploading: false,
    editingTranscriptId: null,
    savingTranscript: false,
    activeCategory: 'all',
  },

  // Working copy the user is editing before saving back to the backend
  modifiedState: null,
};

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    // UI state actions
    setUploadSuccess(state, action) {
      state.uiState.uploadSuccess = action.payload;
    },
    setUploadError(state, action) {
      state.uiState.uploadError = action.payload;
    },
    setUploading(state, action) {
      state.uiState.uploading = action.payload;
    },
    setEditingTranscript(state, action) {
      state.uiState.editingTranscriptId = action.payload;
    },
    setSavingTranscript(state, action) {
      state.uiState.savingTranscript = action.payload;
    },
    setActiveCategory(state, action) {
      state.uiState.activeCategory = action.payload;
    },
    clearError(state) {
      state.uiState.error = null;
      state.uiState.uploadError = null;
    },

    // Modified state actions — editing a material's metadata
    startEditingMaterial(state, action) {
      const material = state.originalFromBackend.find((m) => m.id === action.payload);
      state.modifiedState = material ? { ...material } : null;
    },
    updateModifiedMaterial(state, action) {
      if (state.modifiedState) {
        state.modifiedState = { ...state.modifiedState, ...action.payload };
      }
    },
    cancelEditingMaterial(state) {
      state.modifiedState = null;
    },

    // Direct backend update
    addMaterialToStore(state, action) {
      state.originalFromBackend.unshift(action.payload);
    },
    updateMaterialInStore(state, action) {
      const index = state.originalFromBackend.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.originalFromBackend[index] = action.payload;
      }
      state.modifiedState = null;
      state.uiState.editingTranscriptId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMaterials
      .addCase(fetchMaterials.pending, (state) => {
        state.uiState.loading = true;
        state.uiState.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.uiState.loading = false;
        state.originalFromBackend = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.uiState.loading = false;
        state.uiState.error = action.payload;
      })
      // deleteMaterial
      .addCase(deleteMaterialThunk.fulfilled, (state, action) => {
        state.originalFromBackend = state.originalFromBackend.filter(
          (m) => m.id !== action.payload
        );
      })
      .addCase(deleteMaterialThunk.rejected, (state, action) => {
        state.uiState.error = action.payload;
      });
  },
});

export const {
  setUploadSuccess,
  setUploadError,
  setUploading,
  setEditingTranscript,
  setSavingTranscript,
  setActiveCategory,
  clearError,
  startEditingMaterial,
  updateModifiedMaterial,
  cancelEditingMaterial,
  addMaterialToStore,
  updateMaterialInStore,
} = materialSlice.actions;

// Selectors
export const selectMaterials = (state) => state.material.originalFromBackend;
export const selectMaterialUiState = (state) => state.material.uiState;
export const selectModifiedMaterial = (state) => state.material.modifiedState;

export default materialSlice.reducer;
