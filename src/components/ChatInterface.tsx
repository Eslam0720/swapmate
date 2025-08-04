import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from './AuthProvider';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  matchId: string;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchId, onBack }) => {
  const { users } = useAppContext();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId && user) {
      fetchMatchDetails();
      fetchMessages();
      subscribeToMessages();
    }
  }, [matchId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      
      const otherUserId = data.user1_id === user?.id ? data.user2_id : data.user1_id;
      const otherUserData = users.find(u => u.id === otherUserId);
      setOtherUser(otherUserData);
    } catch (error) {
      console.error('Error fetching match details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Add message to UI immediately
    const optimisticMessage: Message = {
      id: tempId,
      match_id: matchId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) throw error;
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? data : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent); // Restore message text
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle className="text-lg">
          Chat with {otherUser?.name || 'Someone'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  isOwn 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;