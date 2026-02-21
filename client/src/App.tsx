import * as React from "react";
import { Container } from "./components/layout/Container";
import { WardrobeGrid } from "./components/wardrobe/WardrobeGrid";
import type { WardrobeItem } from "./types/wardrobe";
import { ChatInterface } from "./components/onboarding/ChatInterface";
import type { Outfit } from "./types/wardrobe";
import { OutfitCard } from "./components/wardrobe/OutfitCard";
import { BottomNav } from "./components/layout/BottomNav";
import { OccasionGrid } from "./components/home/OccasionGrid";
import { ArrowLeft, Plus, MessageCircle, LogOut } from "lucide-react";
import ItemDetailsModal from './components/wardrobe/ItemDetailsModal';
import { AuthScreen } from "./components/auth/AuthScreen";

type AppPhase = 'onboarding' | 'dashboard';
type ActiveTab = 'home' | 'wardrobe';

function App() {
  // ─── Auth state ───────────────────────────────────────────────────
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('');
  const [authChecked, setAuthChecked] = React.useState(false);

  // ─── App state ────────────────────────────────────────────────────
  const [phase, setPhase] = React.useState<AppPhase>('dashboard');
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('home');
  const [selectedOccasion, setSelectedOccasion] = React.useState<string | null>(null);
  const [wardrobeItems, setWardrobeItems] = React.useState<WardrobeItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = React.useState<Outfit | null>(null);
  const [outfitHistory, setOutfitHistory] = React.useState<Outfit[]>([]);
  const [outfitIndex, setOutfitIndex] = React.useState(0);
  const [isLoadingOutfit, setIsLoadingOutfit] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<WardrobeItem | null>(null);

  // Direct upload states
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<Partial<WardrobeItem> | null>(null);
  const [pairingSuggestions, setPairingSuggestions] = React.useState<{ tops: WardrobeItem[], bottoms: WardrobeItem[], shoes: WardrobeItem[] } | null>(null);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

  // ─── Token helpers ────────────────────────────────────────────────
  const authFetch = React.useCallback((url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('wm_token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, []);

  const handleAuth = (token: string, name: string) => {
    localStorage.setItem('wm_token', token);
    localStorage.setItem('wm_user', name);
    setAuthToken(token);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('wm_token');
    localStorage.removeItem('wm_user');
    setAuthToken(null);
    setUserName('');
    setWardrobeItems([]);
    setCurrentOutfit(null);
    setOutfitHistory([]);
    setSelectedOccasion(null);
  };

  // ─── On mount: check for existing token ──────────────────────────
  React.useEffect(() => {
    const storedToken = localStorage.getItem('wm_token');
    const storedUser = localStorage.getItem('wm_user');
    if (storedToken && storedUser) {
      // Validate token with server
      fetch('/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(res => {
          if (res.ok) {
            setAuthToken(storedToken);
            setUserName(storedUser);
          } else {
            localStorage.removeItem('wm_token');
            localStorage.removeItem('wm_user');
          }
        })
        .catch(() => { /* network error — still show auth screen */ })
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Fetch wardrobe after auth is confirmed
  React.useEffect(() => {
    if (authToken) fetchWardrobe();
  }, [authToken]);

  const fetchWardrobe = async () => {
    try {
      const res = await authFetch('/wardrobe');
      const data = await res.json();
      if (data.data) {
        setWardrobeItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wardrobe:", error);
    }
  };

  const fetchRecommendation = async (occasion?: string, appendToHistory = true) => {
    setIsLoadingOutfit(true);
    try {
      const url = occasion
        ? `/recommendations?occasion=${occasion}`
        : '/recommendations';
      const res = await authFetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.data) {
        setCurrentOutfit(data.data);
        if (appendToHistory) {
          setOutfitHistory(prev => {
            const newHistory = [...prev, data.data];
            setOutfitIndex(newHistory.length - 1);
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
      setCurrentOutfit(null);
    } finally {
      setIsLoadingOutfit(false);
    }
  };

  const handleWearOutfit = async () => {
    if (!currentOutfit) return;
    setIsLoadingOutfit(true);
    try {
      await Promise.all(
        currentOutfit.items.map(item =>
          authFetch(`/wardrobe/${item.id}/wear`, { method: 'POST' })
        )
      );
      await fetchWardrobe();
      await fetchRecommendation(selectedOccasion || undefined);
    } catch (error) {
      console.error("Failed to log wear:", error);
    } finally {
      setIsLoadingOutfit(false);
    }
  };

  const handleSelectOccasion = (occasion: string) => {
    setSelectedOccasion(occasion);
    setOutfitHistory([]);
    setOutfitIndex(0);
    fetchRecommendation(occasion);
  };

  const handleBackToHome = () => {
    setSelectedOccasion(null);
    setCurrentOutfit(null);
    setOutfitHistory([]);
    setOutfitIndex(0);
  };

  const handleOutfitNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && outfitIndex > 0) {
      const newIndex = outfitIndex - 1;
      setOutfitIndex(newIndex);
      setCurrentOutfit(outfitHistory[newIndex]);
    } else if (direction === 'next') {
      if (outfitIndex < outfitHistory.length - 1) {
        const newIndex = outfitIndex + 1;
        setOutfitIndex(newIndex);
        setCurrentOutfit(outfitHistory[newIndex]);
      } else {
        // Fetch a brand new recommendation
        fetchRecommendation(selectedOccasion || undefined);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnalyzing) return; // Bug fix: prevent duplicate triggers
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      setIsAnalyzing(true);

      try {
        // Analyze item with Gemini
        const res = await authFetch('/api/analyze-item', {
          method: 'POST',
          body: JSON.stringify({ imageUrl: base64String })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const item = data.data;
        setAnalysisResult(item);

        // Fetch pairing suggestions
        const pairingsRes = await authFetch('/api/suggest-pairings', {
          method: 'POST',
          body: JSON.stringify({ newItem: item })
        });

        const pairingsData = await pairingsRes.json();
        setPairingSuggestions(pairingsData.data || { tops: [], bottoms: [], shoes: [] });

      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Failed to analyze image. Please try again.');
        setUploadedImage(null);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmAdd = async () => {
    if (!analysisResult || !uploadedImage) return;

    try {
      const res = await authFetch('/wardrobe', {
        method: 'POST',
        body: JSON.stringify({
          name: analysisResult.name,
          category: analysisResult.category,
          subCategory: analysisResult.subCategory,
          color: analysisResult.color,
          imageUrl: uploadedImage,
          occasion: analysisResult.occasion
        })
      });

      if (!res.ok) throw new Error('Failed to add item');

      // Reset states first to close modal
      const itemName = analysisResult.name;
      setAnalysisResult(null);
      setPairingSuggestions(null);
      setUploadedImage(null);

      // Refresh wardrobe and show success
      await fetchWardrobe();
      alert(`✅ "${itemName}" added to your wardrobe!`);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('❌ Failed to add item. Please try again.');
    }
  };

  const handleCancelAdd = () => {
    setAnalysisResult(null);
    setPairingSuggestions(null);
    setUploadedImage(null);
  };

  const handleItemClick = (item: WardrobeItem) => {
    setSelectedItem(item);
  };

  const handleItemUpdate = async (updatedItem: WardrobeItem) => {
    try {
      const res = await authFetch(`/wardrobe/${updatedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedItem)
      });

      if (!res.ok) throw new Error('Failed to update item');

      await fetchWardrobe();
      setSelectedItem(null);
      alert(`✅ "${updatedItem.name}" updated successfully!`);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('❌ Failed to update item. Please try again.');
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      const res = await authFetch(`/wardrobe/${itemId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete item');

      await fetchWardrobe();
      setSelectedItem(null);
      alert('✅ Item deleted successfully!');
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('❌ Failed to delete item. Please try again.');
    }
  };


  // Auth gate — show loading spinner until we know auth state
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!authToken) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (phase === 'onboarding' || showChat) {
    return (
      <div className="fixed inset-0 bg-[var(--color-base)] flex items-center justify-center z-50">
        <ChatInterface onComplete={() => {
          setPhase('dashboard');
          setShowChat(false);
          fetchWardrobe();
        }} />
      </div>
    );
  }

  // Full-screen Occasion Outfit View — 100vh
  if (selectedOccasion && activeTab === 'home') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-base)',
        color: 'var(--color-base-foreground)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Header — compact */}
        <div style={{
          padding: '16px 20px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexShrink: 0,
        }}>
          <button
            onClick={handleBackToHome}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="#e2e8f0" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              textTransform: 'capitalize',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: '#e2e8f0',
            }}>
              {selectedOccasion}
            </h1>
            <p style={{
              margin: '2px 0 0 0',
              fontSize: '13px',
              color: '#64748b',
              fontWeight: 500,
            }}>
              Your perfect outfit
            </p>
          </div>
          {outfitHistory.length > 0 && (
            <span style={{
              fontSize: '12px',
              color: '#64748b',
              background: 'rgba(255,255,255,0.04)',
              padding: '4px 12px',
              borderRadius: '99px',
              border: '1px solid rgba(255,255,255,0.06)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {outfitIndex + 1} / {outfitHistory.length}
            </span>
          )}
        </div>

        {/* Outfit cards area — fills remaining space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {currentOutfit ? (
            <OutfitCard
              outfit={currentOutfit}
              outfitHistory={outfitHistory}
              currentIndex={outfitIndex}
              onNavigate={handleOutfitNavigate}
              onAccept={handleWearOutfit}
              isLoading={isLoadingOutfit}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}>
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#64748b',
                fontSize: '15px',
                maxWidth: '400px',
              }}>
                {isLoadingOutfit ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6' }} />
                    <span>Curating your look...</span>
                  </div>
                ) : (
                  `No ${selectedOccasion} items in your wardrobe yet.`
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-base)] text-[var(--color-base-foreground)] pb-24 md:pb-20 overflow-x-hidden">

      <Container>
        {activeTab === 'home' && (
          <div className="py-6 space-y-10">
            {/* User header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '-16px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Welcome back</p>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {userName} ✨
                </h2>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>

            <OccasionGrid onSelectOccasion={handleSelectOccasion} wardrobeItems={wardrobeItems} />

            {/* Wardrobe Preview Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-l" style={{ color: '#e2e8f0' }}>My Wardrobe</h2>
                <button
                  onClick={() => setActiveTab('wardrobe')}
                  style={{
                    padding: '8px 18px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  View All →
                </button>
              </div>
              {wardrobeItems.length > 0 ? (
                <WardrobeGrid
                  items={wardrobeItems.slice(0, 8)}
                  onItemClick={handleItemClick}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#64748b',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '20px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p style={{ fontSize: '16px', fontWeight: 500, color: '#94a3b8' }}>Your wardrobe is empty</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>
                    Go to the Wardrobe tab to upload your first item!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wardrobe' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-l" style={{ color: '#e2e8f0' }}>My Wardrobe</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowChat(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <MessageCircle size={18} />
                  Talk with AI
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)',
                    backgroundSize: '200% 200%',
                    color: 'white',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.35)';
                  }}
                >
                  <Plus size={18} />
                  Upload Photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
            <span style={{
              fontSize: '13px',
              fontVariantNumeric: 'tabular-nums',
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '4px 12px',
              borderRadius: '9999px',
            }}>
              {wardrobeItems.length} items
            </span>
            <div className="pb-4">
              <WardrobeGrid items={wardrobeItems} onItemClick={handleItemClick} />
            </div>
          </div>
        )}

        {/* Analysis Modal */}
        {(isAnalyzing || analysisResult) && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={isAnalyzing ? undefined : handleCancelAdd}
          >
            <div
              style={{
                background: 'linear-gradient(180deg, #16161e, #111118)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '28px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)',
              }}
              className="animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>
                    Analyzing your item...
                  </h3>
                  <p style={{ color: '#64748b' }}>This will just take a moment</p>
                </div>
              ) : analysisResult && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#e2e8f0', fontFamily: 'var(--font-display)' }}>
                    Item Analysis
                  </h3>

                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Uploaded item"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    />
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: '#e2e8f0' }}>
                      {analysisResult.name}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#94a3b8' }}>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>Category:</strong> {analysisResult.subCategory} ({analysisResult.category})
                      </div>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>Color:</strong> {analysisResult.color}
                      </div>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>Occasion:</strong> {analysisResult.occasion}
                      </div>
                    </div>
                  </div>

                  {pairingSuggestions && (
                    <>
                      {[...pairingSuggestions.tops, ...pairingSuggestions.bottoms, ...pairingSuggestions.shoes].length > 0 && (
                        <div style={{
                          background: 'rgba(139, 92, 246, 0.08)',
                          border: '1px solid rgba(139, 92, 246, 0.15)',
                          padding: '16px 18px',
                          borderRadius: '16px',
                          marginBottom: '20px'
                        }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#a78bfa' }}>
                            ✨ This pairs well with:
                          </h4>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            fontSize: '14px',
                            color: '#cbd5e1',
                          }}>
                            {[...pairingSuggestions.tops, ...pairingSuggestions.bottoms, ...pairingSuggestions.shoes].map((item: WardrobeItem, idx: number) => (
                              <li key={idx}>• {item.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCancelAdd}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAdd}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Add to Wardrobe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </Container>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleItemUpdate}
          onDelete={handleItemDelete}
        />
      )}
    </div>
  );
}

export default App;
