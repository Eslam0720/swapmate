import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Check, Badge, TrendingUp } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentListings: number;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentListings
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            You've reached your limit of {currentListings}/3 free listings.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-yellow-600">$4.99</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verified Badge</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority Placement</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
              <Button onClick={onUpgrade} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;