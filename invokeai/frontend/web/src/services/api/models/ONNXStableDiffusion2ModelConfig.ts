/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseModelType } from './BaseModelType';
import type { ModelError } from './ModelError';
import type { ModelVariantType } from './ModelVariantType';
import type { SchedulerPredictionType } from './SchedulerPredictionType';

export type ONNXStableDiffusion2ModelConfig = {
  name: string;
  base_model: BaseModelType;
  type: 'onnx';
  path: string;
  description?: string;
  model_format: null;
  error?: ModelError;
  variant: ModelVariantType;
  prediction_type: SchedulerPredictionType;
  upcast_attention: boolean;
};
