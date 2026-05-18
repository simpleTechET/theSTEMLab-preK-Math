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

/* ─── Stand Up on Your Number (numerals 3–7) ─── */
const StandUpNumber = ({ onComplete }: { onComplete: () => void }) => {
  const rounds = useMemo(
    () =>
      shuffle([
        { count: 7, shown: 7, emoji: "🔘" },
        { count: 4, shown: 7, emoji: "🪙" },
        { count: 3, shown: 5, emoji: "🫘" },
        { count: 6, shown: 6, emoji: "🖍️" },
        { count: 5, shown: 3, emoji: "🩹" },
      ]),
    []
  );
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"" | "right" | "wrong">("");
  const r = rounds[step];
  const isMatch = r.count === r.shown;

  useEffect(() => {
    setResult("");
    speak(`Count your bag. The card shows ${r.shown}.`);
  }, [step]);

  const answer = (choice: "stand" | "head") => {
    const correct = (choice === "stand" && isMatch) || (choice === "head" && !isMatch);
    if (correct) {
      setResult("right");
      speak(isMatch ? `Yes! ${r.count} matches ${r.shown}!` : `Right! ${r.count} is different from ${r.shown}.`);
      setTimeout(() => {
        if (step + 1 >= rounds.length) onComplete();
        else setStep((s) => s + 1);
      }, 1500);
    } else {
      setResult("wrong");
      speak("Count again carefully.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Round {step + 1} of {rounds.length}</p>
      <div className="mx-auto w-20 h-24 bg-white rounded-xl shadow-lg border-4 border-blue-400 flex items-center justify-center">
        <span className="font-fredoka text-5xl text-blue-900">{r.shown}</span>
      </div>
      <div className="bg-amber-100 border-4 border-amber-700 border-dashed rounded-3xl p-4 mx-auto max-w-[280px]">
        <p className="text-xs font-nunito text-amber-900 mb-2">Your bag:</p>
        <div className="flex flex-wrap justify-center gap-2 text-3xl">
          {Array.from({ length: r.count }).map((_, i) => <span key={i}>{r.emoji}</span>)}
        </div>
      </div>
      <p className="font-nunito text-sm text-blue-800">Does your bag have <strong>{r.shown}</strong>?</p>
      <div className="flex justify-center gap-3">
        <Button onClick={() => answer("stand")} className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-5 h-14 shadow-md">🧍 Stand Up</Button>
        <Button onClick={() => answer("head")} className="bg-orange-400 hover:bg-orange-500 text-white rounded-2xl px-5 h-14 shadow-md">🙆 Hands on Head</Button>
      </div>
      {result === "right" && <p className="text-green-600 font-fredoka"><Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> Great counting!</p>}
      {result === "wrong" && <p className="text-orange-600 font-fredoka">Try again!</p>}
    </div>
  );
};

/* ─── Elephant Splashes – rote count to 17 ─── */
const ElephantSplashes = ({ onComplete }: { onComplete: () => void }) => {
  const target = 17;
  const [count, setCount] = useState(0);
  const [swinging, setSwinging] = useState(false);

  const splash = () => {
    if (count >= target) {
      speak("17 splashes! Eli is happy!");
      setTimeout(onComplete, 1200);
      return;
    }
    const next = count + 1;
    setCount(next);
    setSwinging(true);
    speak(String(next));
    setTimeout(() => setSwinging(false), 250);
  };

  return (
    <div className="space-y-4 text-center">
      <p className="font-nunito text-sm text-blue-700">Tap Eli to swing his trunk and splash — count to 17!</p>
      <div onClick={splash} className="mx-auto w-44 h-44 cursor-pointer select-none">
        <div className="text-8xl transition-transform duration-150 origin-bottom" style={{ transform: swinging ? "rotate(-15deg)" : "rotate(0deg)" }}>
          🐘
        </div>
      </div>
      <p className="font-fredoka text-2xl text-blue-900 h-8">{count > 0 ? count : "Tap to start!"}</p>
      <div className="flex justify-center gap-1 flex-wrap max-w-xs mx-auto">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className={`text-xl ${i < count ? "" : "opacity-20 grayscale"}`}>💦</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Number Sentence Story Solver ─── */
type Story = { partA: number; partB: number; itemA: string; itemB: string; word: string; setup: string; add: string; question: string; scene: "tree" | "garden" };
const stories: Story[] = [
  { partA: 1, partB: 2, itemA: "🌷", itemB: "🌼", word: "flower", setup: "1 seed grew into a flower.", add: "2 more seeds grew into flowers.", question: "How many flowers are there now?", scene: "garden" },
  { partA: 3, partB: 1, itemA: "🍎", itemB: "🍎", word: "apple", setup: "3 apples fell on the ground.", add: "1 other apple fell.", question: "How many apples are on the ground now?", scene: "tree" },
  { partA: 3, partB: 2, itemA: "🍎", itemB: "🍎", word: "apple", setup: "Mom picked 3 apples.", add: "Dad picked 2 apples.", question: "How many apples did they pick in all?", scene: "tree" },
  { partA: 2, partB: 3, itemA: "🍎", itemB: "🍎", word: "apple", setup: "Kojo saw 2 apples in the tree.", add: "Then, he saw 3 more.", question: "How many apples did Kojo see?", scene: "tree" },
  { partA: 1, partB: 4, itemA: "🍎", itemB: "🍎", word: "apple", setup: "Dad picked 1 apple.", add: "Kojo picked 4 apples.", question: "How many apples did they pick in all?", scene: "tree" },
];

const StorySolver = ({ pool, onComplete }: { pool: Story[]; onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [placedA, setPlacedA] = useState(0);
  const [placedB, setPlacedB] = useState(0);
  const [phase, setPhase] = useState<"setup" | "add" | "answer" | "sentence" | "done">("setup");
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
      setTimeout(() => { setPhase("add"); speak(s.add); }, 700);
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
      speak(`Yes! ${s.partA} ${s.word}${s.partA>1?"s":""} and ${s.partB} ${s.word}${s.partB>1?"s":""} make ${total} ${s.word}s.`);
      setPhase("sentence");
      setTimeout(() => {
        speak(`${s.partA} plus ${s.partB} equals ${total}.`);
      }, 1800);
    } else {
      speak("Touch and count again.");
    }
  };

  const finishSentence = () => {
    setPhase("done");
    setTimeout(() => {
      if (step + 1 >= pool.length) onComplete();
      else setStep((x) => x + 1);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Story {step + 1} of {pool.length}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-left font-nunito text-sm text-blue-900 space-y-1 min-h-[64px]">
        <p>📖 {s.setup}</p>
        {phase !== "setup" && <p>➕ {s.add}</p>}
        {(phase === "answer" || phase === "sentence" || phase === "done") && <p className="font-bold pt-1">❓ {s.question}</p>}
      </div>

      {/* Scene */}
      <div className={`border-4 rounded-3xl p-4 min-h-[140px] relative overflow-hidden ${s.scene === "tree" ? "bg-gradient-to-b from-sky-100 to-green-200 border-green-700" : "bg-gradient-to-b from-sky-100 to-amber-100 border-amber-700"}`}>
        {s.scene === "tree" && <div className="absolute top-1 left-1/2 -translate-x-1/2 text-5xl opacity-90">🌳</div>}
        {s.scene === "garden" && <div className="absolute bottom-0 inset-x-0 text-center text-2xl opacity-60">🟫🟫🟫🟫🟫🟫</div>}
        <div className="relative flex justify-center gap-3 mt-12">
          {/* Part A box */}
          <div className={`border-2 rounded-xl p-2 min-w-[80px] min-h-[60px] flex flex-wrap items-center justify-center gap-1 text-3xl transition-all ${placedA > 0 ? "border-blue-500 bg-white/70" : "border-dashed border-gray-300 bg-white/30"}`}>
            {Array.from({ length: placedA }).map((_, i) => (
              <span key={`a${i}`} className="animate-in zoom-in-50 duration-300">{s.itemA}</span>
            ))}
          </div>
          {(phase !== "setup") && <span className="font-fredoka text-3xl text-blue-900 self-center">+</span>}
          {(phase !== "setup") && (
            <div className={`border-2 rounded-xl p-2 min-w-[80px] min-h-[60px] flex flex-wrap items-center justify-center gap-1 text-3xl transition-all ${placedB > 0 ? "border-cyan-500 bg-white/70" : "border-dashed border-gray-300 bg-white/30"}`}>
              {Array.from({ length: placedB }).map((_, i) => (
                <span key={`b${i}`} className="animate-in zoom-in-50 duration-300">{s.itemB}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {phase === "setup" && (
        <Button onClick={placeA} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-md">
          Add a {s.itemA} ({placedA}/{s.partA})
        </Button>
      )}
      {phase === "add" && (
        <Button onClick={placeB} className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl h-12 px-6 shadow-md">
          Add a {s.itemB} ({placedB}/{s.partB})
        </Button>
      )}
      {phase === "answer" && (
        <div className="flex justify-center gap-2 flex-wrap">
          {options.map((n) => (
            <Button key={n} variant="outline" onClick={() => answer(n)} className="w-12 h-12 text-xl font-fredoka rounded-xl border-2 border-blue-300 hover:bg-blue-100">{n}</Button>
          ))}
        </div>
      )}
      {(phase === "sentence" || phase === "done") && (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
          <p className="text-green-700 font-nunito text-sm">
            {s.partA} {s.word}{s.partA>1?"s":""} and {s.partB} {s.word}{s.partB>1?"s":""} make {total} {s.word}s.
          </p>
          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-4 mx-auto max-w-[280px]">
            <p className="text-xs font-nunito text-yellow-800 mb-1">Number sentence:</p>
            <div className="flex justify-center items-center gap-2 text-4xl font-fredoka text-blue-900">
              <span className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center">{s.partA}</span>
              <span className="text-pink-600">+</span>
              <span className="bg-cyan-100 rounded-lg w-12 h-12 flex items-center justify-center">{s.partB}</span>
              <span className="text-pink-600">=</span>
              <span className="bg-green-100 rounded-lg w-12 h-12 flex items-center justify-center">{total}</span>
            </div>
            <p className="text-sm font-fredoka text-blue-800 mt-2">
              "{s.partA} plus {s.partB} equals {total}"
            </p>
          </div>
          {phase === "sentence" && (
            <Button onClick={finishSentence} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-md">
              Next ➜
            </Button>
          )}
          {phase === "done" && (
            <p className="text-green-600 font-fredoka">
              <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> Number sentence done!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main page ─── */
type Step = "intro" | "standUp" | "elephant" | "appProblem" | "concept" | "practice" | "debrief" | "complete";

const NumberSentences8 = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");

  const markComplete = () => {
    const saved = localStorage.getItem("ethio-stem-m5-completed");
    const completed: string[] = saved ? JSON.parse(saved) : [];
    if (!completed.includes("lesson-8")) {
      completed.push("lesson-8");
      localStorage.setItem("ethio-stem-m5-completed", JSON.stringify(completed));
    }
  };

  const flow: Step[] = ["intro", "standUp", "elephant", "appProblem", "concept", "practice", "debrief", "complete"];
  const goNext = (from: Step) => {
    const idx = flow.indexOf(from);
    if (idx < flow.length - 1) setStep(flow[idx + 1]);
  };

  useEffect(() => {
    if (step === "complete") markComplete();
  }, [step]);

  const appPool = useMemo(() => [stories[0]], []);
  const conceptPool = useMemo(() => [stories[1], stories[2]], []);
  const practicePool = useMemo(() => [stories[3], stories[4]], []);

  return (
    <div
      className="min-h-screen font-fredoka overflow-x-hidden"
      style={{ background: "linear-gradient(170deg, #dbeafe 0%, #bfdbfe 30%, #93c5fd 65%, #60a5fa 100%)" }}
    >
      {["🍎", "➕", "🟰", "🌳", "🐘"].map((e, i) => (
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
            onClick={() => navigate("/activities/module-5?last=lesson-8")}
            className="rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-fredoka text-sm bg-blue-800/20 text-blue-900 px-3 py-1 rounded-full">Lesson 8</span>
            <MuteButton className="h-9 w-9 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md" />
          </div>
        </div>

        {step === "intro" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-blue-900 leading-tight">Number Sentences!</h1>
            <p className="text-lg text-blue-800 font-nunito leading-relaxed max-w-md mx-auto">
              Today we'll learn a special math way to write addition stories: <strong>3 + 1 = 4</strong>!
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2 font-nunito text-sm text-blue-800 border border-blue-200">
              <p className="font-bold text-blue-900">🎯 Learning Goals</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Match groups of 3–7 to numerals</li>
                <li>Rote count to 17</li>
                <li>Solve <em>add to</em> stories with objects</li>
                <li>Read the number sentence: <em>"_ plus _ equals _"</em></li>
              </ul>
              <p className="font-bold text-blue-900 pt-2">💡 Parent Tip</p>
              <p>Point to <strong>+</strong> ("plus") and <strong>=</strong> ("equals") as your child reads the sentence aloud.</p>
            </div>
            <Button
              onClick={() => { speak("Let's write number sentences!"); goNext("intro"); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-6 rounded-full shadow-xl border-b-4 border-blue-800 transition-all hover:scale-105 active:scale-95"
            >
              Let's Start! 📝
            </Button>
          </Card>
        )}

        {step === "standUp" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🧍 Stand Up on Your Number!</h2>
            <p className="font-nunito text-blue-700 text-sm">Count your bag. Match it to the card (3–7)!</p>
            <StandUpNumber onComplete={() => { speak("Now let's splash with Eli!"); setTimeout(() => goNext("standUp"), 1200); }} />
          </Card>
        )}

        {step === "elephant" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🐘 Elephant Splashes!</h2>
            <p className="font-nunito text-blue-700 text-sm">Swing Eli's trunk and count to 17!</p>
            <ElephantSplashes onComplete={() => { speak("Time for a flower story!"); setTimeout(() => goNext("elephant"), 1500); }} />
          </Card>
        )}

        {step === "appProblem" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🌷 The Growing Garden</h2>
            <p className="font-nunito text-blue-700 text-sm">Act out the story, then say it with numbers.</p>
            <StorySolver pool={appPool} onComplete={() => { speak("Wonderful! Let's meet the apple tree!"); setTimeout(() => goNext("appProblem"), 1500); }} />
          </Card>
        )}

        {step === "concept" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🍎 Apple Tree Addition!</h2>
            <p className="font-nunito text-blue-700 text-sm">Place apples in the boxes — see the number sentence!</p>
            <StorySolver pool={conceptPool} onComplete={() => { speak("Now try with a partner!"); setTimeout(() => goNext("concept"), 1500); }} />
          </Card>
        )}

        {step === "practice" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🍎 Kojo's Apple Stories!</h2>
            <p className="font-nunito text-blue-700 text-sm">Solve and read the number sentence aloud.</p>
            <StorySolver pool={practicePool} onComplete={() => { speak("Beautiful! Let's reflect."); setTimeout(() => goNext("practice"), 1500); }} />
          </Card>
        )}

        {step === "debrief" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🤔 Think About It!</h2>
            <div className="space-y-3 font-nunito text-blue-800 text-left bg-blue-50 rounded-2xl p-5 border border-blue-200 text-sm">
              <p>🍎 Dad picked <strong>1</strong> apple. Kojo picked <strong>4</strong>. Altogether they have <strong>5</strong> apples.</p>
              <p>📝 We can say that as a number sentence: <strong>1 + 4 = 5</strong>.</p>
              <p>➕ The <strong className="text-pink-600 text-lg">+</strong> means <em>plus</em> — putting two parts together.</p>
              <p>🟰 The <strong className="text-pink-600 text-lg">=</strong> means <em>equals</em> — the total in all!</p>
            </div>
            <Button
              onClick={() => { speak("Amazing number sentence work!"); goNext("debrief"); }}
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
            <h2 className="text-4xl text-white drop-shadow-lg">Lesson 8 Complete!</h2>
            <p className="text-xl text-blue-100 font-nunito leading-relaxed max-w-md mx-auto">
              You wrote <strong>number sentences</strong> with <strong>+</strong> and <strong>=</strong>!
              <br />
              Next: put-together stories!
            </p>
            <div className="flex justify-center gap-3 text-3xl">
              {["1", "+", "4", "=", "5"].map((n, i) => (
                <span key={i} className="bg-white/20 rounded-lg w-11 h-11 flex items-center justify-center font-fredoka text-white">{n}</span>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep("intro")} className="flex-1 h-14 bg-white/15 hover:bg-white/25 text-white text-lg rounded-2xl border border-white/20">Again 🔄</Button>
              <Button onClick={() => navigate("/activities/module-5?last=lesson-8")} className="flex-1 h-14 bg-white text-blue-800 hover:bg-blue-50 text-lg rounded-2xl shadow-lg">Done! ✨</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NumberSentences8;
