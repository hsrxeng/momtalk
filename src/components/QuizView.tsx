import { useState, useEffect } from 'react';
import { QuizItem, AppSettings } from '../types';
import { Volume2, CheckCircle2, XCircle, Sparkles, Trophy, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';
import { speakEnglish, playSound } from '../utils/speech';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  quizList: QuizItem[];
  settings: AppSettings;
}

export const QuizView = ({ quizList, settings }: QuizViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuiz = quizList[currentIndex];

  useEffect(() => {
    setSelectedOptionIndex(null);
    setIsAnswered(false);
  }, [currentIndex]);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const isCorrect = currentQuiz.options[index].isCorrect;

    if (isCorrect) {
      playSound('correct');
      setScore((prev) => prev + 1);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    } else {
      playSound('try-again');
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex < quizList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      playSound('cheer');
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  const handlePlayAudio = (text: string) => {
    speakEnglish(text, { rate: settings.speechRate });
  };

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-4 border-orange-300">
          <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-4 shadow-sm">
            <Trophy className="w-10 h-10" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-900 font-black text-xs sm:text-sm mb-2 border border-orange-200">
            퀴즈 완주 축하합니다!
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2">
            어머니, 정말 대단하세요! 👏
          </h2>

          <p className="text-stone-600 font-semibold text-base mb-6">
            총 {quizList.length}문제 중 <strong className="text-orange-600 text-xl font-black">{score}</strong>문제를 맞히셨어요!
          </p>

          <div className="bg-amber-50/90 rounded-2xl p-5 border-2 border-amber-200 text-left mb-6 shadow-2xs">
            <p className="font-black text-amber-950 text-sm mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>칭찬 응원 한마디:</span>
            </p>
            <p className="text-sm font-medium text-stone-700 leading-relaxed">
              매일 한 걸음씩 영어와 친해지고 계세요. 틀린 문제도 걱정 마시고 언제든 다시 가볍게 즐겨보세요!
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)] hover:brightness-105 active:scale-98 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>처음부터 다시 풀어보기</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuiz) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-orange-900 bg-orange-100 px-3.5 py-1 rounded-xl text-xs sm:text-sm border border-orange-200">
            문제 {currentIndex + 1} / {quizList.length}
          </span>
          <span className="text-xs font-bold text-stone-500">부담 없는 2지선다</span>
        </div>
        <div className="text-xs font-bold text-stone-600">
          맞힌 개수: <strong className="text-orange-600 font-black">{score}</strong>개
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-2 border-orange-100/90 relative mb-4">
        <span className="text-xs font-bold text-stone-500 block mb-1">
          알맞은 영어 표현을 골라보세요:
        </span>

        {/* Question Prompt */}
        <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug mb-3">
          {currentQuiz.question}
        </h3>

        {/* Listen Prompt Button if available */}
        {currentQuiz.audioText && (
          <button
            onClick={() => handlePlayAudio(currentQuiz.audioText!)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-900 border border-orange-200 text-xs sm:text-sm font-bold hover:bg-orange-100 active:scale-95 transition-all mb-4 shadow-2xs"
          >
            <Volume2 className="w-4 h-4 text-orange-500" />
            <span>힌트 소리 듣기</span>
          </button>
        )}

        {/* 2 Big Choice Buttons */}
        <div className="space-y-3 mt-2">
          {currentQuiz.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrectOption = option.isCorrect;

            let buttonStyle = 'bg-stone-50/80 border-stone-200/90 text-stone-900 hover:bg-orange-50/60 hover:border-orange-300';

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 ring-3 ring-emerald-200 text-emerald-950 shadow-xs';
              } else if (isSelected && !isCorrectOption) {
                buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200';
              } else {
                buttonStyle = 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                id={`btn-quiz-opt-${idx}`}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3.5 shadow-2xs ${buttonStyle}`}
              >
                {/* Number Badge */}
                <span
                  className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 mt-0.5 ${
                    isAnswered && isCorrectOption
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isAnswered && isSelected && !isCorrectOption
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {idx === 0 ? 'A' : 'B'}
                </span>

                {/* Text Content */}
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-black leading-snug">
                    {option.english}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-amber-950 mt-1">
                    발음: {option.koreanPronunciation}
                  </p>
                </div>

                {/* Right Result Indicator */}
                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 self-center" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-6 h-6 text-rose-500 shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Feedback & Explanation Box */}
        {isAnswered && (
          <div
            className={`mt-5 p-4 sm:p-5 rounded-2xl border-2 animate-fadeIn ${
              selectedOptionIndex !== null && currentQuiz.options[selectedOptionIndex].isCorrect
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-1">
              {selectedOptionIndex !== null && currentQuiz.options[selectedOptionIndex].isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>딩동댕! 정답입니다! 👏</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                  <span>아쉬워요! 정답을 확인해 보세요.</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium text-stone-700 mt-1 leading-relaxed">
              {currentQuiz.explanation}
            </p>

            {/* Pronounce the correct answer */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  const correctOpt = currentQuiz.options.find((o) => o.isCorrect);
                  if (correctOpt) handlePlayAudio(correctOpt.english);
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 shadow-2xs hover:bg-orange-50 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                <span>정답 발음 다시 듣기</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next Question Navigation */}
      {isAnswered && (
        <button
          id="btn-quiz-next"
          onClick={handleNextQuestion}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-black text-base sm:text-lg shadow-[0_4px_14px_rgba(255,107,0,0.3)] transition-all flex items-center justify-center gap-2 animate-bounce"
        >
          <span>
            {currentIndex < quizList.length - 1 ? '다음 문제 풀기' : '결과 보기'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
