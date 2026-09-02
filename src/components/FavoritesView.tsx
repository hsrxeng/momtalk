import { useState } from 'react';
import { Sentence, AppSettings } from '../types';
import { Volume2, Heart, Mic, Trash2, ArrowLeft } from 'lucide-react';
import { speakEnglish, playSound } from '../utils/speech';
import { SpeakingModal } from './SpeakingModal';

interface FavoritesViewProps {
  sentences: Sentence[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onClearAllFavorites: () => void;
  settings: AppSettings;
  onGoToCards: () => void;
}

export const FavoritesView = ({
  sentences,
  favorites,
  onToggleFavorite,
  onClearAllFavorites,
  settings,
  onGoToCards,
}: FavoritesViewProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [modalSentence, setModalSentence] = useState<Sentence | null>(null);

  const favoriteSentences = sentences.filter((s) => favorites.includes(s.id));

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

  if (favoriteSentences.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100 shadow-2xs">
            <Heart className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2">
            아직 찜한 문장이 없어요
          </h2>

          <p className="text-sm sm:text-base text-stone-600 font-medium mb-6 leading-relaxed">
            공부하시면서 기억하고 싶은 문장의{' '}
            <strong className="text-rose-500">하트(❤️) 버튼</strong>을 누르시면 여기에 차곡차곡 모아 언제든 다시 들으실 수 있어요.
          </p>

          <button
            onClick={onGoToCards}
            className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-[0_4px_14px_rgba(255,107,0,0.3)] transition-all active:scale-98"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>영어 문장 공부하러 가기</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">
              내가 찜한 복습 문장 ({favoriteSentences.length}개)
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              어머니께서 특별히 챙겨두신 문장들입니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('찜한 문장을 모두 삭제하시겠습니까?')) {
              onClearAllFavorites();
            }
          }}
          className="text-xs font-bold text-stone-400 hover:text-rose-600 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>전체 비우기</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {favoriteSentences.map((sentence) => {
          const isPlaying = playingId === sentence.id;

          return (
            <div
              key={sentence.id}
              className={`bg-white rounded-3xl border-2 transition-all p-4 sm:p-5 shadow-2xs ${
                isPlaying
                  ? 'border-orange-500 ring-3 ring-orange-200 bg-orange-50/30 shadow-md'
                  : 'border-stone-200/90 hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="inline-block bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-lg text-amber-950 font-black text-xs sm:text-sm mb-1.5">
                    {sentence.koreanPronunciation}
                  </div>

                  <h3
                    className={`font-black text-stone-900 tracking-tight leading-snug ${
                      isExtraLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                    }`}
                  >
                    {sentence.english}
                  </h3>

                  <p className="text-stone-700 font-bold text-sm sm:text-base mt-1">
                    {sentence.koreanMeaning}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <button
                    onClick={() => setModalSentence(sentence)}
                    className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs"
                    title="따라 말하기"
                  >
                    <Mic className="w-5 h-5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      onToggleFavorite(sentence.id);
                    }}
                    className="w-11 h-11 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-500 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all shadow-2xs"
                    title="찜 해제"
                  >
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </button>

                  <button
                    onClick={() => handlePlay(sentence)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all active:scale-95 shadow-[0_2px_8px_rgba(255,107,0,0.3)] ${
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
            </div>
          );
        })}
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
