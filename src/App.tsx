import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ListingDetail from "./pages/ListingDetail";
import ProfilePage from "./components/ProfilePage";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import MobileOptimizations from "./components/MobileOptimizations";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileOptimizations />
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;