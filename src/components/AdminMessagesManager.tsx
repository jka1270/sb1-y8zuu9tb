import { useState, useEffect } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, MessageSquare, User, Building, Phone, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string | null;
  inquiry_type: string;
  subject: string;
  message: string;
  research_area: string | null;
  urgency: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminMessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'confirm';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('contact_messages')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      await fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateAdminNotes = async (messageId: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      await fetchMessages();
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', messageId);

          if (error) throw error;

          await fetchMessages();
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
          }
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      }
    });
  };

  const filteredMessages = messages.filter(msg => {
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || msg.urgency === urgencyFilter;
    const matchesSearch = searchQuery === '' ||
      msg.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesUrgency && matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      product: 'Product Information',
      technical: 'Technical Support',
      custom: 'Custom Synthesis',
      quality: 'Quality Assurance',
      shipping: 'Shipping & Logistics',
      partnership: 'Research Partnership',
      billing: 'Billing & Orders',
      other: 'Other'
    };
    return types[type] || type;
  };

  const messageStats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    resolved: messages.filter(m => m.status === 'resolved').length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Messages</h2>
        <p className="text-gray-600">Manage customer inquiries and support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Messages</div>
          <div className="text-2xl font-bold text-gray-900">{messageStats.total}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">New</div>
          <div className="text-2xl font-bold text-blue-800">{messageStats.new}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Read</div>
          <div className="text-2xl font-bold text-gray-800">{messageStats.read}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
          <div className="text-sm text-green-600 mb-1">Replied</div>
          <div className="text-2xl font-bold text-green-800">{messageStats.replied}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
          <div className="text-sm text-purple-600 mb-1">Resolved</div>
          <div className="text-2xl font-bold text-purple-800">{messageStats.resolved}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Urgency Levels</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setAdminNotes(msg.admin_notes || '');
                    if (msg.status === 'new') {
                      updateMessageStatus(msg.id, 'read');
                    }
                  }}
                  className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === msg.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {msg.first_name} {msg.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{msg.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(msg.status)}`}>
                        {msg.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getUrgencyBadgeColor(msg.urgency)}`}>
                        {msg.urgency}
                      </span>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900 mb-2">{msg.subject}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{msg.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getInquiryTypeLabel(msg.inquiry_type)}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedMessage && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{selectedMessage.first_name} {selectedMessage.last_name}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:text-blue-700">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{selectedMessage.company}</span>
                  </div>
                </div>

                {selectedMessage.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{selectedMessage.phone}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Inquiry Type</label>
                  <p className="text-gray-900 mt-1">{getInquiryTypeLabel(selectedMessage.inquiry_type)}</p>
                </div>

                {selectedMessage.research_area && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Research Area</label>
                    <p className="text-gray-900 mt-1">{selectedMessage.research_area}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-gray-900 mt-1 font-medium">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Submitted</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <div className="flex gap-2">
                  {['new', 'read', 'replied', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateMessageStatus(selectedMessage.id, status)}
                      disabled={updating}
                      className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                        selectedMessage.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => updateAdminNotes(selectedMessage.id)}
                  disabled={updating}
                  className={`mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                    updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
}
