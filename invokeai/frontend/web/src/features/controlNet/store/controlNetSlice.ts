import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/store/store';
import { ImageDTO } from 'services/api';
import {
  ControlNetProcessorType,
  RequiredCannyImageProcessorInvocation,
  RequiredControlNetProcessorNode,
} from './types';
import {
  CONTROLNET_MODELS,
  CONTROLNET_PROCESSORS,
  ControlNetModel,
} from './constants';
import { controlNetImageProcessed } from './actions';

export const initialControlNet: Omit<ControlNetConfig, 'controlNetId'> = {
  isEnabled: true,
  model: CONTROLNET_MODELS[0],
  weight: 1,
  beginStepPct: 0,
  endStepPct: 1,
  controlImage: null,
  isPreprocessed: false,
  processedControlImage: null,
  processorNode: CONTROLNET_PROCESSORS.canny_image_processor
    .default as RequiredCannyImageProcessorInvocation,
};

export type ControlNetConfig = {
  controlNetId: string;
  isEnabled: boolean;
  model: ControlNetModel;
  weight: number;
  beginStepPct: number;
  endStepPct: number;
  controlImage: ImageDTO | null;
  isPreprocessed: boolean;
  processedControlImage: ImageDTO | null;
  processorNode: RequiredControlNetProcessorNode;
};

export type ControlNetState = {
  controlNets: Record<string, ControlNetConfig>;
  isEnabled: boolean;
  isProcessingControlImage: boolean;
};

export const initialControlNetState: ControlNetState = {
  controlNets: {},
  isEnabled: false,
  isProcessingControlImage: false,
};

export const controlNetSlice = createSlice({
  name: 'controlNet',
  initialState: initialControlNetState,
  reducers: {
    isControlNetEnabledToggled: (state) => {
      state.isEnabled = !state.isEnabled;
    },
    controlNetAdded: (
      state,
      action: PayloadAction<{
        controlNetId: string;
        controlNet?: ControlNetConfig;
      }>
    ) => {
      const { controlNetId, controlNet } = action.payload;
      state.controlNets[controlNetId] = {
        ...(controlNet ?? initialControlNet),
        controlNetId,
      };
    },
    controlNetAddedFromImage: (
      state,
      action: PayloadAction<{ controlNetId: string; controlImage: ImageDTO }>
    ) => {
      const { controlNetId, controlImage } = action.payload;
      state.controlNets[controlNetId] = {
        ...initialControlNet,
        controlNetId,
        controlImage,
      };
    },
    controlNetRemoved: (
      state,
      action: PayloadAction<{ controlNetId: string }>
    ) => {
      const { controlNetId } = action.payload;
      delete state.controlNets[controlNetId];
    },
    controlNetToggled: (
      state,
      action: PayloadAction<{ controlNetId: string }>
    ) => {
      const { controlNetId } = action.payload;
      state.controlNets[controlNetId].isEnabled =
        !state.controlNets[controlNetId].isEnabled;
    },
    controlNetImageChanged: (
      state,
      action: PayloadAction<{
        controlNetId: string;
        controlImage: ImageDTO | null;
      }>
    ) => {
      const { controlNetId, controlImage } = action.payload;
      state.controlNets[controlNetId].controlImage = controlImage;
      state.controlNets[controlNetId].processedControlImage = null;
      if (
        controlImage !== null &&
        !state.controlNets[controlNetId].isPreprocessed
      ) {
        state.isProcessingControlImage = true;
      }
    },
    isControlNetImagePreprocessedToggled: (
      state,
      action: PayloadAction<{ controlNetId: string }>
    ) => {
      const { controlNetId } = action.payload;
      state.controlNets[controlNetId].isPreprocessed =
        !state.controlNets[controlNetId].isPreprocessed;
    },
    controlNetProcessedImageChanged: (
      state,
      action: PayloadAction<{
        controlNetId: string;
        processedControlImage: ImageDTO | null;
      }>
    ) => {
      const { controlNetId, processedControlImage } = action.payload;
      state.controlNets[controlNetId].processedControlImage =
        processedControlImage;
      state.isProcessingControlImage = false;
    },
    controlNetModelChanged: (
      state,
      action: PayloadAction<{ controlNetId: string; model: ControlNetModel }>
    ) => {
      const { controlNetId, model } = action.payload;
      state.controlNets[controlNetId].model = model;
    },
    controlNetWeightChanged: (
      state,
      action: PayloadAction<{ controlNetId: string; weight: number }>
    ) => {
      const { controlNetId, weight } = action.payload;
      state.controlNets[controlNetId].weight = weight;
    },
    controlNetBeginStepPctChanged: (
      state,
      action: PayloadAction<{ controlNetId: string; beginStepPct: number }>
    ) => {
      const { controlNetId, beginStepPct } = action.payload;
      state.controlNets[controlNetId].beginStepPct = beginStepPct;
    },
    controlNetEndStepPctChanged: (
      state,
      action: PayloadAction<{ controlNetId: string; endStepPct: number }>
    ) => {
      const { controlNetId, endStepPct } = action.payload;
      state.controlNets[controlNetId].endStepPct = endStepPct;
    },
    controlNetProcessorParamsChanged: (
      state,
      action: PayloadAction<{
        controlNetId: string;
        changes: Omit<
          Partial<RequiredControlNetProcessorNode>,
          'id' | 'type' | 'is_intermediate'
        >;
      }>
    ) => {
      const { controlNetId, changes } = action.payload;
      const processorNode = state.controlNets[controlNetId].processorNode;
      state.controlNets[controlNetId].processorNode = {
        ...processorNode,
        ...changes,
      };
    },
    controlNetProcessorTypeChanged: (
      state,
      action: PayloadAction<{
        controlNetId: string;
        processorType: ControlNetProcessorType;
      }>
    ) => {
      const { controlNetId, processorType } = action.payload;
      state.controlNets[controlNetId].processorNode = CONTROLNET_PROCESSORS[
        processorType
      ].default as RequiredControlNetProcessorNode;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(controlNetImageProcessed, (state, action) => {
      if (
        state.controlNets[action.payload.controlNetId].controlImage !== null
      ) {
        state.isProcessingControlImage = true;
      }
    });
  },
});

export const {
  isControlNetEnabledToggled,
  controlNetAdded,
  controlNetAddedFromImage,
  controlNetRemoved,
  controlNetImageChanged,
  isControlNetImagePreprocessedToggled,
  controlNetProcessedImageChanged,
  controlNetToggled,
  controlNetModelChanged,
  controlNetWeightChanged,
  controlNetBeginStepPctChanged,
  controlNetEndStepPctChanged,
  controlNetProcessorParamsChanged,
  controlNetProcessorTypeChanged,
} = controlNetSlice.actions;

export default controlNetSlice.reducer;

export const controlNetSelector = (state: RootState) => state.controlNet;
