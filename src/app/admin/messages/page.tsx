"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast('Gagal mengambil pesan: ' + error.message, 'error');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('portfolio_messages')
      .update({ status: 'read' })
      .eq('id', id);

    if (error) {
      toast('Gagal mengupdate status: ' + error.message, 'error');
    } else {
      toast('Pesan ditandai sudah dibaca', 'success');
      fetchMessages();
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Yakin ingin menghapus pesan ini?')) return;
    
    const { error } = await supabase
      .from('portfolio_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast('Gagal menghapus pesan: ' + error.message, 'error');
    } else {
      toast('Pesan berhasil dihapus', 'success');
      fetchMessages();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mail className="text-cyan-400" />
          Pesan Masuk (Inbox)
        </h1>
        <p className="text-zinc-400 mt-2">Daftar pesan dari pengunjung website.</p>
      </div>

      <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Memuat pesan...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">Belum ada pesan masuk.</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'unread' ? 'bg-cyan-950/10' : ''}`}>
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-white">{msg.name}</h3>
                      {msg.status === 'unread' && (
                        <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                          Baru
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${msg.email}`} className="text-sm text-cyan-400 hover:underline">{msg.email}</a>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-1">
                      <Clock size={12} />
                      {new Date(msg.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {msg.status === 'unread' && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <CheckCircle size={16} /> Tandai Dibaca
                      </button>
                    )}
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
                      title="Hapus Pesan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <div className="text-zinc-300 text-sm whitespace-pre-wrap break-all line-clamp-2">
                    {msg.message}
                  </div>
                  <button 
                    onClick={() => setSelectedMessage(msg)}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                  >
                    Lihat Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-xl text-white">{selectedMessage.name}</h3>
                <p className="text-sm text-cyan-400">{selectedMessage.email}</p>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="text-zinc-300 text-sm whitespace-pre-wrap break-all leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800 bg-black/20 text-xs text-zinc-500 font-mono">
              Dikirim pada: {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
