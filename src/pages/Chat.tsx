import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: 'patient' | 'doctor';
  message_type: 'text' | 'image' | 'file';
  content: string;
  file_url?: string;
  read_at?: string;
  created_at: string;
}

interface Consultation {
  id: string;
  user_id: string;
  doctor_id: string;
  status: string;
  created_at: string;
  doctor?: {
    name: string;
    specialization: string;
    rating: number;
  };
  patient?: {
    name: string;
  };
}

export default function Chat() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const consultationId = searchParams.get('consultation');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchConsultations();
  }, [user, navigate]);

  useEffect(() => {
    if (consultationId && consultations.length > 0) {
      setSelectedConsultation(consultationId);
    }
  }, [consultationId, consultations]);

  useEffect(() => {
    if (selectedConsultation) {
      fetchMessages();
      // Set up real-time subscription for messages
      const subscription = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `consultation_id=eq.${selectedConsultation}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedConsultation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConsultations = async () => {
    try {
      let query = supabase
        .from('consultations')
        .select(`
          *,
          doctors!inner(name, specialization, rating),
          profiles!consultations_user_id_fkey(name)
        `);

      if (profile?.role === 'doctor') {
        // For doctors, get consultations where they are the assigned doctor
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorData) {
          query = query.eq('doctor_id', doctorData.id);
        }
      } else {
        // For patients, get their own consultations
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConsultation) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('consultation_id', selectedConsultation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          consultation_id: selectedConsultation,
          sender_id: user.id,
          sender_type: profile?.role === 'doctor' ? 'doctor' : 'patient',
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedConsultationData = consultations.find(c => c.id === selectedConsultation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Chat & Consultation</h1>
        <p className="text-muted-foreground">
          Communicate with your {profile?.role === 'doctor' ? 'patients' : 'doctors'} in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
        {/* Consultations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">
              {profile?.role === 'doctor' ? 'My Patients' : 'My Consultations'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className={`p-3 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                    selectedConsultation === consultation.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => setSelectedConsultation(consultation.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {profile?.role === 'doctor' 
                          ? getInitials(consultation.patient?.name || 'Patient')
                          : getInitials(consultation.doctor?.name || 'Doctor')
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {profile?.role === 'doctor' 
                          ? consultation.patient?.name || 'Patient'
                          : consultation.doctor?.name || 'Doctor'
                        }
                      </p>
                      {consultation.doctor?.specialization && (
                        <p className="text-xs text-muted-foreground">
                          {consultation.doctor.specialization}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={consultation.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {consultation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(consultation.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {consultations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No consultations yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/doctors')}
                  >
                    {profile?.role === 'doctor' ? 'View Patient Requests' : 'Find a Doctor'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedConsultationData ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {profile?.role === 'doctor' 
                          ? getInitials(selectedConsultationData.patient?.name || 'Patient')
                          : getInitials(selectedConsultationData.doctor?.name || 'Doctor')
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {profile?.role === 'doctor' 
                          ? selectedConsultationData.patient?.name || 'Patient'
                          : selectedConsultationData.doctor?.name || 'Doctor'
                        }
                      </h3>
                      {selectedConsultationData.doctor?.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {selectedConsultationData.doctor.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        message.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.created_at)}</span>
                        {message.sender_id === user.id && (
                          <div className="ml-1">
                            {message.read_at ? (
                              <CheckCheck className="h-3 w-3 text-blue-400" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select a consultation</h3>
                <p className="text-muted-foreground">
                  Choose a consultation from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}