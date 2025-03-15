import type React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle2, UploadCloud } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [uploadStats, setUploadStats] = useState<{
    count?: number;
    inserted?: number;
    duplicates?: number;
    invalid?: number;
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "text/csv") {
        setErrorMessage("Please upload a CSV file")
        setUploadStatus("error")
        return
      }
      setFile(selectedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress since fetch doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 5
        })
      }, 200)

      // Make the actual API call
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json() as {
        count?: number;
        inserted?: number;
        duplicates?: number;
        invalid?: number;
      };
      setUploadStatus("success")
      setUploadStats({
        count: data.count,
        inserted: data.inserted,
        duplicates: data.duplicates,
        invalid: data.invalid
      })
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : 'Error processing CSV file')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
    setUploadProgress(0)
    setUploadStats(null)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Stash Data</CardTitle>
        <CardDescription>Upload a CSV file with stash transaction data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <h3 className="font-medium text-lg">Drag and drop or click to upload</h3>
              <p className="text-sm text-muted-foreground">Upload a CSV file with the required format</p>
              {file && (
                <div className="mt-2 text-sm font-medium">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
              <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "success" && (
            <Alert variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your CSV file has been successfully uploaded and processed.
                {uploadStats && (
                  <div className="mt-2 text-sm">
                    <p>Records processed: {uploadStats.count}</p>
                    <p>Records inserted: {uploadStats.inserted}</p>
                    <p>Duplicates skipped: {uploadStats.duplicates}</p>
                    <p>Invalid records: {uploadStats.invalid}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload CSV"}
            </Button>
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="font-medium mb-2">Required CSV Format</h4>
            <p className="text-sm text-muted-foreground mb-2">Your CSV file must include the following columns:</p>
            <div className="text-sm bg-muted p-3 rounded-md font-mono">Date,Id,League,Account,Action,Stash,Item</div>
            <p className="text-sm text-muted-foreground mt-2">Where action must be one of: added, removed, modified</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

