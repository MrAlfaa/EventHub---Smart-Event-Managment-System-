import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const AdminPaymentDetails = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Details</h1>

      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6 flex flex-col items-center text-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-xl text-blue-800">Feature in Development</h3>
              <p className="text-blue-700 mt-2 max-w-xl">
                This payment details feature is currently being implemented. The full payment tracking and management 
                functionality will be available in the next release.
              </p>
            </div>
            <div className="text-sm text-blue-600 mt-2">
              <p>Expected release: May 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentDetails;





