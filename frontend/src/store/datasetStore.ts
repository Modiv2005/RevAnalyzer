import { create } from 'zustand';

export interface Dataset {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  status: string;
  row_count: number;
  col_count: number;
  columns_json: string[];
  created_at: string;
}

export interface ColumnMetadata {
  col_name: string;
  data_type: string;
  missing_count: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  unique_count: number;
}

interface DatasetState {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  metadata: ColumnMetadata[];
  isLoading: boolean;
  error: string | null;
  setDatasets: (data: Dataset[]) => void;
  selectDataset: (dataset: Dataset | null) => void;
  setMetadata: (meta: ColumnMetadata[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  datasets: [],
  selectedDataset: null,
  metadata: [],
  isLoading: false,
  error: null,
  setDatasets: (data) => set({ datasets: data }),
  selectDataset: (dataset) => set({ selectedDataset: dataset, metadata: [] }), // Reset metadata on select
  setMetadata: (meta) => set({ metadata: meta }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err })
}));
