import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<any>;
  type: 'income' | 'expense';
  isLoading?: boolean;
}

interface UploadResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  type,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast.error('Please select a valid CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await onUpload(selectedFile);
      setUploadResult(result.data);

      if (result.success) {
        toast.success(result.message);
        // Close modal after successful upload
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          setUploadResult(null);
        }, 2000);
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    onClose();
  };

  const getCSVTemplate = () => {
    if (type === 'income') {
      return `Work Date,Date,Client Name / Company Name,Bill Amount
"Apr 1, 2025","Apr 8, 2025","Website Development","Lay Leng",22.5
"Apr 2, 2025","Apr 9, 2025","HTML and Tailwind CSS wizard","Immowi International",180`;
    } else {
      return `Work Date,Date,Title,Vendor,Amount
"Apr 1, 2025","Apr 8, 2025","Software Subscription","Adobe",29.99
"Apr 2, 2025","Apr 9, 2025","Office Supplies","Staples",45.50`;
    }
  };

  const downloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload {type === 'income' ? 'Income' : 'Expense'} CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {!selectedFile ? (
              <div>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label className="text-lg font-medium text-gray-700 mb-2 block">
                  Choose CSV file or drag and drop
                </Label>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV files up to 5MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div>
                <FileText className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Change File
                </Button>
              </div>
            )}
          </div>

          {/* Template Download */}
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              disabled={isUploading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Upload Results</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Processed:</span>
                  <span className="font-medium">{uploadResult.totalProcessed}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Successfully Created:</span>
                  <span className="font-medium">{uploadResult.successCount}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Errors:</span>
                  <span className="font-medium">{uploadResult.errorCount}</span>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Errors Found:</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs">
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-red-600 mb-1">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <div className="text-gray-500">
                        ... and {uploadResult.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              className="flex-1"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadModal;