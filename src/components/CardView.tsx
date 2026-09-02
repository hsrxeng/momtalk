import { useState, useEffect, useRef } from 'react';
import { Sentence, AppSettings } from '../types';
import {
  Volume2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mic,
  Lightbulb,
  Repeat,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { speakEnglish, stopSpeaking, playSound } from '../utils/speech';
import { SpeakingModal } from './SpeakingModal';

interface CardViewProps {
  sentences: Sentence[];
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  settings: AppSettings;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const CardView = ({
  sentences,
  currentIndex,
  onSelectIndex,
  settings,
  favorites,
  onToggleFavorite,
}: CardViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showSpeakingModal, setShowSpeakingModal] = useState(false);
  const autoPlayTimerRef = useRef<any>(null);

  const currentSentence = sentences[currentIndex] || sentences[0];
  const isFavorite = currentSentence ? favorites.includes(currentSentence.id) : false;

  const isExtraLarge = settings.fontSize === 'extra-large';

  // Play audio for current sentence
  const handlePlayAudio = (repeatTimes = settings.repeatCount) => {
    if (!currentSentence) return;
    setIsPlaying(true);
    speakEnglish(currentSentence.english, {
      rate: settings.speechRate,
      repeatTimes,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  };

  const handleNext = () => {
    playSound('click');
    stopSpeaking();
    setIsPlaying(false);
    if (currentIndex < sentences.length - 1) {
      onSelectIndex(currentIndex + 1);
    } else {
      onSelectIndex(0); // Loop back
    }
  };

  const handlePrev = () => {
    playSound('click');
    stopSpeaking();
    setIsPlaying(false);
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    } else {
      onSelectIndex(sentences.length - 1);
    }
  };

  // Auto-play mode handling
  useEffect(() => {
    if (isAutoPlaying) {
      setIsPlaying(true);
      speakEnglish(currentSentence.english, {
        rate: settings.speechRate,
        repeatTimes: 2,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          autoPlayTimerRef.current = setTimeout(() => {
            if (currentIndex < sentences.length - 1) {
              onSelectIndex(currentIndex + 1);
            } else {
              setIsAutoPlaying(false);
            }
          }, 1800);
        },
      });
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, sentences, settings.speechRate, onSelectIndex]);

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopSpeaking();
      setIsAutoPlaying(false);
      setIsPlaying(false);
    } else {
      setIsAutoPlaying(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        handlePlayAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sentences, settings]);

  if (!currentSentence) {
    return (
      <div className="p-8 text-center text-stone-500 font-bold">
        표시할 문장이 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Controls: Card Counter & Auto-play & Favorite */}
      <div className="w-full flex items-center justify-between gap-2 mb-3.5">
        {/* Card Index Badge */}
        <div className="flex items-center gap-2 bg-orange-100/90 text-orange-900 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black border border-orange-200/80 shadow-2xs">
          <BookOpen className="w-4 h-4 text-orange-600" />
          <span>
            문장 <strong className="text-orange-950 font-black">{currentIndex + 1}</strong> / {sentences.length}
          </span>
        </div>

        {/* Action Controls (Auto Play & Bookmark) */}
        <div className="flex items-center gap-2">
          {/* Auto Continuous Play button */}
          <button
            id="btn-autoplay-toggle"
            onClick={toggleAutoPlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isAutoPlaying
                ? 'bg-orange-500 text-white border-orange-600 shadow-[0_2px_8px_rgba(255,107,0,0.3)] animate-pulse'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-orange-50/80 hover:border-orange-200'
            }`}
            title="다음 문장으로 넘어가며 자동으로 계속 읽어줍니다"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>연속 듣기 중지</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>자동 연속 듣기</span>
              </>
            )}
          </button>

          {/* Favorite Heart Button */}
          <button
            id="btn-favorite-card"
            onClick={() => {
              playSound('click');
              onToggleFavorite(currentSentence.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-2xs'
                : 'bg-white text-stone-400 border-stone-200 hover:text-rose-500 hover:border-rose-200'
            }`}
            aria-label="문장 찜하기"
            title="나중에 다시 볼 문장으로 찜하기"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div
        id={`card-sentence-${currentSentence.id}`}
        className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-2 border-orange-100/80 relative overflow-hidden transition-all"
      >
        {/* Decorative Top Pill */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200/80 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            핵심 생활 영어
          </span>

          {isPlaying && (
            <span className="text-xs font-black text-orange-600 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-4 h-4" />
              소리 나오는 중...
            </span>
          )}
        </div>

        {/* 1. Large English Sentence */}
        <div className="mb-4">
          <h2
            className={`font-black text-stone-900 tracking-tight leading-snug transition-all ${
              isExtraLarge
                ? 'text-3xl sm:text-4xl lg:text-5xl'
                : 'text-2xl sm:text-3xl lg:text-4xl'
            }`}
          >
            {currentSentence.english}
          </h2>
        </div>

        {/* 2. Prominent Korean Phonetic Pronunciation */}
        <div className="mb-5">
          <div className="inline-block bg-amber-100/90 border-2 border-amber-300 px-5 py-2.5 rounded-2xl shadow-xs">
            <p className="text-xs font-black text-amber-800 mb-0.5">한글 발음</p>
            <p
              className={`font-black text-amber-950 tracking-tight ${
                isExtraLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              {currentSentence.koreanPronunciation}
            </p>
          </div>
        </div>

        {/* 3. Korean Meaning */}
        <div className="mb-6 pb-5 border-b border-orange-100/80">
          <p className="text-xs font-bold text-stone-500 mb-1">우리말 뜻</p>
          <p
            className={`font-bold text-stone-800 leading-relaxed ${
              isExtraLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {currentSentence.koreanMeaning}
          </p>
        </div>

        {/* 4. Elementary 800 Key Vocabulary Breakdown */}
        {currentSentence.keyWords && currentSentence.keyWords.length > 0 && (
          <div className="mb-5 bg-orange-50/50 rounded-2xl p-4 border border-orange-200/70">
            <p className="text-xs font-bold text-stone-600 mb-2.5 flex items-center gap-1">
              <span>📌 초등 필수 단어 쏙쏙:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {currentSentence.keyWords.map((kw, idx) => (
                <div
                  key={idx}
                  className="bg-white px-3.5 py-1.5 rounded-xl border border-orange-200/80 shadow-2xs flex items-center gap-1.5"
                >
                  <span className="font-black text-orange-600 text-sm sm:text-base">
                    {kw.word}
                  </span>
                  <span className="text-stone-300 font-bold">|</span>
                  <span className="font-bold text-stone-700 text-xs sm:text-sm">
                    {kw.meaning}
                  </span>
                  {kw.phonetic && (
                    <span className="text-[11px] text-stone-500 font-medium">
                      ({kw.phonetic})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Senior Practical Tip */}
        {currentSentence.situationTip && (
          <div className="mb-6 bg-amber-50/80 rounded-2xl p-4 border-2 border-amber-200/80 flex items-start gap-3 text-left">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-amber-900 block mb-0.5">
                💡 어머니를 위한 사용 꿀팁:
              </span>
              <p className="text-xs sm:text-sm font-medium text-stone-700 leading-relaxed">
                {currentSentence.situationTip}
              </p>
            </div>
          </div>
        )}

        {/* Primary Audio & Practice Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* Big Speaker Button */}
          <button
            id="btn-play-speech"
            onClick={() => handlePlayAudio(1)}
            disabled={isPlaying}
            className={`flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-[0_4px_14px_rgba(255,107,0,0.3)] active:translate-y-0.5 ${
              isPlaying
                ? 'bg-orange-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 active:scale-98'
            }`}
          >
            <Volume2 className="w-6 h-6 shrink-0" />
            <span>{isPlaying ? '재생 중...' : '소리 듣기'}</span>
          </button>

          {/* 3x Repeat Button */}
          <button
            id="btn-repeat-3times"
            onClick={() => handlePlayAudio(3)}
            disabled={isPlaying}
            className="flex items-center justify-center gap-1.5 py-4 px-3 rounded-2xl font-black text-sm sm:text-base bg-blue-50 text-blue-900 border-2 border-blue-200 hover:bg-blue-100 active:translate-y-0.5 active:scale-98 transition-all"
            title="문장을 3번 연속으로 또박또박 들려드립니다"
          >
            <Repeat className="w-5 h-5 text-blue-600 shrink-0" />
            <span>3번 반복 듣기</span>
          </button>

          {/* Follow Along / Mic Button */}
          <button
            id="btn-practice-speaking"
            onClick={() => setShowSpeakingModal(true)}
            className="flex items-center justify-center gap-1.5 py-4 px-3 rounded-2xl font-black text-sm sm:text-base bg-emerald-50 text-emerald-900 border-2 border-emerald-300 hover:bg-emerald-100 active:translate-y-0.5 active:scale-98 transition-all"
            title="마이크를 누르고 직접 소리 내어 따라 읽어보세요"
          >
            <Mic className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>따라 말하기</span>
          </button>
        </div>
      </div>

      {/* Big Navigation Arrows */}
      <div className="w-full flex items-center justify-between gap-3 mt-4">
        {/* Previous Button */}
        <button
          id="btn-prev-card"
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white border-2 border-stone-300 font-bold text-base text-stone-700 hover:bg-orange-50/50 active:scale-98 transition-all shadow-2xs"
        >
          <ChevronLeft className="w-6 h-6 text-stone-600" />
          <span>이전 문장</span>
        </button>

        {/* Direct Play from between */}
        <button
          onClick={() => handlePlayAudio(1)}
          className="w-13 h-13 rounded-2xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 active:scale-95 transition-all shadow-md shrink-0"
          aria-label="다시 듣기"
        >
          <Volume2 className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          id="btn-next-card"
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-orange-500 border-2 border-orange-500 font-bold text-base text-white hover:bg-orange-600 active:scale-98 transition-all shadow-[0_4px_12px_rgba(255,107,0,0.25)]"
        >
          <span>다음 문장</span>
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Speaking Practice Modal */}
      <SpeakingModal
        sentence={currentSentence}
        isOpen={showSpeakingModal}
        onClose={() => setShowSpeakingModal(false)}
        speechRate={settings.speechRate}
      />
    </div>
  );
};
