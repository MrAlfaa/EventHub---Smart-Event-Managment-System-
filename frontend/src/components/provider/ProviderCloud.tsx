import React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Cloud } from "lucide-react";

const ProviderCloud = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cloud Storage</h2>
      </div>

      <Card className="flex flex-col items-center justify-center text-center p-8">
        <Cloud className="h-16 w-16 text-blue-500 mb-4" />
        <CardTitle className="text-2xl mb-3">Cloud Storage</CardTitle>
        <CardDescription className="text-lg">
          This feature is currently under development
        </CardDescription>
        <CardContent className="mt-6 text-center max-w-md">
          <p className="text-xl font-semibold text-blue-600 mb-3">
            "This is feature implement"
          </p>
          <p className="text-gray-600">
            We're working hard to bring you a comprehensive cloud storage solution. Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderCloud;