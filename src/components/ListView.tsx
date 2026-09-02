import { useState } from 'react';
import { Sentence, AppSettings } from '../types';
import { Volume2, Heart, Search, Sparkles, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import { speakEnglish, playSound } from '../utils/speech';
import { SpeakingModal } from './SpeakingModal';

interface ListViewProps {
  sentences: Sentence[];
  categoryTitle: string;
  settings: AppSettings;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ListView = ({
  sentences,
  categoryTitle,
  settings,
  favorites,
  onToggleFavorite,
}: ListViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalSentence, setModalSentence] = useState<Sentence | null>(null);

  const filtered = sentences.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.english.toLowerCase().includes(term) ||
      s.koreanPronunciation.includes(term) ||
      s.koreanMeaning.includes(term) ||
      s.keyWords?.some((k) => k.word.toLowerCase().includes(term) || k.meaning.includes(term))
    );
  });

  const handlePlay = (sentence: Sentence) => {
    setPlayingId(sentence.id);
    speakEnglish(sentence.english, {
      rate: settings.speechRate,
      repeatTimes: settings.repeatCount,
      onStart: () => setPlayingId(sentence.id),
      onEnd: () => setPlayingId(null),
    });
  };

  const isExtraLarge = settings.fontSize === 'extra-large';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* Category Banner & Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100/90 mb-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
              <span>{categoryTitle}</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200/80">
                총 {sentences.length}개 문장
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-medium">
              스피커 버튼을 누르면 즉시 원어민 발음으로 읽어드립니다.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-list-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="단어나 뜻 검색 (예: 화장실, 커피, 얼마)"
            className="w-full pl-11 pr-16 py-3 rounded-2xl bg-orange-50/40 border-2 border-orange-200/70 text-sm sm:text-base font-semibold focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all text-stone-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {/* Sentences List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-orange-100 p-6">
            <p className="text-stone-500 font-bold text-base">
              검색 결과가 없습니다.
            </p>
            <p className="text-stone-600 text-xs mt-1">
              다른 검색어를 입력하시거나 검색창을 비워주세요.
            </p>
          </div>
        ) : (
          filtered.map((sentence, idx) => {
            const isFav = favorites.includes(sentence.id);
            const isPlaying = playingId === sentence.id;
            const isExpanded = expandedId === sentence.id;

            return (
              <div
                key={sentence.id}
                id={`list-item-${sentence.id}`}
                className={`bg-white rounded-3xl border-2 transition-all p-4 sm:p-5 shadow-2xs ${
                  isPlaying
                    ? 'border-orange-500 ring-3 ring-orange-200/80 bg-orange-50/30 shadow-md'
                    : 'border-stone-200/90 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Index & Sentence Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-900 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="inline-block bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-lg text-amber-950 font-black text-xs sm:text-sm">
                        {sentence.koreanPronunciation}
                      </div>
                    </div>

                    {/* English text */}
                    <h3
                      className={`font-black text-stone-900 tracking-tight leading-snug ${
                        isExtraLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                      }`}
                    >
                      {sentence.english}
                    </h3>

                    {/* Korean meaning */}
                    <p className="text-stone-700 font-bold text-sm sm:text-base mt-1">
                      {sentence.koreanMeaning}
                    </p>
                  </div>

                  {/* Right: Audio & Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {/* Practice Speaking */}
                    <button
                      onClick={() => setModalSentence(sentence)}
                      className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs"
                      title="따라 말하기 연습"
                    >
                      <Mic className="w-5 h-5 text-emerald-600" />
                    </button>

                    {/* Favorite Toggle */}
                    <button
                      onClick={() => {
                        playSound('click');
                        onToggleFavorite(sentence.id);
                      }}
                      className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-95 shadow-2xs ${
                        isFav
                          ? 'bg-rose-50 border-rose-300 text-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-rose-500 hover:border-rose-200'
                      }`}
                      title="찜하기"
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Play Audio Button */}
                    <button
                      id={`btn-list-play-${sentence.id}`}
                      onClick={() => handlePlay(sentence)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white transition-all active:scale-95 shadow-[0_2px_8px_rgba(255,107,0,0.3)] ${
                        isPlaying
                          ? 'bg-orange-600 animate-pulse'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      title="소리 듣기"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Word tags & tip expander toggle */}
                <div className="mt-3 pt-2.5 border-t border-orange-100/70 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {sentence.keyWords?.slice(0, 2).map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-xs bg-orange-50/80 text-stone-700 px-2.5 py-0.5 rounded-lg border border-orange-200/60 font-medium"
                      >
                        <strong className="text-orange-600 font-bold">{kw.word}</strong>: {kw.meaning}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sentence.id)}
                    className="text-xs font-bold text-stone-500 hover:text-orange-600 flex items-center gap-0.5 ml-2 shrink-0 transition-colors"
                  >
                    <span>{isExpanded ? '접기' : '팁 보기'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-orange-100 text-xs sm:text-sm text-stone-600 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/70">
                    <p className="font-bold text-amber-950 mb-1">💡 어머니 꿀팁:</p>
                    <p className="leading-relaxed">{sentence.situationTip}</p>
                    {sentence.keyWords && sentence.keyWords.length > 2 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sentence.keyWords.map((kw, i) => (
                          <span key={i} className="bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 text-xs font-medium">
                            <strong className="text-orange-600">{kw.word}</strong> ({kw.phonetic}) = {kw.meaning}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {modalSentence && (
        <SpeakingModal
          sentence={modalSentence}
          isOpen={!!modalSentence}
          onClose={() => setModalSentence(null)}
          speechRate={settings.speechRate}
        />
      )}
    </div>
  );
};
