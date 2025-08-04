import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Bell, MapPin, User, Trash2, Crown } from 'lucide-react';
import { PushNotificationSetup } from '@/components/PushNotificationSetup';

interface UserSettings {
  notifications_enabled: boolean;
  location_sharing: boolean;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { userLocation } = useAppContext();
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    location_sharing: true
  });
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
      checkPremiumStatus();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('notifications_enabled, location_sharing')
        .eq('id', user?.id)
        .single();

      if (data && !error) {
        setSettings({
          notifications_enabled: data.notifications_enabled ?? true,
          location_sharing: data.location_sharing ?? true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();
      
      setIsPremium(!!data);
    } catch (error) {
      setIsPremium(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(newSettings)
        .eq('id', user?.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68794542f32439e209e49d32_1753489451678_9a9bec0d.png" 
          alt="SwapMate Logo" 
          className="h-16 w-auto object-contain mx-auto mb-4"
        />
        <p>Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68794542f32439e209e49d32_1753489451678_9a9bec0d.png" 
          alt="SwapMate Logo" 
          className="h-12 w-auto object-contain mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-gray-600">Member since {new Date(user.created_at || '').toLocaleDateString()}</p>
            </div>
            <Badge variant={isPremium ? "default" : "secondary"}>
              {isPremium ? (
                <><Crown className="w-4 h-4 mr-1" />Premium</>
              ) : (
                "Free"
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications Setup */}
      <PushNotificationSetup />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Enable notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => updateSettings({ notifications_enabled: checked })}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location & Privacy
          </CardTitle>
          <CardDescription>
            Manage your location settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-sharing">Share location</Label>
            <Switch
              id="location-sharing"
              checked={settings.location_sharing}
              onCheckedChange={(checked) => updateSettings({ location_sharing: checked })}
              disabled={loading}
            />
          </div>
          
          {userLocation && (
            <div className="text-sm text-gray-600">
              <p>Current location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => {
              toast({
                title: "Feature coming soon",
                description: "Account deletion will be available in a future update."
              });
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;