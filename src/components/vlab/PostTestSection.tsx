import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Calendar,
  ArrowRight,
  X,
  ChevronRight,
} from 'lucide-react';

interface ScenarioQuestion {
  id: number;
  scenario: string;
  question: string;
  options: {
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

const POST_TEST_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 1,
    scenario: 'Scenario 01: OSPF Physical Link Drop',
    question: 'Router R1 detects interface DOWN on its direct link to neighbor R2. What control-plane events execute across the area?',
    options: [
      {
        label: 'A',
        text: 'R1 requests full routing tables from all adjacent peers via unicast UDP query messages.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'R1 originates a Type-1 Router LSA, floods it across the area, and all nodes re-run Dijkstra SPF locally.',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'R1 increments its metric for R2 to 16 and sends triggered Poison Reverse vectors.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'R1 suppresses all routing updates and enters a 180-second hold-down timer.',
        isCorrect: false,
      },
    ],
    explanation: 'OSPF is event-driven: interface state changes trigger instantaneous LSA flooding and local Dijkstra recomputation without routing loops.',
  },
  {
    id: 2,
    scenario: 'Scenario 02: Link Sever Without Split Horizon',
    question: 'A 3-node RIP network connects A ── B ── C (costs = 1). The B-C link fails. Without Split Horizon, what sequence occurs?',
    options: [
      {
        label: 'A',
        text: 'B marks C unreachable; both A and B immediately purge the entry in 1 cycle.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'B accepts A\'s advertisement of cost 2, updates to 3; A updates to 4, mutually counting to 16 (Infinity).',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'Packets to C drop immediately while A routes traffic to an alternate default gateway.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'A and B elect a Designated Router (DR) to suppress duplicate distance vector broadcasts.',
        isCorrect: false,
      },
    ],
    explanation: 'Without Split Horizon, B believes A has an independent alternate route to C, causing endless mutual metric increments up to 16.',
  },
  {
    id: 3,
    scenario: 'Scenario 03: Dijkstra Set N\' Invariant',
    question: "In Dijkstra's algorithm, what invariant is mathematically guaranteed for every node u in the settled set N'?",
    options: [
      {
        label: 'A',
        text: 'Node u has tentative connections to at least two unexplored frontier nodes.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'The tentative distance D(u) is provably the absolute minimum shortest path cost and will never be relaxed again.',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'Node u has the highest link cost among all adjacent network neighbors.',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Node u is designated as the root of the next iteration\'s spanning tree.',
        isCorrect: false,
      },
    ],
    explanation: 'Because edge costs are non-negative, once a node with minimum distance enters N\', no alternative unexplored path can yield a lower cost.',
  },
  {
    id: 4,
    scenario: 'Scenario 04: Multi-Node Mesh Limitations',
    question: 'Why do Split Horizon and Poison Reverse fail to guarantee complete loop prevention in ring topologies of 3 or more nodes?',
    options: [
      {
        label: 'A',
        text: 'RIP periodic update frames exceed Ethernet maximum transmission unit (MTU).',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'They only break 2-node ping-pong dependencies; rumors can still circulate in 3-node cycles (A ➔ B ➔ C ➔ A).',
        isCorrect: true,
      },
      {
        label: 'C',
        text: 'Poison Reverse is mathematically incompatible with Variable-Length Subnet Masking (VLSM).',
        isCorrect: false,
      },
      {
        label: 'D',
        text: 'Multi-node rings cannot exchange vectors without IGMP snooping multicast support.',
        isCorrect: false,
      },
    ],
    explanation: 'Split Horizon only suppresses direct two-node feedback; in a 3-router ring, stale rumors propagate around the perimeter until timer timeout.',
  },
  {
    id: 5,
    scenario: 'Scenario 05: Core Backbone Architecture',
    question: 'Why is Link-State (OSPF/IS-IS) strictly favored over Distance-Vector (RIP) for large enterprise backbones?',
    options: [
      {
        label: 'A',
        text: 'Link-State uses broadcast UDP instead of IP protocol numbers, simplifying firewall traversal.',
        isCorrect: false,
      },
      {
        label: 'B',
        text: 'Distance-Vector protocols require O(V³) memory on every core transit switch.',
        isCorrect: false,
      },
      {
        label: 'C',
        text: 'Link-State provides full-topology visibility, event-driven SPF convergence, sub-50ms failover, and zero loop risks.',
        isCorrect: true,
      },
      {
        label: 'D',
        text: 'Distance-Vector protocols cannot support point-to-point fiber optic transceivers.',
        isCorrect: false,
      },
    ],
    explanation: 'RIP\'s 15-hop diameter ceiling and slow convergence are non-viable at scale; OSPF synchronizes the complete graph for instant calculation.',
  },
];

interface PostTestSectionProps {
  onReviewTheory?: () => void;
}

export const PostTestSection: React.FC<PostTestSectionProps> = ({ onReviewTheory }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('Cadet Network Engineer');
  const [verificationId] = useState<string>(() => {
    const chars = '0123456789ABCDEF';
    let id = 'VLAB-RT-';
    for (let i = 0; i < 5; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  });

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
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const totalQuestions = POST_TEST_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const correctCount = POST_TEST_QUESTIONS.reduce((acc, q) => {
    const selected = selectedAnswers[q.id];
    if (selected !== undefined && q.options[selected]?.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 80;

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
              PHASE 2 · POST-ASSESSMENT
            </span>
            {isSubmitted && (
              <span className={`ml-2 font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded font-bold border ${
                isPassed
                  ? 'bg-white/15 text-white border-white/30'
                  : 'bg-white/5 text-zinc-400 border-white/10'
              }`}>
                {isPassed ? `PASSED (${percentage}%)` : `SCORE: ${correctCount}/${totalQuestions}`}
              </span>
            )}
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Post-Test
          </h2>
          <p className="font-['Geist'] text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Assess your comprehensive mastery of Link-State (OSPF/IS-IS) failover convergence, Bellman-Ford count-to-infinity pathology, and RFC 2453 mitigations after completing the lab.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="shrink-0 self-start sm:self-center px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-['Geist'] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>{isSubmitted ? 'Review Post-Test' : 'Take Post-Test'}</span>
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
                aria-labelledby="posttest-modal-title"
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
                      POST-ASSESSMENT // CERTIFICATION
                    </span>
                  </div>
                  <h3
                    id="posttest-modal-title"
                    className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl sm:text-2xl text-white tracking-tight"
                  >
                    Post-Lab Scenario Certification
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-['JetBrains_Mono'] text-xs text-white">
                    {isSubmitted ? (
                      <span>
                        Result: <strong className="text-white">{percentage}%</strong> ({correctCount}/{totalQuestions})
                      </span>
                    ) : (
                      <span>
                        Answered: <strong className="text-white">{answeredCount}</strong> / {totalQuestions}
                      </span>
                    )}
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

              {/* Scrollable Questions & Certificate Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-140px)]">
                {/* Submitted Results Banner */}
                {isSubmitted && (
                  <div className="rounded-2xl border border-white/20 p-5 sm:p-6 bg-zinc-900/90 text-zinc-200 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white shrink-0">
                          {isPassed ? <Award className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg sm:text-xl text-white">
                            {isPassed
                              ? 'Assessment Passed — Competency Verified'
                              : 'Benchmark Not Met — Theory Review Advised'}
                          </h4>
                          <p className="font-['Geist'] text-xs sm:text-sm text-zinc-300 mt-1">
                            {isPassed
                              ? `Outstanding! You achieved ${percentage}% (${correctCount}/${totalQuestions} correct), demonstrating command over interior gateway routing protocols.`
                              : `You scored ${percentage}% (${correctCount}/${totalQuestions} correct). An 80% score (minimum 4 correct answers) is required to unlock your credential.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-['JetBrains_Mono'] shrink-0">
                        <button
                          onClick={handleResetExam}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Retake
                        </button>
                        {!isPassed && onReviewTheory && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onReviewTheory();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Theory
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scenario Questions Stack */}
                <div className="space-y-5">
                  {POST_TEST_QUESTIONS.map((q, qIndex) => {
                    const selectedIdx = selectedAnswers[q.id];
                    const isAnswered = selectedIdx !== undefined;

                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 transition-all duration-200 hover:border-white/20"
                      >
                        {/* Question Header Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                              [Q-0{qIndex + 1} / 0{totalQuestions}]
                            </span>
                            <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider">
                              // {q.scenario}
                            </span>
                          </div>

                          {isSubmitted && isAnswered && (
                            <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold">
                              {q.options[selectedIdx]?.isCorrect ? (
                                <span className="text-white flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/30 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> CORRECT (+1)
                                </span>
                              ) : (
                                <span className="text-zinc-400 flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                                  <XCircle className="w-3.5 h-3.5" /> INCORRECT
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Question Text */}
                        <h4 className="font-['Geist'] font-medium text-white text-sm sm:text-base leading-snug mb-4">
                          {q.question}
                        </h4>

                        {/* Answer Selection Boxes */}
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedIdx === optIdx;
                            const showCorrect = isSubmitted && opt.isCorrect;
                            const showWrong = isSubmitted && isSelected && !opt.isCorrect;

                            let boxClass =
                              'bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] text-zinc-300';

                            if (showCorrect) {
                              boxClass =
                                'border-white bg-white/15 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]';
                            } else if (showWrong) {
                              boxClass = 'border-zinc-700 bg-zinc-900/60 text-zinc-500';
                            } else if (isSelected) {
                              boxClass = 'border-white bg-white/10 text-white font-medium';
                            } else if (isSubmitted) {
                              boxClass = 'border-white/5 bg-black/20 text-zinc-600 opacity-40';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all text-xs sm:text-sm font-['Geist'] cursor-pointer border ${boxClass}`}
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
                        {isSubmitted && (
                          <div className="mt-3.5 bg-white/5 border border-white/10 p-3 rounded-lg text-xs font-['Geist'] text-zinc-300 flex items-start gap-2 animate-in fade-in duration-200">
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

                {/* Submission Prompt Bar */}
                {!isSubmitted && (
                  <div className="rounded-2xl border border-white/15 bg-black/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 text-center sm:text-left">
                      {answeredCount === totalQuestions
                        ? 'All 5 scenarios completed. Ready to submit for certification.'
                        : `Answer all questions (${answeredCount}/${totalQuestions} answered) before grading.`}
                    </span>

                    <button
                      disabled={answeredCount < totalQuestions}
                      onClick={handleSubmitExam}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-['JetBrains_Mono'] text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        answeredCount === totalQuestions
                          ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer'
                          : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      <span>Submit for Certification</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Virtual Lab Competency Certificate (If Passed) */}
                {isSubmitted && isPassed && (
                  <div className="relative rounded-2xl bg-zinc-950 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black">
                    <div className="border border-white/10 rounded-xl p-6 sm:p-8 bg-black/60 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">
                              VIRTUAL SYSTEMS LABS • DISTRIBUTED ROUTING
                            </span>
                            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase">
                              Certificate of Competency
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end font-['JetBrains_Mono'] text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1.5 text-white font-bold">
                            <Fingerprint className="w-3.5 h-3.5" />
                            VERIFICATION ID: {verificationId}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-500 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            ISSUED: {currentDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-center my-6 space-y-4">
                        <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 uppercase tracking-widest block">
                          THIS OFFICIAL CREDENTIAL ATTESTS THAT
                        </span>

                        <div className="max-w-md mx-auto">
                          <input
                            type="text"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            placeholder="Enter Cadet Name"
                            className="w-full text-center font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-white bg-transparent border-b-2 border-white/30 focus:border-white focus:outline-none pb-2 transition-colors placeholder:text-zinc-600"
                          />
                        </div>

                        <p className="font-['Geist'] text-zinc-300 text-sm max-w-xl mx-auto leading-relaxed pt-2">
                          has successfully completed rigorous computational auditing of Link-State (Dijkstra SPF) and Distance-Vector (Bellman-Ford) routing paradigms with a passing score of <strong className="text-white font-mono">{percentage}%</strong>.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs font-['JetBrains_Mono']">
                        <div className="text-zinc-500 text-[10px]">
                          RFC 2328 &bull; RFC 2453 VALIDATED &bull; BLOOM LEVEL 4
                        </div>

                        <button
                          onClick={handlePrintCertificate}
                          className="px-4 py-2 rounded-xl bg-white text-black font-extrabold flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)] cursor-pointer print:hidden"
                        >
                          <Printer className="w-4 h-4" />
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/50 shrink-0">
                <button
                  onClick={handleResetExam}
                  className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Exam
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white text-black text-xs font-['Geist'] font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
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

export default PostTestSection;
