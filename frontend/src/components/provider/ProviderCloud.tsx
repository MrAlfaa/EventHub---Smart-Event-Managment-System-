import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { Cloud, Folder, Image, File, Trash2, Plus, RefreshCw, Upload, MoreVertical, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import cloudService, { CloudFile, CloudStats } from "@/services/cloudService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/utils/dateUtils";

const ProviderCloud = () => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("default");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<CloudStats | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CloudFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 30;
  
  // Load files, folders and stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [filesData, foldersData, statsData] = await Promise.all([
        cloudService.getFiles(currentFolder, limit, page * limit),
        cloudService.getFolders(),
        cloudService.getStats()
      ]);
      
      setFiles(filesData.files);
      setFolders(foldersData);
      setStats(statsData);
      setTotalFiles(filesData.total);
      
    } catch (error) {
      toast.error("Failed to load cloud data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, page]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // File upload handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Convert FileList to Array for uploading
      const fileArray = Array.from(files);
      
      // Simulate progress (since we don't have real-time progress from the API)
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload the files
      await cloudService.uploadFiles(fileArray, currentFolder);
      
      // Complete the progress bar
      clearInterval(timer);
      setUploadProgress(100);
      
      // Refresh the file list
      await loadData();
      
      toast.success(`Uploaded ${fileArray.length} files successfully`);
      
      // Reset upload state after a brief delay to show 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to upload files");
      console.error(error);
      setIsUploading(false);
      setUploadProgress(0);
    }
    
    // Clear the input
    event.target.value = '';
  };
  
  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    
    try {
      await cloudService.createFolder(newFolderName.trim());
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      loadData();
      toast.success(`Folder '${newFolderName}' created successfully`);
    } catch (error) {
      toast.error("Failed to create folder");
      console.error(error);
    }
  };
  
  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    try {
      await cloudService.deleteFile(fileId);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully");
      loadData(); // Refresh stats
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };
  
  // Delete folder
  const handleDeleteFolder = async (folderName: string) => {
    if (folderName === "default") {
      toast.error("Cannot delete default folder");
      return;
    }
    
    const hasFiles = files.some(file => file.folder === folderName);
    
    try {
      if (hasFiles) {
        const confirmed = window.confirm(
          `Folder '${folderName}' contains files. Are you sure you want to delete it and all its contents?`
        );
        if (!confirmed) return;
        
        await cloudService.deleteFolder(folderName, true);
      } else {
        await cloudService.deleteFolder(folderName);
      }
      
      setFolders((prevFolders) => prevFolders.filter((f) => f !== folderName));
      toast.success(`Folder '${folderName}' deleted successfully`);
      
      if (currentFolder === folderName) {
        setCurrentFolder("default");
      }
      
      loadData();
    } catch (error) {
      toast.error("Failed to delete folder");
      console.error(error);
    }
  };
  
  // Filter files by search query
  const filteredFiles = files.filter(file => 
    file.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // For pagination
  const hasMoreFiles = (page + 1) * limit < totalFiles;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cloud Storage</h2>
        
        <div className="flex space-x-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for your new folder
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>Create Folder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="relative">
            <Input
              type="file"
              id="fileUpload"
              multiple
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button variant="default" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      
      {isUploading && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Uploading files...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Cloud className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl">Storage Stats</CardTitle>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Files:</span>
                <span className="font-medium">{stats?.total_files || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Folders:</span>
                <span className="font-medium">{stats?.total_folders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Storage Used:</span>
                <span className="font-medium">{stats?.total_size_readable || "0 B"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <Card className="md:col-span-3">
          <Tabs defaultValue="all">
            <div className="p-6 border-b flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Files</TabsTrigger>
                <TabsTrigger value="folders">Folders</TabsTrigger>
              </TabsList>
              
              <div className="w-[200px]">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <TabsContent value="all" className="p-0">
              {/* Folder Navigation */}
              <div className="px-6 py-3 bg-gray-50 flex items-center space-x-2">
                <Folder className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {currentFolder === "default" ? "Root" : currentFolder}
                </span>
                {currentFolder !== "default" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFolder("default")}
                    className="ml-auto text-xs"
                  >
                    Back to Root
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[400px] border-t">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                    <Cloud className="h-12 w-12 mb-3 text-gray-300" />
                    <p>No files found in this folder</p>
                    <Button variant="link" className="mt-2" asChild>
                      <label htmlFor="fileUpload">Upload files</label>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
                    {folders
                      .filter(folder => folder !== currentFolder && (currentFolder === "default" || folder.startsWith(currentFolder + "/")))
                      .filter(folder => folder.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((folder) => (
                        <Card key={folder} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                          <div className="p-4 flex flex-col items-center" onClick={() => setCurrentFolder(folder)}>
                            <Folder className="h-12 w-12 text-blue-500 mb-2" />
                            <p className="text-sm font-medium text-center truncate w-full">{folder}</p>
                          </div>
                          <CardFooter className="p-2 bg-gray-50 flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardFooter>
                        </Card>
                      ))
                    }
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div 
                          className="aspect-square relative bg-gray-100 flex items-center justify-center cursor-pointer"
                          onClick={() => setSelectedImage(file)}
                        >
                          {file.url && file.format && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.format.toLowerCase()) ? (
                            <img 
                              src={file.url} 
                              alt={file.filename} 
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <File className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {file.size ? Math.round(file.size / 1024) + ' KB' : 'Unknown size'}
                          </p>
                        </CardContent>
                        <CardFooter className="p-2 bg-gray-50 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                                <Image className="mr-2 h-4 w-4" />
                                View Full Size
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete File
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Pagination controls */}
                {filteredFiles.length > 0 && (
                  <div className="p-4 border-t flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page + 1} of {Math.ceil(totalFiles / limit)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!hasMoreFiles}
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="folders" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Card key={folder} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Folder className="h-10 w-10 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{folder}</p>
                        <p className="text-xs text-gray-500">
                          {files.filter(f => f.folder === folder).length} files
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 bg-gray-50 flex justify-end space-x-2">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentFolder(folder);
                          document.querySelector('[data-value="all"]')?.click();
                        }}
                      >
                        Open
                      </Button>
                      {folder !== 'default' && (
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDeleteFolder(folder)}
                        >
                          Delete
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {folders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <Folder className="h-12 w-12 mb-3 text-gray-300" />
                  <p>No folders created yet</p>
                  <Button variant="link" className="mt-2" onClick={() => setIsCreateFolderOpen(true)}>
                    Create a folder
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.filename}</DialogTitle>
            <DialogDescription>
              {formatDate(selectedImage?.created_at || '')} · {selectedImage?.size ? Math.round(selectedImage.size / 1024) + ' KB' : 'Unknown size'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center items-center py-4">
            {selectedImage?.url && selectedImage.format && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(selectedImage.format.toLowerCase()) ? (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.filename || 'Preview'} 
                className="max-h-[60vh] max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-100 rounded-lg">
                <File className="h-20 w-20 text-gray-400 mb-4" />
                <p className="text-gray-500">This file type cannot be previewed</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => window.open(selectedImage?.url, '_blank')}>
                Open in New Tab
              </Button>
              <Button variant="destructive" onClick={() => {
                if (selectedImage) {
                  handleDeleteFile(selectedImage.id);
                  setSelectedImage(null);
                }
              }}>
                Delete File
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderCloud;