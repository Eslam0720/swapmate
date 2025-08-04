export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isPremium?: boolean;
  verified?: boolean;
}

export interface Asset {
  id: string;
  userId: string;
  type: 'home' | 'car' | 'others';
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  phoneNumber?: string;
  images: string[];
  createdAt: Date;
  swapType?: 'permanent' | 'temporary';
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  asset1Id: string;
  asset2Id: string;
  createdAt: Date;
  chatId?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface Like {
  id: string;
  userId: string;
  assetId: string;
  createdAt: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}