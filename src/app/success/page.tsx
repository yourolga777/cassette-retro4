import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="reel" />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
