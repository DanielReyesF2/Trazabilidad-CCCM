import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  document: {
    id: number;
    fileName: string;
    fileSize: number;
    processed: boolean;
  };
  recordsProcessed?: number;
  wasteData?: any;
  message: string;
}

interface DocumentUploadProps {
  clientId: number;
  onUploadSuccess?: (result: UploadResult) => void;
}

export function DocumentUpload({ clientId, onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation<UploadResult, Error, File>({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId.toString());

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data: UploadResult) => {
      console.log('Upload successful:', data);
      
      toast({
        title: "Archivo procesado exitosamente",
        description: `${data.recordsProcessed || 0} registros de datos procesados desde ${data.document.fileName}`,
      });

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/waste-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Reset component
      setSelectedFile(null);
      
      // Callback opcional
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast({
        title: "Error al procesar archivo",
        description: error.message || "No se pudo procesar el archivo. Verifica el formato.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['text/csv', 'application/csv', 'application/pdf'];
    const allowedExtensions = ['.csv', '.pdf'];
    
    const isAllowedType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isAllowedType) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos CSV y PDF",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no puede ser mayor a 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isCSV = selectedFile?.name.toLowerCase().endsWith('.csv');
  const isPDF = selectedFile?.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-anton text-gray-800 uppercase tracking-wide mb-2">
          Cargar Datos desde Documento
        </h3>
        <p className="text-sm text-gray-600">
          Sube archivos CSV o PDF con datos de residuos para procesamiento automático
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {isCSV ? (
                <FileSpreadsheet className="w-12 h-12 text-green-600" />
              ) : isPDF ? (
                <FileText className="w-12 h-12 text-red-600" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-medium text-gray-900">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-[#b5e951] hover:bg-[#a8d147] text-[#273949]"
              >
                {uploadMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#273949] border-t-transparent"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Procesar Archivo</span>
                  </div>
                )}
              </Button>
              
              <Button variant="outline" onClick={clearFile}>
                Cancelar
              </Button>
            </div>

            {isCSV && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">Archivo CSV detectado</div>
                    <div className="text-blue-700">
                      El sistema procesará automáticamente los datos de residuos mensuales
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">
                Arrastra archivos aquí o haz clic para seleccionar
              </div>
              <div className="text-sm text-gray-500">
                Formatos soportados: CSV, PDF (máx. 10MB)
              </div>
            </div>

            <div>
              <input
                type="file"
                accept=".csv,.pdf,application/pdf,text/csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Format Guide */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Formato esperado para CSV:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• <strong>Columnas requeridas:</strong> Fecha, Orgánicos, Inorgánicos, Reciclables</div>
          <div>• <strong>Formato de fecha:</strong> YYYY-MM-DD o separar Año/Mes</div>
          <div>• <strong>Unidades:</strong> Toneladas (se aceptan decimales)</div>
          <div>• <strong>Separador:</strong> Coma (,) o punto y coma (;)</div>
        </div>
      </div>
    </div>
  );
}