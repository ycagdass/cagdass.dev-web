import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Spinner} from "@/components/ui/spinner";
import React from "react";

export function LoadingBar() {
  /*return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center h-full">
        <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>*/

    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-14 w-14"/>
    </div>
}
