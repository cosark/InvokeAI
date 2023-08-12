import { RootState } from 'app/store/store';
import { NonNullableGraph } from 'features/nodes/types/types';
import { MetadataAccumulatorInvocation } from 'services/api/types';
import {
  CANVAS_IMAGE_TO_IMAGE_GRAPH,
  CANVAS_INPAINT_GRAPH,
  CANVAS_OUTPAINT_GRAPH,
  CANVAS_OUTPUT,
  CANVAS_TEXT_TO_IMAGE_GRAPH,
  IMAGE_TO_IMAGE_GRAPH,
  IMAGE_TO_LATENTS,
  INPAINT_IMAGE,
  LATENTS_TO_IMAGE,
  MAIN_MODEL_LOADER,
  METADATA_ACCUMULATOR,
  ONNX_MODEL_LOADER,
  TEXT_TO_IMAGE_GRAPH,
  VAE_LOADER,
} from './constants';

export const addVAEToGraph = (
  state: RootState,
  graph: NonNullableGraph,
  modelLoaderNodeId: string = MAIN_MODEL_LOADER
): void => {
  const { vae } = state.generation;

  const isAutoVae = !vae;
  const metadataAccumulator = graph.nodes[METADATA_ACCUMULATOR] as
    | MetadataAccumulatorInvocation
    | undefined;

  if (!isAutoVae) {
    graph.nodes[VAE_LOADER] = {
      type: 'vae_loader',
      id: VAE_LOADER,
      is_intermediate: true,
      vae_model: vae,
    };
  }
  const isOnnxModel = modelLoaderNodeId == ONNX_MODEL_LOADER;

  if (graph.id === TEXT_TO_IMAGE_GRAPH || graph.id === IMAGE_TO_IMAGE_GRAPH) {
    graph.edges.push({
      source: {
        node_id: isAutoVae ? modelLoaderNodeId : VAE_LOADER,
        field: isAutoVae && isOnnxModel ? 'vae_decoder' : 'vae',
      },
      destination: {
        node_id: LATENTS_TO_IMAGE,
        field: 'vae',
      },
    });
  }

  if (
    graph.id === CANVAS_TEXT_TO_IMAGE_GRAPH ||
    graph.id === CANVAS_IMAGE_TO_IMAGE_GRAPH
  ) {
    graph.edges.push({
      source: {
        node_id: isAutoVae ? modelLoaderNodeId : VAE_LOADER,
        field: isAutoVae && isOnnxModel ? 'vae_decoder' : 'vae',
      },
      destination: {
        node_id: CANVAS_OUTPUT,
        field: 'vae',
      },
    });
  }

  if (
    graph.id === IMAGE_TO_IMAGE_GRAPH ||
    graph.id === CANVAS_IMAGE_TO_IMAGE_GRAPH
  ) {
    graph.edges.push({
      source: {
        node_id: isAutoVae ? modelLoaderNodeId : VAE_LOADER,
        field: isAutoVae && isOnnxModel ? 'vae_decoder' : 'vae',
      },
      destination: {
        node_id: IMAGE_TO_LATENTS,
        field: 'vae',
      },
    });
  }

  if (graph.id === CANVAS_INPAINT_GRAPH || graph.id == CANVAS_OUTPAINT_GRAPH) {
    graph.edges.push(
      {
        source: {
          node_id: isAutoVae ? modelLoaderNodeId : VAE_LOADER,
          field: isAutoVae && isOnnxModel ? 'vae_decoder' : 'vae',
        },
        destination: {
          node_id: INPAINT_IMAGE,
          field: 'vae',
        },
      },
      {
        source: {
          node_id: isAutoVae ? modelLoaderNodeId : VAE_LOADER,
          field: isAutoVae && isOnnxModel ? 'vae_decoder' : 'vae',
        },
        destination: {
          node_id: LATENTS_TO_IMAGE,
          field: 'vae',
        },
      }
    );
  }

  if (vae && metadataAccumulator) {
    metadataAccumulator.vae = vae;
  }
};
