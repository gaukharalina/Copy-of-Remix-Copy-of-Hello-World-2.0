import React, { useCallback, useEffect, useState } from 'react';
import { GreetingRecord } from '../types';
import { X, Copy, Link, Twitter } from 'lucide-react';

interface ShareModalProps {
  greeting: GreetingRecord | null;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ greeting, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  useEffect(() => {
    if (greeting) {
      const params = new URLSearchParams({
        text: greeting.text,
        vibe: greeting.vibe,
        language: greeting.language,
      });
      const link = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      setShareLink(link);
    }
  }, [greeting]);

  const copyToClipboard = (text: string, callback: () => void) => {
    navigator.clipboard.writeText(text).then(() => {
      callback();
      setTimeout(() => {
        setLinkCopied(false);
        setTextCopied(false);
      }, 2000);
    });
  };
  
  const handleCopyLink = () => {
    copyToClipboard(shareLink, () => setLinkCopied(true));
  };

  const handleCopyText = () => {
    if (greeting) {
      copyToClipboard(greeting.text, () => setTextCopied(true));
    }
  };

  const handleShareOnTwitter = () => {
    if (greeting) {
      const tweetText = `Check out this AI-generated greeting: "${greeting.text}"`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareLink)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!greeting) return null;

  return (
    <div 
      id="share-modal-backdrop"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="glass rounded-3xl w-full max-w-lg m-4 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Share Greeting</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
            {greeting.imageUrl ? (
              <img src={greeting.imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-white/10">
            "{greeting.text}"
          </p>
          <div className="space-y-3">
            <div className="flex items-center bg-gray-900/50 border border-white/10 rounded-lg pr-2">
              <input 
                type="text" 
                readOnly 
                value={shareLink}
                className="bg-transparent w-full p-3 outline-none text-sm text-gray-400"
              />
              <button 
                id="copy-link-button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all active:scale-95 flex-shrink-0"
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="copy-text-button"
                onClick={handleCopyText}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Copy size={16} /> {textCopied ? 'Copied!' : 'Copy Text'}
              </button>
              <button 
                id="share-twitter-button"
                onClick={handleShareOnTwitter}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Twitter size={16} /> Share on X
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
