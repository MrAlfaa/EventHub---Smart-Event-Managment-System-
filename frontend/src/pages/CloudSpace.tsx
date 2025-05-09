
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Cloud, FileText, Image, Upload, Folder, File, Download, Trash, FileIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const CloudSpace = () => {
  const navigate = useNavigate();
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Mock files data
  const files = [
    { id: 1, name: "Event_Booking_Receipt_EH123456.pdf", type: "document", size: "245 KB", date: "2024-04-15" },
    { id: 2, name: "Wedding_Photos", type: "folder", size: "", date: "2024-04-10" },
    { id: 3, name: "Contract_Agreement.pdf", type: "document", size: "320 KB", date: "2024-04-05" },
    { id: 4, name: "Venue_Preview.jpg", type: "image", size: "1.2 MB", date: "2024-03-28" },
  ];
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingFile(true);
      
      // Simulate upload
      setTimeout(() => {
        setUploadingFile(false);
        toast.success("File uploaded successfully");
      }, 1500);
    }
  };
  
  const handleDownload = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
  };
  
  const handleDelete = (fileName: string) => {
    toast.success(`${fileName} deleted successfully`);
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="receipts">Booking Receipts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Files</CardTitle>
              </CardHeader>
              <CardContent>
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
                            {file.type === 'folder' ? (
                              <Folder size={18} className="text-blue-500" />
                            ) : file.type === 'image' ? (
                              <Image size={18} className="text-green-500" />
                            ) : (
                              <FileText size={18} className="text-amber-500" />
                            )}
                            <span className="font-medium truncate">{file.name}</span>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground capitalize">
                            {file.type}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {file.size}
                          </div>
                          <div className="col-span-2 flex space-x-1">
                            {file.type !== 'folder' && (
                              <Button variant="ghost" size="icon" onClick={() => handleDownload(file.name)}>
                                <Download size={16} />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(file.name)}>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md divide-y">
                    <div className="grid grid-cols-12 p-3 text-sm font-medium text-muted-foreground">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    
                    {files
                      .filter(file => file.type === 'document')
                      .map((file) => (
                        <div key={file.id} className="grid grid-cols-12 p-3 items-center hover:bg-muted/50">
                          <div className="col-span-6 flex items-center gap-2">
                            <FileText size={18} className="text-amber-500" />
                            <span className="font-medium truncate">{file.name}</span>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground capitalize">
                            {file.type}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {file.size}
                          </div>
                          <div className="col-span-2 flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(file.name)}>
                              <Download size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(file.name)}>
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="images">
            {/* Similar content for images tab */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Image className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No images yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload images to see them here
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Upload an image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="receipts">
            {/* Similar content for receipts tab */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md divide-y">
                    <div className="grid grid-cols-12 p-3 text-sm font-medium text-muted-foreground">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    
                    {files
                      .filter(file => file.name.includes('Receipt'))
                      .map((file) => (
                        <div key={file.id} className="grid grid-cols-12 p-3 items-center hover:bg-muted/50">
                          <div className="col-span-6 flex items-center gap-2">
                            <FileText size={18} className="text-amber-500" />
                            <span className="font-medium truncate">{file.name}</span>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground capitalize">
                            {file.type}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {file.size}
                          </div>
                          <div className="col-span-2 flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(file.name)}>
                              <Download size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(file.name)}>
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CloudSpace;
