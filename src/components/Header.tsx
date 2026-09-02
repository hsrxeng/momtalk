import { Category, CategoryId, ViewMode, AppSettings } from '../types';
import { Volume2, Sparkles, BookOpen, Layers, CheckCircle2, Heart, Type, Gauge, Repeat } from 'lucide-react';

interface HeaderProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  favoriteCount: number;
  totalSentenceCount: number;
}

export const Header = ({
  categories,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onChangeViewMode,
  settings,
  onUpdateSettings,
  favoriteCount,
}: HeaderProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-orange-100/90 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 sm:pt-4 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(255,107,0,0.25)] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  어머니를 위한 생활 영어
                </h1>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200/80">
                  왕초보용
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                큰 글씨와 한글 발음으로 편안하게 배우는 매일 영어회화
              </p>
            </div>
          </div>

          {/* Quick Senior Controls (Font Size & Speed & Repeat) */}
          <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto bg-orange-50/70 p-1.5 rounded-2xl border border-orange-200/70">
            {/* Font Size Button */}
            <button
              id="btn-toggle-fontsize"
              onClick={() =>
                onUpdateSettings({
                  fontSize: settings.fontSize === 'large' ? 'extra-large' : 'large',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white text-stone-800 shadow-2xs hover:bg-orange-50 border border-stone-200/80 active:scale-95"
              title="글씨 크기 변경"
            >
              <Type className="w-3.5 h-3.5 text-orange-500" />
              <span>{settings.fontSize === 'extra-large' ? '왕 글씨 👑' : '큰 글씨'}</span>
            </button>

            {/* Speech Rate Button */}
            <button
              id="btn-toggle-speechrate"
              onClick={() => {
                const nextRate = settings.speechRate === 0.8 ? 0.65 : settings.speechRate === 0.65 ? 1.0 : 0.8;
                onUpdateSettings({ speechRate: nextRate });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white text-stone-800 shadow-2xs hover:bg-blue-50 border border-stone-200/80 active:scale-95"
              title="발음 말하기 속도 조절"
            >
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {settings.speechRate === 0.65
                  ? '아주 느리게'
                  : settings.speechRate === 0.8
                  ? '천천히 (기본)'
                  : '보통 속도'}
              </span>
            </button>

            {/* Repeat Count Button */}
            <button
              id="btn-toggle-repeat"
              onClick={() =>
                onUpdateSettings({
                  repeatCount: settings.repeatCount === 1 ? 3 : 1,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white text-stone-800 shadow-2xs hover:bg-emerald-50 border border-stone-200/80 active:scale-95"
              title="소리 반복 횟수 설정"
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.repeatCount === 3 ? '3번 반복 🔁' : '1번 듣기'}</span>
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-orange-100/80">
          <button
            id="tab-mode-card"
            onClick={() => onChangeViewMode('card')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all text-center ${
              viewMode === 'card'
                ? 'bg-orange-500 text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)] scale-[1.02]'
                : 'bg-white text-stone-700 hover:bg-orange-50/70 border border-stone-200/80'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">한 장씩 넘기기</span>
          </button>

          <button
            id="tab-mode-list"
            onClick={() => onChangeViewMode('list')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all text-center ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] scale-[1.02]'
                : 'bg-white text-stone-700 hover:bg-blue-50/70 border border-stone-200/80'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">전체 모아보기</span>
          </button>

          <button
            id="tab-mode-quiz"
            onClick={() => onChangeViewMode('quiz')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all text-center ${
              viewMode === 'quiz'
                ? 'bg-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] scale-[1.02]'
                : 'bg-white text-stone-700 hover:bg-emerald-50/70 border border-stone-200/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">2지선다 퀴즈</span>
          </button>

          <button
            id="tab-mode-favorites"
            onClick={() => onChangeViewMode('favorites')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all text-center ${
              viewMode === 'favorites'
                ? 'bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)] scale-[1.02]'
                : 'bg-white text-stone-700 hover:bg-rose-50/70 border border-stone-200/80'
            }`}
          >
            <Heart className={`w-4 h-4 shrink-0 ${favoriteCount > 0 ? 'fill-rose-200' : ''}`} />
            <span className="truncate">
              찜한 문장 {favoriteCount > 0 ? `(${favoriteCount})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Category Horizontal Pill Scroller (Only when in card/list mode) */}
      {(viewMode === 'card' || viewMode === 'list') && (
        <div className="bg-white/80 border-t border-orange-100 py-2.5 px-4 overflow-x-auto no-scrollbar">
          <div className="max-w-4xl mx-auto flex items-center gap-2 min-w-max">
            <span className="text-xs font-bold text-stone-500 pl-1">주제 선택:</span>
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)] scale-105 border border-orange-600'
                      : 'bg-white text-stone-800 border border-stone-200 hover:bg-orange-50/80 hover:border-orange-200'
                  }`}
                >
                  <span>{cat.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
