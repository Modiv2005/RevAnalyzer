import React, { useState } from 'react';
import { useDatasetStore, Dataset } from '../store/datasetStore';
import { 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  Database,
  Grid
} from 'lucide-react';

export default function UploadCenter() {
  const { datasets, selectedDataset, setDatasets, selectDataset } = useDatasetStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDatasets = async () => {
    const token = localStorage.getItem('bi_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setStatusMsg(null);
    const token = localStorage.getItem('bi_token');
    
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('http://localhost:8000/api/v1/datasets/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "File parsing failed.");

      setStatusMsg({ type: 'success', text: `Successfully ingested ledger "${data.filename}"!` });
      await fetchDatasets();
      selectDataset(data);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || "Upload connection error." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDemo = async () => {
    setIsGeneratingDemo(true);
    setStatusMsg(null);
    const token = localStorage.getItem('bi_token');

    try {
      const res = await fetch('http://localhost:8000/api/v1/datasets/demo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Could not construct standard ledger.");

      setStatusMsg({ type: 'success', text: "Successfully constructed Enterprise Revenue Ledger!" });
      await fetchDatasets();
      selectDataset(data);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const handleDeleteDataset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/api/v1/datasets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: "Dataset removed successfully." });
        await fetchDatasets();
        if (selectedDataset?.id === id) {
          selectDataset(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* DRAG AND DROP UPLOADER */}
        <div className="md:col-span-2 p-8 rounded-3xl border border-darkBorder bg-darkPanel/50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-transparent pointer-events-none"></div>
          
          <UploadCloud className="w-12 h-12 text-gray-500 mb-4 group-hover:text-blue-400 transition-colors duration-300" />
          <h3 className="text-base font-bold text-white font-outfit uppercase tracking-wider mb-2">Ingest Ledger CSV / XLSX</h3>
          <p className="text-xs text-gray-400 mb-6 max-w-xs">Upload transaction logs, quarterly balance ledgers, or expense lists.</p>

          <label className="px-6 py-3 bg-darkBg border border-darkBorder hover:border-blue-500/40 rounded-xl cursor-pointer text-xs font-semibold text-white hover:shadow-lg transition-all duration-200">
            <span>Select Ledger File</span>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls,.json"
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading || isGeneratingDemo}
            />
          </label>
          
          {isUploading && (
            <div className="absolute inset-0 bg-darkPanel/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs font-bold text-white font-outfit uppercase tracking-widest">Ingesting & Profiling Data Schema...</p>
            </div>
          )}
        </div>

        {/* DEMO GENERATOR CARD */}
        <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-600/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 w-fit mb-6">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit uppercase tracking-wider mb-2">Instant Simulations</h3>
            <p className="text-[11px] text-gray-400 leading-normal mb-6">
              No dataset on hand? Auto-generate a beautiful 36-month revenue ledger populated with trend factors, Dec seasonal sales spikes, and custom expense outliers.
            </p>
          </div>

          <button
            onClick={handleGenerateDemo}
            disabled={isGeneratingDemo || isUploading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 glow-cobalt"
          >
            {isGeneratingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Demo Ledger"}
          </button>
        </div>

      </div>

      {/* FEEDBACK STATUS TICKER */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-slide-up ${
          statusMsg.type === 'success' 
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
            : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* INGESTED DATASETS TABLE */}
      <div className="bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Registered Ingestion Archives</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-darkBorder">
            <thead>
              <tr className="text-gray-400 font-bold uppercase tracking-wider bg-darkBg/30">
                <th className="p-4 rounded-l-xl">Archive Details</th>
                <th className="p-4">Size</th>
                <th className="p-4">Dimensions</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-r-xl text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder">
              {datasets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    No active archives uploaded. Create or simulate one above.
                  </td>
                </tr>
              ) : (
                datasets.map((d: Dataset) => {
                  const isSelected = selectedDataset?.id === d.id;
                  return (
                    <tr 
                      key={d.id}
                      onClick={() => selectDataset(d)}
                      className={`hover:bg-white/5 cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-blue-600/5' : ''}`}
                    >
                      <td className="p-4 flex items-center gap-3 font-semibold text-white">
                        <FileSpreadsheet className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                        <span>{d.filename}</span>
                      </td>
                      <td className="p-4 text-gray-400 font-medium">{formatSize(d.file_size)}</td>
                      <td className="p-4 text-gray-400 font-semibold flex items-center gap-2.5">
                        <Grid className="w-3.5 h-3.5 text-gray-500" />
                        <span>{d.row_count} x {d.col_count}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded uppercase ${
                          d.status === 'ready' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : d.status === 'processing'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => handleDeleteDataset(d.id, e)}
                          className="p-2 hover:bg-red-500/15 rounded-lg text-gray-500 hover:text-red-400 transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
