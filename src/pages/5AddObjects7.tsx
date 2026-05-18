import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star } from "lucide-react";
import { MuteButton } from "@/components/MuteButton";

const speak = (text: string, rate = 0.9) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  }
};

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/* ─── Stand Up on Your Number (numerals 2–6) ─── */
const StandUpNumber = ({ onComplete }: { onComplete: () => void }) => {
  // Each round: a bag with N objects, a shown numeral. Child must "stand up" (match) or "hands on head" (different).
  const rounds = useMemo(
    () =>
      shuffle([
        { count: 6, shown: 6, emoji: "🔘" }, // buttons
        { count: 4, shown: 6, emoji: "🪙" }, // coins
        { count: 3, shown: 3, emoji: "🫘" }, // beans
        { count: 5, shown: 2, emoji: "🖍️" }, // crayons
        { count: 2, shown: 2, emoji: "🩹" }, // erasers
      ]),
    []
  );
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"" | "right" | "wrong">("");
  const r = rounds[step];
  const isMatch = r.count === r.shown;

  useEffect(() => {
    setResult("");
    speak(`Count the objects in your bag. The number card shows ${r.shown}.`);
  }, [step]);

  const answer = (choice: "stand" | "head") => {
    const correct = (choice === "stand" && isMatch) || (choice === "head" && !isMatch);
    if (correct) {
      setResult("right");
      speak(isMatch ? `Yes! ${r.count} matches ${r.shown}. Stand up!` : `Right! ${r.count} is different from ${r.shown}.`);
      setTimeout(() => {
        if (step + 1 >= rounds.length) onComplete();
        else setStep((s) => s + 1);
      }, 1600);
    } else {
      setResult("wrong");
      speak("Count again carefully.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Round {step + 1} of {rounds.length}</p>

      {/* numeral card */}
      <div className="mx-auto w-20 h-24 bg-white rounded-xl shadow-lg border-4 border-blue-400 flex items-center justify-center">
        <span className="font-fredoka text-5xl text-blue-900">{r.shown}</span>
      </div>

      {/* bag of objects */}
      <div className="bg-amber-100 border-4 border-amber-700 border-dashed rounded-3xl p-4 mx-auto max-w-[280px]">
        <p className="text-xs font-nunito text-amber-900 mb-2">Your bag:</p>
        <div className="flex flex-wrap justify-center gap-2 text-3xl">
          {Array.from({ length: r.count }).map((_, i) => (
            <span key={i}>{r.emoji}</span>
          ))}
        </div>
      </div>

      <p className="font-nunito text-sm text-blue-800">
        Does your bag have <strong>{r.shown}</strong>?
      </p>

      <div className="flex justify-center gap-3">
        <Button
          onClick={() => answer("stand")}
          className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-5 h-14 shadow-md"
        >
          🧍 Stand Up
        </Button>
        <Button
          onClick={() => answer("head")}
          className="bg-orange-400 hover:bg-orange-500 text-white rounded-2xl px-5 h-14 shadow-md"
        >
          🙆 Hands on Head
        </Button>
      </div>

      {result === "right" && (
        <p className="text-green-600 font-fredoka">
          <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> Great counting!
        </p>
      )}
      {result === "wrong" && <p className="text-orange-600 font-fredoka">Try again!</p>}
    </div>
  );
};

/* ─── Alligator Snaps – Say Ten count to 16 ─── */
const AlligatorSnaps = ({ onComplete }: { onComplete: () => void }) => {
  // Say Ten labels: 1..10, then "ten 1", "ten 2", ..., "ten 6"
  const sequence = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "ten 1", "ten 2", "ten 3", "ten 4", "ten 5", "ten 6",
  ];
  const [idx, setIdx] = useState(-1);
  const [open, setOpen] = useState(false);

  const snap = () => {
    if (idx + 1 >= sequence.length) {
      speak("16 fish! Allie is full!");
      setTimeout(onComplete, 1200);
      return;
    }
    const next = idx + 1;
    setIdx(next);
    setOpen(true);
    speak(sequence[next]);
    setTimeout(() => setOpen(false), 250);
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-nunito text-sm text-blue-700">
        Tap Allie to snap and catch a fish — Say Ten way to 16!
      </p>

      <div
        onClick={snap}
        className="mx-auto w-44 h-44 cursor-pointer select-none relative"
      >
        <div className="text-8xl transition-transform duration-150" style={{ transform: open ? "scaleY(1.15)" : "scaleY(1)" }}>
          🐊
        </div>
        {idx >= 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-fredoka text-lg shadow-lg">
            {idx + 1}
          </div>
        )}
      </div>

      <p className="font-fredoka text-2xl text-blue-900 h-8">
        {idx >= 0 ? sequence[idx] : "Tap to start!"}
      </p>

      <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
        {sequence.map((_, i) => (
          <span key={i} className={`text-xl ${i <= idx ? "" : "opacity-20 grayscale"}`}>🐟</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Fish Story Solver – place fish + answer ─── */
type Story = { partA: number; partB: number; setup: string; add: string; question: string };
const stories: Story[] = [
  { partA: 1, partB: 2, setup: "The fisherman caught 1 fish in the morning.", add: "He caught 2 more fish in the afternoon.", question: "How many fish did he catch in all?" },
  { partA: 2, partB: 1, setup: "2 fish were splashing in the river.", add: "1 more fish came to splash.", question: "How many fish are splashing now?" },
  { partA: 3, partB: 1, setup: "3 fish jumped into the air.", add: "1 more fish jumped, too.", question: "How many fish jumped?" },
  { partA: 2, partB: 3, setup: "Mr. Fox caught 2 fish at first.", add: "Then, he caught 3 fish.", question: "How many fish did he catch altogether?" },
  { partA: 4, partB: 1, setup: "4 fish went to swim in a shady part of the lake.", add: "1 more fish went to swim there, too.", question: "How many fish went to swim?" },
  { partA: 2, partB: 2, setup: "2 fish swam down the waterfall.", add: "2 other fish swam down the waterfall.", question: "How many fish swam down in all?" },
  { partA: 1, partB: 2, setup: "1 fish went to sleep.", add: "2 more fish went to sleep.", question: "How many fish are sleeping now?" },
];

const FishSolver = ({ pool, onComplete }: { pool: Story[]; onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [placedA, setPlacedA] = useState(0);
  const [placedB, setPlacedB] = useState(0);
  const [phase, setPhase] = useState<"setup" | "add" | "answer" | "done">("setup");
  const [options, setOptions] = useState<number[]>([]);
  const s = pool[step];
  const total = s.partA + s.partB;

  useEffect(() => {
    setPlacedA(0);
    setPlacedB(0);
    setPhase("setup");
    speak(s.setup);
  }, [step]);

  const placeA = () => {
    if (phase !== "setup" || placedA >= s.partA) return;
    const n = placedA + 1;
    setPlacedA(n);
    speak(String(n));
    if (n === s.partA) {
      setTimeout(() => {
        setPhase("add");
        speak(s.add);
      }, 700);
    }
  };

  const placeB = () => {
    if (phase !== "add" || placedB >= s.partB) return;
    const n = placedB + 1;
    setPlacedB(n);
    speak(String(s.partA + n));
    if (n === s.partB) {
      setTimeout(() => {
        speak(s.question);
        const distractors = shuffle([total - 1, total + 1, total + 2, total - 2].filter((x) => x > 0 && x !== total)).slice(0, 3);
        setOptions(shuffle([total, ...distractors]));
        setPhase("answer");
      }, 700);
    }
  };

  const answer = (n: number) => {
    if (n === total) {
      speak(`Yes! ${s.partA} fish and ${s.partB} fish make ${total} fish.`);
      setPhase("done");
      setTimeout(() => {
        if (step + 1 >= pool.length) onComplete();
        else setStep((x) => x + 1);
      }, 2200);
    } else {
      speak("Touch and count again.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Story {step + 1} of {pool.length}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-left font-nunito text-sm text-blue-900 space-y-1 min-h-[64px]">
        <p>📖 {s.setup}</p>
        {phase !== "setup" && <p>➕ {s.add}</p>}
        {phase === "answer" && <p className="font-bold pt-1">❓ {s.question}</p>}
      </div>

      {/* River scene */}
      <div className="bg-gradient-to-b from-sky-200 to-sky-400 border-4 border-blue-600 rounded-3xl p-4 min-h-[120px] relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-1 text-center text-2xl opacity-50">🌊🌊🌊🌊🌊</div>
        <div className="relative flex flex-wrap justify-center gap-2 text-4xl">
          {Array.from({ length: placedA }).map((_, i) => (
            <span key={`a${i}`} className="animate-in zoom-in-50 duration-300">🐟</span>
          ))}
          {Array.from({ length: placedB }).map((_, i) => (
            <span key={`b${i}`} className="animate-in zoom-in-50 duration-300">🐠</span>
          ))}
        </div>
      </div>

      {phase === "setup" && (
        <Button
          onClick={placeA}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-md"
        >
          Add a 🐟 ({placedA}/{s.partA})
        </Button>
      )}
      {phase === "add" && (
        <Button
          onClick={placeB}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl h-12 px-6 shadow-md"
        >
          Add a 🐠 ({placedB}/{s.partB})
        </Button>
      )}
      {phase === "answer" && (
        <div className="flex justify-center gap-2 flex-wrap">
          {options.map((n) => (
            <Button
              key={n}
              variant="outline"
              onClick={() => answer(n)}
              className="w-12 h-12 text-xl font-fredoka rounded-xl border-2 border-blue-300 hover:bg-blue-100"
            >
              {n}
            </Button>
          ))}
        </div>
      )}
      {phase === "done" && (
        <p className="text-green-600 font-fredoka text-lg">
          <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> {s.partA} and {s.partB} make {total}!
        </p>
      )}
    </div>
  );
};

/* ─── Main page ─── */
type Step = "intro" | "standUp" | "alligator" | "appProblem" | "practice" | "debrief" | "complete";

const AddObjects7 = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");

  const markComplete = () => {
    const saved = localStorage.getItem("ethio-stem-m5-completed");
    const completed: string[] = saved ? JSON.parse(saved) : [];
    if (!completed.includes("lesson-7")) {
      completed.push("lesson-7");
      localStorage.setItem("ethio-stem-m5-completed", JSON.stringify(completed));
    }
  };

  const flow: Step[] = ["intro", "standUp", "alligator", "appProblem", "practice", "debrief", "complete"];
  const goNext = (from: Step) => {
    const idx = flow.indexOf(from);
    if (idx < flow.length - 1) setStep(flow[idx + 1]);
  };

  useEffect(() => {
    if (step === "complete") markComplete();
  }, [step]);

  // app problem = first story (1+2 fisherman); practice = next 4
  const appPool = useMemo(() => [stories[0]], []);
  const practicePool = useMemo(() => stories.slice(1, 5), []);

  return (
    <div
      className="min-h-screen font-fredoka overflow-x-hidden"
      style={{ background: "linear-gradient(170deg, #dbeafe 0%, #bfdbfe 30%, #93c5fd 65%, #60a5fa 100%)" }}
    >
      {["🐟", "➕", "🎣", "🐊", "🌊"].map((e, i) => (
        <div
          key={i}
          className="fixed pointer-events-none select-none opacity-[0.06] text-6xl"
          style={{
            top: `${10 + i * 18}%`,
            left: i % 2 === 0 ? `${2 + i * 5}%` : undefined,
            right: i % 2 !== 0 ? `${3 + i * 4}%` : undefined,
            transform: `rotate(${i * 12 - 20}deg)`,
          }}
        >
          {e}
        </div>
      ))}

      <div className="container mx-auto px-4 py-6 max-w-xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/activities/module-5?last=lesson-7")}
            className="rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-fredoka text-sm bg-blue-800/20 text-blue-900 px-3 py-1 rounded-full">Lesson 7</span>
            <MuteButton className="h-9 w-9 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md" />
          </div>
        </div>

        {step === "intro" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
              <span className="text-4xl">🐟</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-blue-900 leading-tight">Addition with Objects!</h1>
            <p className="text-lg text-blue-800 font-nunito leading-relaxed max-w-md mx-auto">
              Today we'll count bags, snap with Allie, and use <strong>fish</strong> to solve addition stories!
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2 font-nunito text-sm text-blue-800 border border-blue-200">
              <p className="font-bold text-blue-900">🎯 Learning Goals</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Match groups of 2–6 to written numerals</li>
                <li>Say Ten count to 16</li>
                <li>Show <em>add to</em> stories with fish</li>
                <li>Find the total: "_ and _ make _"</li>
              </ul>
              <p className="font-bold text-blue-900 pt-2">💡 Parent Tip</p>
              <p>Have your child <em>touch and count</em> each fish, then retell the story before answering.</p>
            </div>
            <Button
              onClick={() => {
                speak("Let's solve addition stories with fish!");
                goNext("intro");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-6 rounded-full shadow-xl border-b-4 border-blue-800 transition-all hover:scale-105 active:scale-95"
            >
              Let's Start! 🐟
            </Button>
          </Card>
        )}

        {step === "standUp" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🧍 Stand Up on Your Number!</h2>
            <p className="font-nunito text-blue-700 text-sm">
              Count your bag. If it matches the card, stand up!
            </p>
            <StandUpNumber
              onComplete={() => {
                speak("Now let's snap with Allie!");
                setTimeout(() => goNext("standUp"), 1200);
              }}
            />
          </Card>
        )}

        {step === "alligator" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🐊 Alligator Snaps!</h2>
            <p className="font-nunito text-blue-700 text-sm">Help Allie catch 16 fish — Say Ten way!</p>
            <AlligatorSnaps
              onComplete={() => {
                speak("Time to solve a fish story!");
                setTimeout(() => goNext("alligator"), 1500);
              }}
            />
          </Card>
        )}

        {step === "appProblem" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🎣 The Fisherman's Catch</h2>
            <p className="font-nunito text-blue-700 text-sm">Act out the story with your fish cards.</p>
            <FishSolver
              pool={appPool}
              onComplete={() => {
                speak("Great solving! Let's try more!");
                setTimeout(() => goNext("appProblem"), 1500);
              }}
            />
          </Card>
        )}

        {step === "practice" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🐟 Fish Story Practice!</h2>
            <p className="font-nunito text-blue-700 text-sm">Use your fish to show each story, then find the total.</p>
            <FishSolver
              pool={practicePool}
              onComplete={() => {
                speak("You solved every fish story! Let's reflect.");
                setTimeout(() => goNext("practice"), 1500);
              }}
            />
          </Card>
        )}

        {step === "debrief" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🤔 Think About It!</h2>
            <div className="space-y-3 font-nunito text-blue-800 text-left bg-blue-50 rounded-2xl p-5 border border-blue-200 text-sm">
              <p>🐟 In our stories, did we <strong>add</strong> more fish or take fish away?</p>
              <p>➕ When we add more fish, the group gets <strong>bigger</strong>. We call this <em>addition</em>.</p>
              <p>🗣️ Saying <em>"2 fish and 3 fish make 5 fish"</em> helps us remember the parts and the total.</p>
              <p>🎭 Last lesson we used paper dolls. Today we used fish — both help us <strong>see</strong> the story!</p>
            </div>
            <Button
              onClick={() => {
                speak("Amazing addition work!");
                goNext("debrief");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-6 rounded-full shadow-xl border-b-4 border-blue-800"
            >
              Finish! 🌟
            </Button>
          </Card>
        )}

        {step === "complete" && (
          <Card
            className="border-0 overflow-hidden shadow-2xl rounded-[2.5rem] p-10 text-center space-y-6 animate-in zoom-in-95 duration-700"
            style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb, #60a5fa)" }}
          >
            <div className="text-7xl animate-bounce">🏆</div>
            <h2 className="text-4xl text-white drop-shadow-lg">Lesson 7 Complete!</h2>
            <p className="text-xl text-blue-100 font-nunito leading-relaxed max-w-md mx-auto">
              You solved addition stories with <strong>fish objects</strong>!
              <br />
              Keep counting and adding!
            </p>
            <div className="flex justify-center gap-3 text-3xl">
              {["2", "+", "3", "=", "5"].map((n, i) => (
                <span key={i} className="bg-white/20 rounded-lg w-11 h-11 flex items-center justify-center font-fredoka text-white">
                  {n}
                </span>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setStep("intro")}
                className="flex-1 h-14 bg-white/15 hover:bg-white/25 text-white text-lg rounded-2xl border border-white/20"
              >
                Again 🔄
              </Button>
              <Button
                onClick={() => navigate("/activities/module-5?last=lesson-7")}
                className="flex-1 h-14 bg-white text-blue-800 hover:bg-blue-50 text-lg rounded-2xl shadow-lg"
              >
                Done! ✨
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddObjects7;
