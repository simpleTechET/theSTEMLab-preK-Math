import { useState, useEffect } from "react";
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

/* ─── Beanbag Toss – decompose 4 ─── */
const BeanbagToss = ({ onComplete }: { onComplete: () => void }) => {
  const rounds = [
    { red: 1, blue: 3 },
    { red: 2, blue: 2 },
    { red: 3, blue: 1 },
    { red: 0, blue: 4 },
  ];
  const [step, setStep] = useState(0);
  const [tossed, setTossed] = useState<("red" | "blue")[]>([]);
  const [phase, setPhase] = useState<"toss" | "answer" | "done">("toss");
  const [options, setOptions] = useState<number[]>([]);
  const current = rounds[step];

  useEffect(() => {
    setTossed([]);
    setPhase("toss");
    speak("Toss all 4 beanbags onto the mats!");
  }, [step]);

  const toss = (mat: "red" | "blue") => {
    if (tossed.length >= 4 || phase !== "toss") return;
    const next = [...tossed, mat];
    setTossed(next);
    if (next.length === 4) {
      const reds = next.filter((m) => m === "red").length;
      const blues = next.filter((m) => m === "blue").length;
      setTimeout(() => {
        speak(`How many in all? ${reds} and ${blues}.`);
        setOptions(shuffle([3, 4, 5, 6]));
        setPhase("answer");
      }, 600);
    }
  };

  const answer = (n: number) => {
    if (n === 4) {
      const reds = tossed.filter((m) => m === "red").length;
      const blues = tossed.filter((m) => m === "blue").length;
      speak(`Yes! ${reds} and ${blues} make 4!`);
      setPhase("done");
      setTimeout(() => {
        if (step + 1 >= rounds.length) onComplete();
        else setStep((s) => s + 1);
      }, 1800);
    } else {
      speak("Count again. How many beanbags in all?");
    }
  };

  const reds = tossed.filter((m) => m === "red").length;
  const blues = tossed.filter((m) => m === "blue").length;

  return (
    <div className="text-center space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Round {step + 1} of {rounds.length}</p>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => toss("red")}
          disabled={phase !== "toss"}
          className="w-28 h-20 rounded-2xl bg-red-300 border-4 border-red-500 shadow-md flex items-end justify-center pb-1 hover:scale-105 active:scale-95 transition disabled:opacity-80"
        >
          <div className="flex gap-0.5 flex-wrap justify-center">
            {tossed.filter((m) => m === "red").map((_, i) => (
              <span key={i} className="text-xl">🟫</span>
            ))}
          </div>
        </button>
        <button
          onClick={() => toss("blue")}
          disabled={phase !== "toss"}
          className="w-28 h-20 rounded-2xl bg-blue-300 border-4 border-blue-500 shadow-md flex items-end justify-center pb-1 hover:scale-105 active:scale-95 transition disabled:opacity-80"
        >
          <div className="flex gap-0.5 flex-wrap justify-center">
            {tossed.filter((m) => m === "blue").map((_, i) => (
              <span key={i} className="text-xl">🟫</span>
            ))}
          </div>
        </button>
      </div>

      <p className="font-nunito text-blue-800 text-sm">
        Tap a mat to toss a beanbag! ({tossed.length}/4)
      </p>

      {phase !== "toss" && (
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 inline-block">
          <p className="font-fredoka text-blue-900">
            🟥 {reds} <span className="mx-1">and</span> 🟦 {blues}
          </p>
        </div>
      )}

      {phase === "answer" && (
        <>
          <p className="font-nunito text-blue-800">How many beanbags in all?</p>
          <div className="flex justify-center gap-2">
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
        </>
      )}

      {phase === "done" && (
        <p className="text-green-600 font-fredoka">
          <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> {reds} and {blues} make 4!
        </p>
      )}
    </div>
  );
};

/* ─── Swim and Count – stop at varying numbers ─── */
const SwimAndCount = ({ onComplete }: { onComplete: () => void }) => {
  const targets = [20, 16];
  const [round, setRound] = useState(0);
  const [count, setCount] = useState(0);
  const [splashing, setSplashing] = useState(false);
  const target = targets[round];

  const stroke = () => {
    if (count >= target) return;
    setSplashing(true);
    const next = count + 1;
    setCount(next);
    speak(String(next), 1.3);
    setTimeout(() => setSplashing(false), 250);
    if (next >= target) {
      setTimeout(() => {
        if (round + 1 < targets.length) {
          speak(`${target}! Now dive! Stop at ${targets[round + 1]}.`);
          setRound((r) => r + 1);
          setCount(0);
        } else {
          speak(`${target}! Awesome swimming!`);
          onComplete();
        }
      }, 600);
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className={`text-6xl transition-transform ${splashing ? "scale-110 -rotate-6" : ""}`}>🏊</div>
      <p className="font-nunito text-blue-700">Swim and stop at <strong>{target}</strong>!</p>
      <Button
        onClick={stroke}
        disabled={count >= target}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-5 rounded-full shadow-lg border-b-4 border-blue-800"
      >
        {count < target ? `Stroke! (${count})` : "Done! 🎉"}
      </Button>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(count / target) * 100}%` }}
        />
      </div>
      <p className="text-xs font-nunito text-blue-600">Round {round + 1} of {targets.length}</p>
    </div>
  );
};

/* ─── Math Story Theater – act out and find total ─── */
type Story = { setup: string; action: string; question: string; part1: number; part2: number; emoji: string; verb: string };

const STORIES: Story[] = [
  { setup: "2 friends are dancing.", action: "1 more friend comes to dance.", question: "How many friends are dancing in all?", part1: 2, part2: 1, emoji: "💃", verb: "dancing" },
  { setup: "2 friends are picking up trash.", action: "2 more friends come to help.", question: "How many friends are picking up trash altogether?", part1: 2, part2: 2, emoji: "🧹", verb: "picking up trash" },
  { setup: "2 sisters are swimming in the pool.", action: "3 playmates come to swim.", question: "How many are swimming now?", part1: 2, part2: 3, emoji: "🏊", verb: "swimming" },
];

const StoryTheater = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"setup" | "action" | "ask" | "done">("setup");
  const [options, setOptions] = useState<number[]>([]);
  const story = STORIES[step];
  const total = story.part1 + story.part2;

  useEffect(() => {
    setPhase("setup");
    speak(`Listen to my addition story. ${story.setup}`);
  }, [step]);

  const showAction = () => {
    setPhase("action");
    speak(story.action);
  };

  const showQuestion = () => {
    setPhase("ask");
    speak(story.question);
    const opts = new Set<number>([total]);
    while (opts.size < 4) opts.add(Math.max(1, total + Math.floor(Math.random() * 5) - 2));
    setOptions(shuffle([...opts]));
  };

  const answer = (n: number) => {
    if (n === total) {
      speak(`Yes! ${story.part1} and ${story.part2} make ${total}. ${total} friends ${story.verb}!`);
      setPhase("done");
      setTimeout(() => {
        if (step + 1 >= STORIES.length) onComplete();
        else setStep((s) => s + 1);
      }, 2000);
    } else {
      speak("Count all the friends carefully!");
    }
  };

  return (
    <div className="text-center space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Story {step + 1} of {STORIES.length}</p>

      <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-300 min-h-[140px] space-y-3">
        <div className="flex justify-center items-end gap-2 text-4xl min-h-[60px]">
          {Array.from({ length: story.part1 }).map((_, i) => (
            <span key={`a-${i}`} className="animate-in fade-in zoom-in-50">{story.emoji}</span>
          ))}
          {phase !== "setup" && Array.from({ length: story.part2 }).map((_, i) => (
            <span key={`b-${i}`} className="animate-in slide-in-from-right-8 duration-700">{story.emoji}</span>
          ))}
        </div>
        <p className="font-nunito text-blue-900 text-sm">
          <strong>{story.setup}</strong>
          {phase !== "setup" && <> {story.action}</>}
        </p>
      </div>

      {phase === "setup" && (
        <Button
          onClick={showAction}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-7 py-4 rounded-full shadow-lg border-b-4 border-blue-800"
        >
          More come! ➕
        </Button>
      )}
      {phase === "action" && (
        <Button
          onClick={showQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-7 py-4 rounded-full shadow-lg border-b-4 border-blue-800"
        >
          Ask the question 🤔
        </Button>
      )}
      {phase === "ask" && (
        <>
          <p className="font-nunito text-blue-900 font-bold">{story.question}</p>
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
        </>
      )}
      {phase === "done" && (
        <p className="text-green-600 font-fredoka text-lg">
          <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> {story.part1} and {story.part2} make {total}!
        </p>
      )}
    </div>
  );
};

/* ─── Paper Doll Practice – match dolls to story ─── */
type DollStory = { sentenceA: string; sentenceB: string; question: string; partA: number; partB: number };

const DOLL_STORIES: DollStory[] = [
  { sentenceA: "Someone is eating lunch all by himself.", sentenceB: "Two friends come to eat lunch with him.", question: "How many friends are eating altogether?", partA: 1, partB: 2 },
  { sentenceA: "Two children are playing on the swings.", sentenceB: "One more child comes to play.", question: "How many children are playing in all?", partA: 2, partB: 1 },
  { sentenceA: "One friend is reading a book.", sentenceB: "Two more friends come to read.", question: "How many friends are reading altogether?", partA: 1, partB: 2 },
];

const PaperDolls = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [placedA, setPlacedA] = useState(0);
  const [placedB, setPlacedB] = useState(0);
  const [phase, setPhase] = useState<"placeA" | "placeB" | "ask" | "done">("placeA");
  const [options, setOptions] = useState<number[]>([]);
  const story = DOLL_STORIES[step];
  const total = story.partA + story.partB;

  useEffect(() => {
    setPlacedA(0);
    setPlacedB(0);
    setPhase("placeA");
    speak(story.sentenceA);
  }, [step]);

  const placeA = () => {
    const next = placedA + 1;
    setPlacedA(next);
    if (next === story.partA) {
      setTimeout(() => {
        speak(story.sentenceB);
        setPhase("placeB");
      }, 500);
    }
  };

  const placeB = () => {
    const next = placedB + 1;
    setPlacedB(next);
    if (next === story.partB) {
      setTimeout(() => {
        speak(story.question);
        const opts = new Set<number>([total]);
        while (opts.size < 4) opts.add(Math.max(1, total + Math.floor(Math.random() * 5) - 2));
        setOptions(shuffle([...opts]));
        setPhase("ask");
      }, 500);
    }
  };

  const answer = (n: number) => {
    if (n === total) {
      speak(`That's right! ${story.partA} and ${story.partB} make ${total}!`);
      setPhase("done");
      setTimeout(() => {
        if (step + 1 >= DOLL_STORIES.length) onComplete();
        else setStep((s) => s + 1);
      }, 2000);
    } else {
      speak("Count all the friends!");
    }
  };

  return (
    <div className="text-center space-y-4">
      <p className="font-nunito text-blue-700 text-sm">Story {step + 1} of {DOLL_STORIES.length}</p>

      <div className="bg-blue-50 rounded-2xl p-3 border-2 border-blue-200 space-y-2 text-left">
        <p className="font-nunito text-blue-900 text-sm">📖 {story.sentenceA}</p>
        {phase !== "placeA" && <p className="font-nunito text-blue-900 text-sm">➕ {story.sentenceB}</p>}
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-dashed border-amber-300 min-h-[80px] flex items-center justify-center gap-2">
        {Array.from({ length: placedA }).map((_, i) => (
          <span key={`a-${i}`} className="text-4xl animate-in zoom-in-50">🧒</span>
        ))}
        {Array.from({ length: placedB }).map((_, i) => (
          <span key={`b-${i}`} className="text-4xl animate-in zoom-in-50">👧</span>
        ))}
        {placedA + placedB === 0 && <span className="text-amber-400 text-sm font-nunito">empty stage</span>}
      </div>

      {phase === "placeA" && (
        <Button
          onClick={placeA}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-7 py-4 rounded-full shadow-lg border-b-4 border-blue-800"
        >
          Add a 🧒 ({placedA}/{story.partA})
        </Button>
      )}
      {phase === "placeB" && (
        <Button
          onClick={placeB}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-7 py-4 rounded-full shadow-lg border-b-4 border-blue-800"
        >
          Add a 👧 ({placedB}/{story.partB})
        </Button>
      )}
      {phase === "ask" && (
        <>
          <p className="font-nunito text-blue-900 font-bold">{story.question}</p>
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
        </>
      )}
      {phase === "done" && (
        <p className="text-green-600 font-fredoka text-lg">
          <Star className="w-5 h-5 inline fill-yellow-400 text-yellow-400" /> {story.partA} and {story.partB} make {total}!
        </p>
      )}
    </div>
  );
};

/* ─── Main page ─── */
type Step = "intro" | "beanbag" | "swim" | "theater" | "dolls" | "debrief" | "complete";

const ActOutAddition6 = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");

  const markComplete = () => {
    const saved = localStorage.getItem("ethio-stem-m5-completed");
    const completed: string[] = saved ? JSON.parse(saved) : [];
    if (!completed.includes("lesson-6")) {
      completed.push("lesson-6");
      localStorage.setItem("ethio-stem-m5-completed", JSON.stringify(completed));
    }
  };

  const flow: Step[] = ["intro", "beanbag", "swim", "theater", "dolls", "debrief", "complete"];
  const goNext = (from: Step) => {
    const idx = flow.indexOf(from);
    if (idx < flow.length - 1) setStep(flow[idx + 1]);
  };

  useEffect(() => {
    if (step === "complete") markComplete();
  }, [step]);

  return (
    <div
      className="min-h-screen font-fredoka overflow-x-hidden"
      style={{ background: "linear-gradient(170deg, #dbeafe 0%, #bfdbfe 30%, #93c5fd 65%, #60a5fa 100%)" }}
    >
      {["🎭", "➕", "🧒", "👧", "🏊"].map((e, i) => (
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
            onClick={() => navigate("/activities/module-5?last=lesson-6")}
            className="rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-fredoka text-sm bg-blue-800/20 text-blue-900 px-3 py-1 rounded-full">Lesson 6</span>
            <MuteButton className="h-9 w-9 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-sm shadow-md" />
          </div>
        </div>

        {step === "intro" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
              <span className="text-4xl">🎭</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-blue-900 leading-tight">Act Out Addition Stories!</h1>
            <p className="text-lg text-blue-800 font-nunito leading-relaxed max-w-md mx-auto">
              Today we'll toss beanbags, swim and count, and act out <strong>addition stories</strong> with friends!
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2 font-nunito text-sm text-blue-800 border border-blue-200">
              <p className="font-bold text-blue-900">🎯 Learning Goals</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Decompose 4 in many ways</li>
                <li>Count to 20 and stop on a number</li>
                <li>Act out <em>add to</em> stories and find the total</li>
                <li>Say "_ and _ make _" altogether</li>
              </ul>
              <p className="font-bold text-blue-900 pt-2">💡 Parent Tip</p>
              <p>Use words like <em>altogether</em> and <em>in all</em>. Have your child retell the story before answering — this builds problem-solving language.</p>
            </div>
            <Button
              onClick={() => {
                speak("Let's act out addition stories!");
                goNext("intro");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-6 rounded-full shadow-xl border-b-4 border-blue-800 transition-all hover:scale-105 active:scale-95"
            >
              Let's Start! 🎭
            </Button>
          </Card>
        )}

        {step === "beanbag" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🎯 Beanbag Toss!</h2>
            <p className="font-nunito text-blue-700 text-sm">
              Toss all 4 beanbags onto a mat. Then say how many in all.
            </p>
            <BeanbagToss
              onComplete={() => {
                speak("Great tossing! Time to swim!");
                setTimeout(() => goNext("beanbag"), 1200);
              }}
            />
          </Card>
        )}

        {step === "swim" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🏊 Swim and Count!</h2>
            <p className="font-nunito text-blue-700 text-sm">Count each stroke. Stop on the number!</p>
            <SwimAndCount
              onComplete={() => {
                speak("Awesome! Let's act out a story!");
                setTimeout(() => goNext("swim"), 1500);
              }}
            />
          </Card>
        )}

        {step === "theater" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🎭 Story Theater!</h2>
            <p className="font-nunito text-blue-700 text-sm">Listen, watch friends arrive, and find the total.</p>
            <StoryTheater
              onComplete={() => {
                speak("Fantastic acting! Let's try with paper dolls!");
                setTimeout(() => goNext("theater"), 1500);
              }}
            />
          </Card>
        )}

        {step === "dolls" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-5 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🧒 Paper Doll Stories!</h2>
            <p className="font-nunito text-blue-700 text-sm">Place dolls to match the story, then count altogether.</p>
            <PaperDolls
              onComplete={() => {
                speak("You solved every story! Let's reflect.");
                setTimeout(() => goNext("dolls"), 1500);
              }}
            />
          </Card>
        )}

        {step === "debrief" && (
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-[2.5rem] p-8 space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl text-blue-900">🤔 Think About It!</h2>
            <div className="space-y-3 font-nunito text-blue-800 text-left bg-blue-50 rounded-2xl p-5 border border-blue-200 text-sm">
              <p>🎭 In our addition stories, did more friends <strong>come</strong> or did they <strong>leave</strong>?</p>
              <p>🤝 We asked, "How many <strong>altogether</strong>?" — what did we do to find out?</p>
              <p>🗣️ Saying <em>"2 and 2 make 4"</em> helps us remember the parts and the total.</p>
              <p>👀 Acting and watching helped us <strong>see</strong> the story before counting!</p>
            </div>
            <Button
              onClick={() => {
                speak("Amazing work acting out addition!");
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
            <h2 className="text-4xl text-white drop-shadow-lg">Lesson 6 Complete!</h2>
            <p className="text-xl text-blue-100 font-nunito leading-relaxed max-w-md mx-auto">
              You acted out addition stories and found the <strong>total altogether</strong>!
              <br />
              Next: solving stories with objects!
            </p>
            <div className="flex justify-center gap-3 text-3xl">
              {["2", "+", "2", "=", "4"].map((n, i) => (
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
                onClick={() => navigate("/activities/module-5?last=lesson-6")}
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

export default ActOutAddition6;
