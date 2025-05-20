
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Cloud, FileText, Image, Upload, Folder, Download, Trash, Video, File as FileIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import fileService, { FileData } from "@/services/fileService";
import { format } from "date-fns";

const CloudSpace = () => {
  const navigate = useNavigate();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch files on component mount and when active tab changes
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        // Only pass file_type if not "all"
        const fileType = activeTab !== "all" ? activeTab : undefined;
        const userFiles = await fileService.getUserFiles(fileType);
        setFiles(userFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to load files");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
  }, [activeTab]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingFile(true);
      const fileToUpload = e.target.files[0];
      
      try {
        const uploadedFile = await fileService.uploadFile(fileToUpload);
        toast.success("File uploaded successfully");
        
        // Refresh file list
        const updatedFiles = await fileService.getUserFiles(
          activeTab !== "all" ? activeTab : undefined
        );
        setFiles(updatedFiles);
        
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
      } finally {
        setUploadingFile(false);
        // Reset the input
        e.target.value = '';
      }
    }
  };
  
  const handleDownload = (fileId: string, fileName: string) => {
    try {
      // Get the download URL with token
      const downloadUrl = fileService.getFileDownloadUrl(fileId);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName}...`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };
  
  const handleDelete = async (fileId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await fileService.deleteFile(fileId);
        toast.success(`${fileName} deleted successfully`);
        
        // Remove file from state
        setFiles(files.filter(file => file.id !== fileId));
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete file");
      }
    }
  };

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return <FileText size={18} className="text-amber-500" />;
      case 'image':
        return <Image size={18} className="text-green-500" />;
      case 'video':
        return <Video size={18} className="text-blue-500" />;
      default:
        return <FileIcon size={18} className="text-gray-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="mb-0 text-3xl font-bold text-blue-900">My Cloud Space</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById("file-upload")?.click()}
              className="flex items-center gap-2"
              disabled={uploadingFile}
            >
              {uploadingFile ? "Uploading..." : (
                <>
                  <Upload size={16} />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {activeTab === "all" ? "My Files" : 
                   activeTab === "document" ? "Documents" : 
                   activeTab === "image" ? "Images" : "Videos"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading files...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        <div className="grid grid-cols-12 p-3 text-sm font-medium text-muted-foreground">
                          <div className="col-span-6">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Size</div>
                          <div className="col-span-2">Actions</div>
                        </div>
                        
                        {files.map((file) => (
                          <div key={file.id} className="grid grid-cols-12 p-3 items-center hover:bg-muted/50">
                            <div className="col-span-6 flex items-center gap-2">
                              {getFileIcon(file.file_type)}
                              <span className="font-medium truncate">{file.original_filename}</span>
                            </div>
                            <div className="col-span-2 text-sm text-muted-foreground capitalize">
                              {file.file_type}
                            </div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {fileService.formatFileSize(file.file_size)}
                            </div>
                            <div className="col-span-2 flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDownload(file.id, file.original_filename)}
                              >
                                <Download size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(file.id, file.original_filename)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Cloud className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No files yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Upload files to see them here
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          Upload a file
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CloudSpace;