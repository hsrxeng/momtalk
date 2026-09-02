import { useState, useEffect } from 'react';
import { CategoryId, ViewMode, AppSettings } from './types';
import { CATEGORIES, SENTENCES, QUIZ_LIST } from './data/sentences';
import { Header } from './components/Header';
import { CardView } from './components/CardView';
import { ListView } from './components/ListView';
import { QuizView } from './components/QuizView';
import { FavoritesView } from './components/FavoritesView';
import { Sparkles, Heart } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'senior_english_settings_v1';
const FAVORITES_STORAGE_KEY = 'senior_english_favorites_v1';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('travel');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      fontSize: 'large',
      speechRate: 0.8, // Senior-friendly standard slow & clear
      repeatCount: 1,
    };
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return ['t-1', 'c-1', 'g-1']; // Friendly defaults
  });

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAllFavorites = () => {
    setFavorites([]);
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setCurrentCardIndex(0);
  };

  const categorySentences = SENTENCES.filter((s) => s.categoryId === selectedCategory);
  const currentCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF2] text-stone-900">
      {/* Header with quick senior toggles & tabs */}
      <Header
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          if (mode === 'card') setCurrentCardIndex(0);
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        favoriteCount={favorites.length}
        totalSentenceCount={SENTENCES.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {viewMode === 'card' && (
          <CardView
            sentences={categorySentences}
            currentIndex={currentCardIndex}
            onSelectIndex={setCurrentCardIndex}
            settings={settings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            sentences={categorySentences}
            categoryTitle={currentCategoryObj.title}
            settings={settings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {viewMode === 'quiz' && (
          <QuizView
            quizList={QUIZ_LIST}
            settings={settings}
          />
        )}

        {viewMode === 'favorites' && (
          <FavoritesView
            sentences={SENTENCES}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onClearAllFavorites={handleClearAllFavorites}
            settings={settings}
            onGoToCards={() => setViewMode('card')}
          />
        )}
      </main>

      {/* Warm Senior Footer */}
      <footer className="bg-white/80 border-t border-orange-100/90 py-5 px-4 text-center">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-stone-500 font-medium">
          <div className="flex items-center gap-1.5 text-stone-800 font-bold">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>어머니의 즐거운 매일 영어 배움을 응원합니다 💐</span>
          </div>
          <div className="text-stone-500 font-medium">
            초등 800 필수 영단어 기반 · 큰 글씨 한글 발음 표기
          </div>
        </div>
      </footer>
    </div>
  );
}
