import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface Question {
  id: number;
  topic: string;
  question: string;
  options: {
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

const PRE_TEST_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'Core Philosophy',
    question: 'What is the fundamental divergence between Link-State and Distance-Vector protocols?',
    options: [
      {
        label: 'A',
        text: 'Link-State uses rumor routing to peers; Distance-Vector floods global topology.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'Link-State floods local link state to all routers; Distance-Vector exchanges tables with direct neighbors only.',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'Link-State is distributed dynamic programming; Distance-Vector builds centralized greedy trees.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Link-State only works on point-to-point lines; Distance-Vector requires broadcast media.',
        isCorrect: false,
      },
    ],
    explanation: 'Link-State tells everyone about immediate neighbors (LSP flooding); Distance-Vector tells immediate neighbors about everyone (vector passing).',
  },
  {
    id: 2,
    topic: 'Edge Constraints',
    question: "What mathematical constraint must edge costs satisfy for Dijkstra SPF to guarantee correctness?",
    options: [
      {
        label: 'A',
        text: 'All edge weights must be strictly non-negative: c(u, v) ≥ 0.',
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'All edge weights must be integers between 1 and 15.',
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Edge costs must be identical in both directions: c(u, v) = c(v, u).',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'The network graph must be an acyclic tree prior to computation.',
        isCorrect: false,
      },
    ],
    explanation: "Dijkstra's greedy paradigm assumes path costs never decrease upon extension; negative weights invalidate settled node invariants.",
  },
  {
    id: 3,
    topic: 'Loop Pathology',
    question: 'What is the primary root cause of the "Count-to-Infinity" loop pathology in Distance-Vector routing?',
    options: [
      {
        label: 'A',
        text: 'Hardware interface buffer exhaustion during flash route updates.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'Routers accept neighbor rumors that depend on the very link that just failed.',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'High CPU utilization when periodic 30-second RIP update timers expire.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Broadcast domain ARP storm saturation locking up routing tables.',
        isCorrect: false,
      },
    ],
    explanation: 'Without global topology maps, routers blindly trust neighbor rumors originally routed through the severed link, causing mutual metric inflation.',
  },
  {
    id: 4,
    topic: 'Poison Reverse',
    question: 'How does Poison Reverse prevent immediate two-node routing loops?',
    options: [
      {
        label: 'A',
        text: 'It pauses all route updates across serial links for 180 seconds.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'If Router B reaches Dest via A, B explicitly advertises metric ∞ (16) back to A.',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'It drops packets arriving from neighbors with costs greater than 15.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'It forces Router A to calculate an alternate tree using backup LSDB records.',
        isCorrect: false,
      },
    ],
    explanation: 'Advertising metric 16 back to the route supplier explicitly informs them that you cannot serve as an alternate path for that destination.',
  },
  {
    id: 5,
    topic: 'Protocol Mapping',
    question: 'Which mapping accurately assigns interior gateway protocols to their algorithms?',
    options: [
      {
        label: 'A',
        text: 'OSPF & IS-IS ➔ Link-State (Dijkstra); RIP & EIGRP ➔ Distance-Vector (Bellman-Ford / DUAL).',
        isCorrect: true,
      },
      {
        label: 'B',
        text: 'OSPF & RIP ➔ Link-State; IS-IS & BGP ➔ Distance-Vector.',
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'EIGRP & IS-IS ➔ Link-State; RIP & OSPF ➔ Distance-Vector.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'RIPv2 ➔ Link-State; OSPFv3 ➔ Distance-Vector.',
        isCorrect: false,
      },
    ],
    explanation: 'OSPF and IS-IS execute Dijkstra SPF over synchronized LSDBs; RIP and EIGRP rely on distributed distance-vector iterations.',
  },
];

interface PreTestSectionProps {
  onProceedToTheory?: () => void;
  onProceedToSimulation?: () => void;
  onProceedToPostTest?: () => void;
}

export const PreTestSection: React.FC<PreTestSectionProps> = ({
  onProceedToTheory,
  onProceedToSimulation,
  onProceedToPostTest,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // Prevent background scroll when pop-out modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  const totalQuestions = PRE_TEST_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isCompleted = answeredCount === totalQuestions;
  const correctCount = PRE_TEST_QUESTIONS.reduce((acc, q) => {
    const selected = selectedAnswers[q.id];
    if (selected !== undefined && q.options[selected]?.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleAdvanceToSimulation = () => {
    setIsOpen(false);
    if (onProceedToSimulation) {
      onProceedToSimulation();
    } else if (onProceedToPostTest) {
      onProceedToPostTest();
    } else {
      setTimeout(() => {
        document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="w-full font-['Geist']">
      {/* =================================================================== */}
      {/* 1. SLIM TEASER CARD (Matches User Attached Reference Screenshot)    */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-white/10 bg-[#090a0f] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/20 transition-all shadow-2xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="font-['JetBrains_Mono'] text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-400">
              PHASE 1 · BASELINE ASSESSMENT
            </span>
            {isCompleted && (
              <span className="ml-2 font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/20">
                SCORE: {correctCount}/{totalQuestions}
              </span>
            )}
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Pre-Test
          </h2>
          <p className="font-['Geist'] text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Assess your foundational understanding of shortest path constraints, Dijkstra edge relaxation, and routing invariants before starting the lab.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="shrink-0 self-start sm:self-center px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-['Geist'] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>{answeredCount > 0 ? 'Review Pre-Test' : 'Take Pre-Test'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* =================================================================== */}
      {/* 2. POP-OUT INTERACTIVE MODAL DIALOG (VLSM-VLab Pop-Out Engine)      */}
      {/* =================================================================== */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pretest-modal-title"
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden"
              >
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Dialog Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-zinc-950 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/50 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400 uppercase tracking-widest">
                      BASELINE ASSESSMENT
                    </span>
                  </div>
                  <h3
                    id="pretest-modal-title"
                    className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl sm:text-2xl text-white tracking-tight"
                  >
                    Pre-Test Diagnostic
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-['JetBrains_Mono'] text-xs text-white">
                    Score: <strong className="text-white">{correctCount}</strong> / {totalQuestions}
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close modal"
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Questions Stack */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {PRE_TEST_QUESTIONS.map((q, qIndex) => {
                  const selectedIdx = selectedAnswers[q.id];
                  const isAnswered = selectedIdx !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-white/15 bg-zinc-900/90 p-5 sm:p-6 shadow-lg transition-all"
                    >
                      {/* Question Header Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-['JetBrains_Mono'] text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                            [Q-0{qIndex + 1} / 0{totalQuestions}]
                          </span>
                          <span className="font-['JetBrains_Mono'] text-[11px] text-zinc-500 uppercase tracking-wider">
                            // {q.topic}
                          </span>
                        </div>

                        {isAnswered && (
                          <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold">
                            {q.options[selectedIdx]?.isCorrect ? (
                              <span className="text-white flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> CORRECT (+1)
                              </span>
                            ) : (
                              <span className="text-zinc-400 flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                <XCircle className="w-3.5 h-3.5" /> INCORRECT
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Question Text */}
                      <h4 className="font-['Geist'] font-semibold text-white text-sm sm:text-base leading-snug mb-4">
                        {q.question}
                      </h4>

                      {/* Answer Selection Boxes */}
                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedIdx === optIdx;
                          const showCorrect = isAnswered && opt.isCorrect;
                          const showWrong = isAnswered && isSelected && !opt.isCorrect;

                          let boxClass =
                            'bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.06] text-zinc-300';

                          if (showCorrect) {
                            boxClass =
                              'border-white bg-white/15 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]';
                          } else if (showWrong) {
                            boxClass = 'border-zinc-700 bg-zinc-900/60 text-zinc-500';
                          } else if (isSelected) {
                            boxClass = 'border-white bg-white/10 text-white font-medium';
                          } else if (isAnswered) {
                            boxClass = 'border-white/5 bg-black/20 text-zinc-600 opacity-40';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl flex items-center gap-3.5 transition-all text-xs sm:text-sm font-['Geist'] cursor-pointer border ${boxClass}`}
                            >
                              <span
                                className={`font-['JetBrains_Mono'] text-xs font-bold px-2 py-0.5 rounded shrink-0 transition-colors ${
                                  showCorrect
                                    ? 'bg-white text-black font-extrabold'
                                    : showWrong
                                    ? 'bg-zinc-800 text-zinc-400'
                                    : isSelected
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-zinc-400'
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="leading-relaxed flex-1">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Instant Micro-Explanation */}
                      {isAnswered && (
                        <div className="mt-4 bg-white/5 border border-white/10 p-3 rounded-lg text-xs font-['Geist'] text-zinc-300 flex items-start gap-2 animate-in fade-in duration-200">
                          <span className="font-['JetBrains_Mono'] font-bold text-white shrink-0 text-[10px] uppercase">
                            RATIONALE:
                          </span>
                          <span className="leading-relaxed">{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-black/50 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Quiz
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onProceedToTheory) onProceedToTheory();
                      else document.getElementById('theory')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Review Theory
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleAdvanceToSimulation}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white text-black font-['JetBrains_Mono'] text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-black" />
                    Advance to Simulation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};

export default PreTestSection;
