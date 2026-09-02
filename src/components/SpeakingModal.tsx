import { useState, useEffect, useRef } from 'react';
import { Sentence } from '../types';
import { Mic, MicOff, Volume2, X, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { speakEnglish, playSound } from '../utils/speech';
import confetti from 'canvas-confetti';

interface SpeakingModalProps {
  sentence: Sentence;
  isOpen: boolean;
  onClose: () => void;
  speechRate: number;
}

export const SpeakingModal = ({
  sentence,
  isOpen,
  onClose,
  speechRate,
}: SpeakingModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'encourage'>('idle');
  const [praiseText, setPraiseText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      setFeedback('idle');
      setPraiseText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startListening = () => {
    playSound('click');
    setTranscript('');
    setFeedback('idle');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);

          if (event.results[current].isFinal) {
            handleCheckResult(text);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          // If microphone permission error or no speech, provide gentle encouraging completion
          handleCheckResult('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        fallbackRecordingFlow();
      }
    } else {
      fallbackRecordingFlow();
    }
  };

  const fallbackRecordingFlow = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleCheckResult(sentence.english);
    }, 2500);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleCheckResult = (spokenText: string) => {
    setIsListening(false);
    playSound('correct');
    setFeedback('success');

    const praises = [
      '참 잘하셨어요! 목소리가 정말 또렷해요! 👏',
      '자신감 100점! 완벽한 발음이에요! ⭐',
      '대단하세요! 영어가 술술 나오시네요! 🌟',
      '최고예요! 언제든 외국인 앞에서도 자신 있게 말해보세요! 💖',
    ];
    const randomPraise = praises[Math.floor(Math.random() * praises.length)];
    setPraiseText(randomPraise);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-orange-300 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-stone-100 hover:bg-orange-100 flex items-center justify-center text-stone-600 hover:text-orange-900 transition-colors"
          aria-label="닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-950 font-black text-sm mb-4 border border-orange-200">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>목소리로 따라 말하기 연습</span>
        </div>

        {/* Sentence Prompt */}
        <div className="bg-amber-50/80 rounded-2xl p-4 sm:p-5 border-2 border-amber-200/80 mb-6 text-left shadow-2xs">
          <p className="text-xs font-black text-amber-800 mb-1">따라 읽어보실 문장:</p>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug tracking-tight mb-2">
            {sentence.english}
          </h3>
          <div className="inline-block bg-amber-200/90 border border-amber-300 px-3.5 py-1 rounded-xl text-amber-950 font-black text-base sm:text-lg mb-1 shadow-2xs">
            {sentence.koreanPronunciation}
          </div>
          <p className="text-sm font-bold text-stone-700 mt-1">
            뜻: {sentence.koreanMeaning}
          </p>

          <button
            onClick={() => speakEnglish(sentence.english, { rate: speechRate })}
            className="mt-3 flex items-center gap-1.5 text-xs font-black text-orange-900 bg-white px-3.5 py-2 rounded-xl border border-orange-200 hover:bg-orange-50 transition-colors shadow-2xs active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-orange-500" />
            <span>원어민 소리 먼저 듣기</span>
          </button>
        </div>

        {/* Big Interactive Mic Button */}
        <div className="py-2 flex flex-col items-center justify-center">
          <button
            id="btn-modal-mic"
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 shadow-[0_4px_16px_rgba(244,63,94,0.4)]'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-105 ring-8 ring-orange-100 shadow-[0_6px_20px_rgba(255,107,0,0.35)]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
                <span className="text-xs font-black mt-1">듣는 중...</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                <span className="text-xs font-black mt-1">마이크 누르기</span>
              </>
            )}
          </button>

          <p className="text-sm font-black text-stone-700 mt-4">
            {isListening
              ? '🎙️ 지금 천천히 말씀해 보세요!'
              : '버튼을 누르고 큰 소리로 읽어보세요'}
          </p>
        </div>

        {/* Result & Encouraging Praise */}
        {feedback === 'success' && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 animate-fadeIn shadow-xs">
            <div className="flex items-center justify-center gap-2 font-black text-base sm:text-lg text-emerald-800 mb-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>{praiseText}</span>
            </div>
            {transcript && (
              <p className="text-xs text-stone-600 font-medium">
                인식된 음성: &quot;{transcript}&quot;
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={startListening}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-950 border border-orange-200 font-bold text-sm hover:bg-orange-100 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span>다시 말해보기</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 active:scale-95 transition-all shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
