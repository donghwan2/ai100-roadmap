/**
 * @license수호대원 복제
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from "react";
import { Check, Lock, X, ChevronDown, Sparkles, RotateCcw, Compass, User, Brain, Zap, Award, Smile, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ElectricBorder from "./components/ElectricBorder";
import LoginModal from "./components/LoginModal";
import MyPage from "./components/MyPage";
import { supabase } from "./lib/supabase";
import rawRoadmapData from "./data/roadmapData.json";
import rawCharacterData from "./data/character.json";
import rawCourseData from "./data/job_interest_course.json";

const ITEMS_PER_ROW = 8;
const X_START = 150;
const X_STEP = 200;
const Y_START = 350;
const Y_STEP = 600;

export type NodeData = {
  id: number;
  status: string;
  x: number;
  y: number;
  align: string;
  interest: string;
  company: string;
  title: string;
  level: string;
  desc: string;
  roles: string[];
  date: string;
};

const timelineNodes: NodeData[] = rawRoadmapData.map(
  (row: any, index: number) => {
    const r = Math.floor(index / ITEMS_PER_ROW);
    const isLeftToRight = r % 2 === 0;
    const col = index % ITEMS_PER_ROW;

    const x = isLeftToRight
      ? X_START + col * X_STEP
      : X_START + (ITEMS_PER_ROW - 1 - col) * X_STEP;

    const y = Y_START + r * Y_STEP;
    const align = index % 2 === 0 ? "top" : "bottom";
    const status = "done";

    const roles: string[] = [];
    if (row["영업&마케팅"] === "✅") roles.push("영업&마케팅");
    if (row["디자인&영상"] === "✅") roles.push("디자인&영상");
    if (row["IT&개발"] === "✅") roles.push("IT&개발");
    if (row["기획&데이터"] === "✅") roles.push("기획&데이터");
    if (row["재무&경영지원"] === "✅") roles.push("재무&경영지원");

    const levelStr = row.Level ? String(row.Level) : "-";
    const dateStr = levelStr === "-" ? "Intro" : `Level ${levelStr}`;

    return {
      id: row.No ?? index,
      status,
      x,
      y,
      align,
      interest: row["관심사"] || "-",
      company: row.Part || "",
      title: row["노드(커리큘럼)"] || "",
      level: levelStr,
      desc: row.desc || "",
      roles,
      date: dateStr,
    };
  },
);

const INTEREST_THEMES: Record<string, any> = {
  "AI 기초": {
    borderCard: "border-cyan-900/40",
    orbBg: "bg-cyan-500",
    hex: "#22d3ee",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(34,211,238,1)] [text-shadow:0_0_15px_#38bdf8]",
    numberDim: "text-cyan-600/40 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]",
    badgeBgActive: "bg-cyan-400 text-slate-900",
    categoryText: "text-cyan-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.8)] [text-shadow:0_0_15px_#38bdf8,0_0_30px_#818cf8]",
    dividerBg: "bg-cyan-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    lineBg: "bg-cyan-500",
    dateBadge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  "기획&데이터분석": {
    borderCard: "border-emerald-900/40",
    orbBg: "bg-emerald-500",
    hex: "#10b981",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(52,211,153,1)] [text-shadow:0_0_15px_#34d399]",
    numberDim: "text-emerald-600/40 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    badgeBgActive: "bg-emerald-400 text-slate-900",
    categoryText: "text-emerald-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] [text-shadow:0_0_15px_#34d399,0_0_30px_#6ee7b7]",
    dividerBg: "bg-emerald-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]",
    lineBg: "bg-emerald-500",
    dateBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  "재무분석&투자": {
    borderCard: "border-orange-900/40",
    orbBg: "bg-orange-500",
    hex: "#f97316",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(249,115,22,1)] [text-shadow:0_0_15px_#f97316]",
    numberDim: "text-orange-600/40 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]",
    badgeBgActive: "bg-orange-400 text-slate-900",
    categoryText: "text-orange-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] [text-shadow:0_0_15px_#f97316,0_0_30px_#fdba74]",
    dividerBg: "bg-orange-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]",
    lineBg: "bg-orange-500",
    dateBadge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  "정적 콘텐츠(이미지)": {
    borderCard: "border-amber-900/40",
    orbBg: "bg-amber-400",
    hex: "#fcd34d",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(252,211,77,1)] [text-shadow:0_0_15px_#fcd34d]",
    numberDim:
      "text-amber-500/40 drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]",
    badgeBgActive: "bg-amber-400 text-slate-950",
    categoryText: "text-amber-300",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(252,211,77,0.8)] [text-shadow:0_0_15px_#fcd34d,0_0_30px_#fef08a]",
    dividerBg: "bg-amber-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.6)]",
    lineBg: "bg-amber-400",
    dateBadge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  "동적 콘텐츠(영상,음악)": {
    borderCard: "border-rose-900/40",
    orbBg: "bg-rose-500",
    hex: "#f43f5e",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(251,113,133,1)] [text-shadow:0_0_15px_#fb7185]",
    numberDim: "text-rose-600/40 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]",
    badgeBgActive: "bg-rose-400 text-slate-900",
    categoryText: "text-rose-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(251,113,133,0.8)] [text-shadow:0_0_15px_#fb7185,0_0_30px_#fda4af]",
    dividerBg: "bg-rose-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]",
    lineBg: "bg-rose-500",
    dateBadge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  바이브코딩: {
    borderCard: "border-purple-900/40",
    orbBg: "bg-purple-500",
    hex: "#a855f7",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(192,132,252,1)] [text-shadow:0_0_15px_#a855f7]",
    numberDim: "text-purple-600/40 drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]",
    badgeBgActive: "bg-purple-400 text-slate-900",
    categoryText: "text-purple-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] [text-shadow:0_0_15px_#a855f7,0_0_30px_#c084fc]",
    dividerBg: "bg-purple-400",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.7)]",
    lineBg: "bg-purple-500",
    dateBadge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  "-": {
    borderCard: "border-slate-800",
    orbBg: "bg-slate-400",
    hex: "#94a3b8",
    numberGlow:
      "text-white drop-shadow-[0_0_20px_rgba(148,163,184,1)] [text-shadow:0_0_15px_#94a3b8]",
    numberDim: "text-slate-500/40 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)]",
    badgeBgActive: "bg-slate-400 text-slate-950",
    categoryText: "text-slate-400",
    titleGlow:
      "text-white drop-shadow-[0_0_10px_rgba(148,163,184,0.8)] [text-shadow:0_0_15px_#94a3b8,0_0_30px_#cbd5e1]",
    dividerBg: "bg-slate-500",
    iconBorder: "border-transparent",
    iconBgComplete: "bg-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.6)]",
    lineBg: "bg-slate-500",
    dateBadge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  default: {
    borderCard: "border-slate-800",
    orbBg: "bg-slate-500",
    hex: "#94a3b8",
    numberGlow: "text-slate-300 drop-shadow-[0_0_15px_rgba(148,163,184,0.8)]",
    numberDim: "text-slate-600",
    badgeBgActive: "bg-slate-700 text-slate-300",
    categoryText: "text-slate-400",
    titleGlow: "text-slate-300",
    dividerBg: "bg-slate-600",
    iconBorder: "border-slate-600",
    iconBgComplete: "bg-slate-700",
    lineBg: "bg-slate-700",
    dateBadge: "text-slate-400 border-slate-700 bg-[#020617]",
  },
};

const NodeCardContent = ({
  node,
  isCompleted,
  onTextClick,
}: {
  node: (typeof timelineNodes)[0];
  isCompleted: boolean;
  onTextClick: (node: (typeof timelineNodes)[0]) => void;
}) => {
  const isDone = node.status === "done";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";

  const theme = INTEREST_THEMES[node.interest] || INTEREST_THEMES["default"];

  const innerContent = (
    <div
      className={`relative overflow-hidden w-full min-h-[180px] flex flex-col text-left p-4 md:p-5 rounded-xl border
       bg-gradient-to-br from-[#0f172a] to-[#020617] ${theme.borderCard}
       ${isCompleted ? "!border-transparent" : ""}
      `}
      onClick={() => onTextClick(node)}
    >
      {/* Background Glow / Orb */}
      {(isDone || isActive) && (
        <div
          className={`absolute right-[-30px] top-1/2 -translate-y-1/2 w-32 h-32 blur-[40px] rounded-full pointer-events-none opacity-40 mix-blend-screen
          ${theme.orbBg}`}
        ></div>
      )}

      {/* AI Watermark */}
      <div className="absolute -bottom-2 right-1 text-5xl font-black text-white/[0.03] select-none pointer-events-none font-sans tracking-tighter">
        AI
      </div>

      {/* Node Number */}
      <div
        className={`absolute top-4 right-4 text-3xl md:text-4xl font-mono font-black z-10 transition-all duration-500
        ${isCompleted ? theme.numberGlow : theme.numberDim}`}
      >
        {String(node.id).padStart(2, "0")}
      </div>

      {/* Interest Badge */}
      <div
        className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold mb-3 z-10 transition-colors
        ${node.interest === "-" ? "opacity-0 h-0 m-0 overflow-hidden" : theme.badgeBgActive}`}
      >
        {node.interest}
      </div>

      {/* Category */}
      <div
        className={`text-[10px] md:text-[11px] font-bold mb-1 z-10 ${theme.categoryText}`}
      >
        {node.company}
      </div>

      {/* Title with Neon Glow */}
      <h3
        className={`text-lg md:text-xl font-black mb-3 z-10 leading-tight ${theme.titleGlow}`}
      >
        {node.title}
      </h3>

      {/* Divider */}
      <div className="flex w-full h-[2px] bg-slate-700/50 mb-3 z-10 rounded-full overflow-hidden">
        <div className={`h-full w-1/3 ${theme.dividerBg}`}></div>
      </div>

      {/* Description */}
      <p
        className={`text-[11px] md:text-[12px] leading-relaxed line-clamp-2 z-10 font-medium
        ${isActive ? "text-slate-300" : isLocked ? "text-slate-500" : "text-slate-300"}`}
      >
        {node.desc}
      </p>
    </div>
  );

  if (isCompleted) {
    return (
      <ElectricBorder
        color={theme.hex || "#22d3ee"}
        borderRadius={12}
        className={`w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl`}
      >
        {innerContent}
      </ElectricBorder>
    );
  }

  return (
    <div
      className={`w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl rounded-xl`}
    >
      {innerContent}
    </div>
  );
};

const NodeIcon = ({
  node,
  isCompleted,
  onIconClick,
}: {
  node: (typeof timelineNodes)[0];
  isCompleted: boolean;
  onIconClick: (node: (typeof timelineNodes)[0]) => void;
}) => {
  const isDone = node.status === "done";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";
  const theme = INTEREST_THEMES[node.interest] || INTEREST_THEMES["default"];

  return (
    <button
      onClick={() => onIconClick(node)}
      className="relative flex items-center justify-center shrink-0 z-20 hover:scale-110 active:scale-95 transition-transform duration-200"
    >
      {isDone && (
        <div
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ring-4 ring-[#020617] transition-all duration-300 border
          ${isCompleted ? theme.iconBgComplete + " " + theme.iconBorder : "bg-[#020617] border-slate-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"}`}
        >
          <Check
            className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${isCompleted ? "text-white" : "text-slate-600"}`}
            strokeWidth={isCompleted ? 3 : 2}
          />
        </div>
      )}
      {isActive && (
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ring-4 ring-[#020617] relative transition-all duration-300 border
          ${isCompleted ? theme.iconBgComplete + " " + theme.iconBorder : "bg-[#020617] border-slate-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"}`}
        >
          <div
            className={`absolute inset-0 rounded-full border transition-colors duration-300 ${isCompleted ? "border-white/40" : "border-transparent"}`}
          ></div>
          <div
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${isCompleted ? "bg-white animate-pulse shadow-[0_0_10px_white]" : "bg-slate-600"}`}
          ></div>
        </div>
      )}
      {isLocked && (
        <div
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ring-4 ring-[#020617] transition-all duration-300 border
          ${isCompleted ? "bg-slate-800 border-slate-600 shadow-lg" : "bg-[#020617] border-slate-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"}`}
        >
          <Lock
            className={`w-3 h-3 md:w-4 md:h-4 text-slate-600 transition-colors duration-300 ${isCompleted ? "text-slate-400" : "text-slate-600"}`}
          />
        </div>
      )}
    </button>
  );
};

const TimelineNode = ({
  node,
  isCompleted,
  onTextClick,
  onIconClick,
  isDimmed,
}: {
  key?: React.Key;
  node: (typeof timelineNodes)[0] & { align: string };
  isCompleted: boolean;
  onTextClick: (node: (typeof timelineNodes)[0]) => void;
  onIconClick: (node: (typeof timelineNodes)[0]) => void;
  isDimmed?: boolean;
}) => {
  const isDone = node.status === "done";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";
  const isTop = node.align === "top";
  const theme = INTEREST_THEMES[node.interest] || INTEREST_THEMES["default"];

  return (
    <div
      className={`absolute flex flex-col items-center z-10 group hidden md:flex transition-all duration-500 ${isDimmed ? "opacity-20 grayscale hover:opacity-100 hover:grayscale-0 focus-within:opacity-100 focus-within:grayscale-0" : ""}`}
      style={{
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Connecting line */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-px ${isDone ? theme.lineBg : isActive ? theme.lineBg : "bg-slate-700"
          } opacity-50 transition-all duration-300 -z-10 ${isTop
            ? "bottom-full h-8 md:h-10 group-hover:h-10 md:group-hover:h-12"
            : "top-full h-8 md:h-10 group-hover:-translate-y-1"
          }`}
      ></div>

      {/* Tooltip Label (Date or Date Bubble) positioned relative to the icon */}
      <div
        className={`absolute flex flex-col ${isTop ? "bottom-full mb-4 md:mb-6" : "top-full mt-4 md:mt-6"} w-60 md:w-64 transition-all duration-300 group-hover:-translate-y-1 ${isLocked ? "opacity-80 group-hover:opacity-100" : ""}`}
      >
        <div
          className={`flex flex-col ${isTop ? "justify-end" : "justify-start"} h-full w-full`}
        >
          {/* Header span (Date) */}
          <span
            className={`block w-max text-[10px] md:text-xs font-mono px-2 py-1 border rounded whitespace-nowrap tracking-wider mb-2 transition-all duration-300
            ${isDone
                ? theme.dateBadge
                : isActive
                  ? theme.dateBadge + " animate-pulse"
                  : "text-slate-400 border-slate-700 bg-[#020617] backdrop-blur-md"
              }`}
          >
            {node.date}
          </span>

          <NodeCardContent
            node={node}
            isCompleted={isCompleted}
            onTextClick={onTextClick}
          />
        </div>
      </div>

      <NodeIcon
        node={node}
        isCompleted={isCompleted}
        onIconClick={onIconClick}
      />
    </div>
  );
};

const MobileTimelineNode = ({
  node,
  isCompleted,
  onTextClick,
  onIconClick,
  isLast,
  isDimmed,
}: {
  key?: React.Key;
  node: (typeof timelineNodes)[0];
  isCompleted: boolean;
  onTextClick: (node: (typeof timelineNodes)[0]) => void;
  onIconClick: (node: (typeof timelineNodes)[0]) => void;
  isLast?: boolean;
  isDimmed?: boolean;
}) => {
  const isDone = node.status === "done";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";
  const theme = INTEREST_THEMES[node.interest] || INTEREST_THEMES["default"];

  return (
    <div className={`relative w-full flex items-start gap-4 mb-8 transition-all duration-500 ${isDimmed ? "opacity-20 grayscale hover:opacity-100 hover:grayscale-0 focus-within:opacity-100 focus-within:grayscale-0" : ""}`}>
      {/* Node Icon Container */}
      <div className="relative z-10 w-12 flex justify-center shrink-0 mt-[1.3rem]">
        {/* Horizontal Connecting Line */}
        <div
          className={`absolute top-1/2 left-1/2 w-8 h-px -z-10 opacity-50 transition-colors duration-300 ${isDone ? theme.lineBg : isActive ? theme.lineBg : "bg-slate-700"}`}
        ></div>

        <NodeIcon
          node={node}
          isCompleted={isCompleted}
          onIconClick={onIconClick}
        />
      </div>

      <div className="flex-1 flex flex-col pt-1 pb-2 z-10 w-0">
        {/* Date Tag */}
        <span
          className={`block w-max text-[10px] font-mono px-2 py-1 border rounded whitespace-nowrap tracking-wider mb-3
            ${isDone
              ? theme.dateBadge
              : isActive
                ? theme.dateBadge
                : "text-slate-400 border-slate-700 bg-[#020617]"
            }`}
        >
          {node.date}
        </span>

        <NodeCardContent
          node={node}
          isCompleted={isCompleted}
          onTextClick={onTextClick}
        />
      </div>
    </div>
  );
};

const totalRows = Math.ceil(timelineNodes.length / ITEMS_PER_ROW);
const containerHeight = Math.max(
  1850,
  Y_START + (totalRows - 1) * Y_STEP + 300,
);

const generateSvgPath = (totalItems: number) => {
  const rows = Math.ceil(totalItems / ITEMS_PER_ROW);
  const steps = [];
  steps.push(`M 0 ${Y_START}`);

  for (let i = 0; i < rows; i++) {
    const y = Y_START + i * Y_STEP;
    const isLeftToRight = i % 2 === 0;

    if (i === rows - 1) {
      if (isLeftToRight) {
        steps.push(`L 1750 ${y}`);
      } else {
        steps.push(`L 0 ${y}`);
      }
    } else {
      const nextY = y + Y_STEP;
      if (isLeftToRight) {
        steps.push(`L 1550 ${y} C 1700 ${y}, 1700 ${nextY}, 1550 ${nextY}`);
      } else {
        steps.push(`L 150 ${y} C 0 ${y}, 0 ${nextY}, 150 ${nextY}`);
      }
    }
  }
  return steps.join(" ");
};
const svgPathD = generateSvgPath(timelineNodes.length);

export default function App() {
  const [selectedNode, setSelectedNode] = useState<
    (typeof timelineNodes)[0] | null
  >(null);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [modalInterestDropdownOpen, setModalInterestDropdownOpen] = useState(false);

  // 캐릭터 생성하기 State
  const [view, setView] = useState<"main" | "mypage">("main");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savingCharacter, setSavingCharacter] = useState(false);
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [savedCurriculumInterests, setSavedCurriculumInterests] = useState<string[]>([]);

  const loadCurriculumFromDb = async (userId: string) => {
    const { data } = await supabase
      .from("curricula")
      .select("interests")
      .eq("user_id", userId)
      .maybeSingle();
    const interests = data?.interests ?? [];
    setSavedCurriculumInterests(interests);
    setSelectedInterests(interests);
  };

  const loadCharacterFromDb = async (userId: string) => {
    const { data } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      const character = {
        role: data.role,
        interest: data.interest,
        animal: data.animal,
        course: data.course,
        desc: data.description,
        imageUrl: data.image_url ?? undefined,
        powerStats: data.power_stats,
      };
      setMyCharacter(character);
      localStorage.setItem("aive_my_character", JSON.stringify(character));
    } else {
      setMyCharacter(null);
      localStorage.removeItem("aive_my_character");
    }
  };

  useEffect(() => {
    // 앱 로드 시: 세션이 있으면 DB에서 해당 유저 캐릭터 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      const loggedInUser = session?.user ?? null;
      setUser(loggedInUser);
      if (loggedInUser) {
        loadCharacterFromDb(loggedInUser.id);
        loadCurriculumFromDb(loggedInUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const loggedInUser = session?.user ?? null;
      setUser(loggedInUser);

      if (event === "SIGNED_OUT") {
        setMyCharacter(null);
        setSavedCurriculumInterests([]);
        setSelectedInterests([]);
        localStorage.removeItem("aive_my_character");
        localStorage.removeItem("aive_pending_character");
        localStorage.removeItem("aive_pending_curriculum");
        setView("main");
        return;
      }

      if (event === "SIGNED_IN" && loggedInUser) {
        const pending = localStorage.getItem("aive_pending_character");
        const pendingCurriculum = localStorage.getItem("aive_pending_curriculum");

        // 비로그인 중 저장 시도했던 캐릭터 자동 저장
        if (pending) {
          try {
            const character = JSON.parse(pending);
            const { error } = await supabase.from("characters").upsert(
              {
                user_id: loggedInUser.id,
                role: character.role,
                interest: character.interest,
                animal: character.animal,
                course: character.course,
                description: character.desc,
                image_url: character.imageUrl ?? null,
                power_stats: character.powerStats,
              },
              { onConflict: "user_id" }
            );
            if (!error) {
              setMyCharacter(character);
              localStorage.setItem("aive_my_character", pending);
              localStorage.removeItem("aive_pending_character");
            }
          } catch {
            localStorage.removeItem("aive_pending_character");
          }
        }

        // 비로그인 중 저장 시도했던 커리큘럼 자동 저장
        if (pendingCurriculum) {
          try {
            const interests = JSON.parse(pendingCurriculum);
            const { error } = await supabase.from("curricula").upsert(
              { user_id: loggedInUser.id, interests },
              { onConflict: "user_id" }
            );
            if (!error) {
              setSavedCurriculumInterests(interests);
              setSelectedInterests(interests);
              localStorage.removeItem("aive_pending_curriculum");
            }
          } catch {
            localStorage.removeItem("aive_pending_curriculum");
          }
        }

        // 일반 로그인: DB에서 데이터 로드
        if (!pending && !pendingCurriculum) {
          await loadCharacterFromDb(loggedInUser.id);
          await loadCurriculumFromDb(loggedInUser.id);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveCharacterToDb = async (character: typeof tempCharacter) => {
    if (!user || !character) return false;
    setSavingCharacter(true);
    const { error } = await supabase.from("characters").upsert(
      {
        user_id: user.id,
        role: character.role,
        interest: character.interest,
        animal: character.animal,
        course: character.course,
        description: character.desc,
        image_url: character.imageUrl ?? null,
        power_stats: character.powerStats,
      },
      { onConflict: "user_id" }
    );
    setSavingCharacter(false);
    return !error;
  };

  const saveCurriculumToDb = async (interests: string[]) => {
    if (!user) return false;
    setSavingCurriculum(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      );
      const query = supabase.from("curricula").upsert(
        { user_id: user.id, interests },
        { onConflict: "user_id" }
      );
      const { error } = await Promise.race([query, timeout]);
      if (error) return false;
      setSavedCurriculumInterests(interests);
      setSelectedInterests(interests);
      return true;
    } catch {
      return false;
    } finally {
      setSavingCurriculum(false);
    }
  };

  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [charRole, setCharRole] = useState<string | null>(null);
  const [charInterest, setCharInterest] = useState<string | null>(null);
  const [charAnimal, setCharAnimal] = useState<string | null>(null);

  const [charRoleDropdownOpen, setCharRoleDropdownOpen] = useState(false);
  const [charInterestDropdownOpen, setCharInterestDropdownOpen] = useState(false);
  const [charAnimalDropdownOpen, setCharAnimalDropdownOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [myCharacter, setMyCharacter] = useState<{
    role: string | null;
    interest: string | null;
    animal: string;
    course: string;
    desc: string;
    imageUrl?: string;
    powerStats: { coding: number; charm: number; speed: number; wisdom: number };
  } | null>(null);

  // myCharacter는 auth 이벤트에서 DB 기준으로 로드 — 별도 localStorage 초기화 불필요

  const [tempCharacter, setTempCharacter] = useState<{
    role: string | null;
    interest: string | null;
    animal: string;
    course: string;
    desc: string;
    imageUrl?: string;
    powerStats: { coding: number; charm: number; speed: number; wisdom: number };
  } | null>(null);

  const ROLES = [
    "영업&마케팅",
    "디자인&영상",
    "IT&개발",
    "기획&데이터",
    "재무&경영지원",
  ];

  const ANIMAL_PROMPTS: Record<string, string> = {
    "강아지": "an adorable cartoon puppy character, fluffy fur, chibi style, pastel colors, white background",
    "고양이": "a charming cartoon cat character, sleek fur, chibi style, soft colors, white background",
    "토끼": "a lovely cartoon bunny character, long ears, fluffy tail, chibi style, soft pastel color palette, white background",
    "판다": "a sweet cartoon panda character eating bamboo, round body, cute expression, chibi anime style, clean background",
    "사자": "a majestic yet super cute cartoon lion character with a fluffy golden mane, chibi style, warm friendly eyes, solid background",
    "펭귄": "a chubby little cartoon penguin character wearing a tiny scarf, waddling pose, adorable chibi digital art, clean white background",
    "곰": "a cuddly soft brown cartoon bear character sitting down, rounded shapes, cozy sticker style, pastel colors, solid background",
    "여우": "a clever and beautiful cartoon orange fox character with a big bushy tail, bright curious eyes, professional design, white background",
    "햄스터": "a tiny round cartoon hamster character holding a little sunflower seed, chubby cheeks, adorable chibi style, soft warm colors, white background",
    "쿼카": "the world's happiest animal, a cute smiling cartoon quokka character, friendly open arms, chibi illustration style, vibrant warm colors, clean background"
  };

  const isFilterActive = selectedInterests.length > 0;
  const checkIsDimmed = (node: (typeof timelineNodes)[0]) => {
    if (selectedInterests.length === 0) return false;
    if (node.interest === "-") return false;
    return !selectedInterests.includes(node.interest);
  };

  const handleTextClick = (node: (typeof timelineNodes)[0]) => {
    setSelectedNode(node);
  };

  const handleIconClick = (node: (typeof timelineNodes)[0]) => {
    setCompletedNodes((prev) =>
      prev.includes(node.id)
        ? prev.filter((id) => id !== node.id)
        : [...prev, node.id],
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const INTERESTS = Array.from(
    new Set(timelineNodes.map((n) => n.interest)),
  ).filter((i) => i !== "-");

  if (view === "mypage") {
    return (
      <MyPage
        user={user}
        savedCurriculumInterests={savedCurriculumInterests}
        onCurriculumDelete={async () => {
          await supabase.from("curricula").delete().eq("user_id", user.id);
          setSavedCurriculumInterests([]);
          setSelectedInterests([]);
        }}
        onBack={() => setView("main")}
        onLogout={() => setView("main")}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-100 font-sans relative flex flex-col overflow-x-hidden pb-40">
      {/* Background Atmospheric Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* subtle svg grid pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] pointer-events-none mix-blend-screen opacity-50 border-[0]"></div>

      {/* Top Navbar */}
      <nav className="relative z-30 w-full flex items-center justify-between px-6 pt-12 pb-6 md:px-12 lg:px-24 xl:px-32 2xl:px-48 md:pt-16 md:pb-8 border-b border-slate-900/40 bg-slate-950/20 backdrop-blur-md lg:pt-20">
        <div className="flex items-center shrink-0">
          <img
            src="/AIVE_Neon_Logo.png"
            alt="AIVE Logo"
            className="h-[22px] sm:h-[28px] md:h-[34px] lg:h-[38px] object-contain"
          />
        </div>
        <div className="flex items-center gap-3 sm:gap-4 font-medium">
          {user ? (
            <>
              <div
                onClick={() => setView("mypage")}
                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-purple-900/40 select-none"
              >
                <span className="text-white font-black text-xl tracking-tight">
                  {(user.user_metadata?.full_name || user.email?.split("@")[0] || "??").slice(0, 2)}
                </span>
              </div>
            </>
          ) : (
            <>
              <span
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm sm:text-base text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                로그인
              </span>
              <span
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm sm:text-base text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl cursor-pointer transition-all border border-white/10"
              >
                무료로 회원가입
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Spacious Hero Section */}
      <section className="relative z-20 w-full px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-48 pt-16 pb-20 md:pt-24 md:pb-28 text-center flex flex-col items-center">
        {/* Glow backdrop behind typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/10 to-purple-600/10 blur-[140px] rounded-full pointer-events-none"></div>



        {/* Large Typography Headlines */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white mb-4 select-none uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            AI 100
          </span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 [text-shadow:0_0_40px_rgba(6,182,212,0.3)]">
            ROADMAP
          </span>
        </h1>

        {/* Supporting Typography */}
        <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-200 mb-6 max-w-4xl">
          AI 시대의 핵심 인재로 거듭나기 위한 실전 마일스톤
        </p>

        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed mb-10 font-normal">
          AI 기초와 프롬프트부터 이미지 생성, 금융 데이터 분석, 실전 기획까지 모두 담은 100단계 로드맵입니다. AI계의 다이소, AI 성심당. 나에게 필요한 것만 커리큘럼을 짜고, AI 캐릭터와 함께 끝까지 완주해 보세요!
        </p>

        {/* Dynamic CTAs - Centered together */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl">
          {/* Button 1: 캐릭터 생성하기 */}
          <div className="w-full sm:w-auto min-w-[240px]">
            <button
              onClick={() => {
                setTempCharacter(myCharacter);
                setIsCharacterModalOpen(true);
              }}
              className="relative group overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 w-full flex items-center justify-center gap-3 border border-emerald-400/30 h-[56px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <User className="w-5 h-5 text-emerald-200 animate-pulse" />
              <span className="text-base md:text-lg text-left font-black">로드맵 캐릭터</span>
            </button>
          </div>

          {/* Button 2: 로드맵 생성하기 */}
          <div className="w-full sm:w-auto min-w-[240px]">
            <button
              onClick={() => setIsRecommendModalOpen(true)}
              className="relative group overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-white tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 w-full flex items-center justify-center gap-3 border border-cyan-400/30 h-[56px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
              <span className="text-base md:text-lg text-left font-black">나만의 커리큘럼</span>
            </button>
          </div>
        </div>

        {/* Dynamic Status Tags (Filters / Active Guardian) Displayed below CTA buttons */}
        {(isFilterActive || myCharacter) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 max-w-4xl w-full">
            {/* Active Character display banner */}
            {myCharacter && (
              <div
                onClick={() => {
                  setTempCharacter(myCharacter);
                  setIsCharacterModalOpen(true);
                }}
                className="flex items-center gap-3 bg-emerald-950/20 hover:bg-emerald-950/35 border border-emerald-500/30 rounded-xl px-4 py-2.5 backdrop-blur-md text-left transition-all cursor-pointer animate-fadeIn hover:scale-[1.02] shadow-lg"
              >
                <div className="text-xl w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center animate-pulse shrink-0">
                  {myCharacter.animal === "강아지" && "🐶"}
                  {myCharacter.animal === "고양이" && "🐱"}
                  {myCharacter.animal === "토끼" && "🐰"}
                  {myCharacter.animal === "판다" && "🐼"}
                  {myCharacter.animal === "사자" && "🦁"}
                  {myCharacter.animal === "펭귄" && "🐧"}
                  {myCharacter.animal === "곰" && "🐻"}
                  {myCharacter.animal === "여우" && "🦊"}
                  {myCharacter.animal === "햄스터" && "🐹"}
                  {myCharacter.animal === "쿼카" && "🐿️"}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[9px] text-emerald-400 font-mono tracking-wider font-semibold uppercase flex items-center gap-1 leading-none">
                    My Roadmap Guardian
                  </div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5 mt-1 leading-none">
                    {myCharacter.role || "미설정 직무"} • {myCharacter.animal}
                  </div>
                </div>
              </div>
            )}

            {/* Active filters tag representation */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 border border-slate-800 animate-fadeIn shadow-lg">
                {selectedInterests.map((interest) => (
                  <span key={interest} className="text-[11px] px-3 py-1 bg-purple-950/40 text-purple-300 border border-purple-800/60 rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
                    {interest}
                    <button
                      type="button"
                      title="Remove interest filter"
                      onClick={() => toggleInterest(interest)}
                      className="hover:text-white text-slate-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedInterests([]);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 pl-1"
                >
                  전체 초기화
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Progress Box & Character display wrapper: Sticky on mobile, Fixed on desktop */}
      <div className="sticky top-6 z-50 mt-[50px] self-end mr-6 mb-8 md:fixed md:top-[160px] lg:top-[200px] md:right-4 lg:right-6 xl:right-8 md:mt-0 md:mr-0 md:mb-0 md:ml-0 flex flex-col items-end gap-3.5 z-[100]">

        {/* Progress Box */}
        <div className="bg-slate-900/60 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-end min-w-[140px] md:min-w-[160px]">
          <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            {timelineNodes.length > 0
              ? ((completedNodes.length / timelineNodes.length) * 100).toFixed(1)
              : 0}
            %
          </div>
          <div className="text-cyan-400/80 text-[10px] md:text-xs font-mono uppercase tracking-widest mt-1">
            Roadmap Progress
          </div>
          <button
            onClick={() => setCompletedNodes([])}
            className="mt-3 px-3 py-1 rounded border transition-colors duration-200 text-[10px] md:text-xs font-mono tracking-wider
              bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 active:scale-95 w-full text-center"
          >
            체크박스 해제
          </button>
        </div>

        {/* Character Card Widget */}
        {myCharacter && (
          <div
            onClick={() => {
              setTempCharacter(myCharacter);
              setIsCharacterModalOpen(true);
            }}
            className="w-full max-w-[210px] md:max-w-[240px] flex flex-col items-center bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 group cursor-pointer animate-fadeIn"
          >
            {/* Mascot Image Thumbnail rounded layout */}
            <div className="relative w-[120px] h-[120px] md:w-[144px] md:h-[144px] rounded-xl border border-emerald-500/20 bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              {myCharacter.imageUrl && !imageLoadError ? (
                <img
                  src={myCharacter.imageUrl}
                  alt={`${myCharacter.animal} guardian`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-6xl md:text-7xl filter drop-shadow-[0_2px_12px_rgba(16,185,129,0.4)]">
                  {myCharacter.animal === "강아지" && "🐶"}
                  {myCharacter.animal === "고양이" && "🐱"}
                  {myCharacter.animal === "토끼" && "🐰"}
                  {myCharacter.animal === "판다" && "🐼"}
                  {myCharacter.animal === "사자" && "🦁"}
                  {myCharacter.animal === "펭귄" && "🐧"}
                  {myCharacter.animal === "곰" && "🐻"}
                  {myCharacter.animal === "여우" && "🦊"}
                  {myCharacter.animal === "햄스터" && "🐹"}
                  {myCharacter.animal === "쿼카" && "🐿️"}
                </span>
              )}
            </div>

            {/* Mascot details */}
            <div className="text-center mt-3.5 w-full">
              <div className="text-xs md:text-sm font-black text-slate-100 whitespace-pre-wrap break-words w-full px-1 leading-snug">
                {[myCharacter.course ? myCharacter.course.split("(")[0].trim() : "", myCharacter.animal].filter(Boolean).join(" ")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Container for Roadmap line (Desktop) */}
      <div
        className="hidden md:block flex-1 w-full mx-auto overflow-x-auto relative z-10 px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-48 
        [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-[#020617] [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {/* Magic scale canvas: fixed internal dimensions, perfectly aligned SVG and absolute nodes */}
        <div
          className="relative mx-auto my-10 md:my-0 pb-32"
          style={{ width: "1750px", height: `${containerHeight}px` }}
        >
          {/* The Path (SVG Line) */}
          <svg
            className="absolute inset-0 w-[1750px] h-full pointer-events-none drop-shadow-lg"
            viewBox={`0 0 1750 ${containerHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={svgPathD}
              stroke="url(#lineGradient)"
              strokeWidth="5"
              strokeDasharray="14 10"
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-[dash_20s_linear_infinite]"
              style={{ strokeDashoffset: 100 }}
            />
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0"
                y1="0"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="40%" stopColor="#a855f7" />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Render Timeline Nodes */}
          {timelineNodes.map((node) => (
            <TimelineNode
              key={node.id}
              node={node}
              isCompleted={completedNodes.includes(node.id)}
              onTextClick={handleTextClick}
              onIconClick={handleIconClick}
              isDimmed={checkIsDimmed(node)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="block md:hidden relative w-full px-4 pt-10 pb-32 z-10">
        {/* Continuous background line for mobile */}
        <div className="absolute left-[38px] top-12 bottom-32 w-1 bg-slate-800 rounded-full"></div>

        {[...timelineNodes]
          .sort((a, b) => a.id - b.id)
          .map((node, i, arr) => (
            <MobileTimelineNode
              key={node.id}
              node={node}
              isCompleted={completedNodes.includes(node.id)}
              onTextClick={handleTextClick}
              onIconClick={handleIconClick}
              isLast={i === arr.length - 1}
              isDimmed={checkIsDimmed(node)}
            />
          ))}
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-700/80 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background glow in popup */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

              <button
                title="Close"
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
                onClick={() => setSelectedNode(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div
                className={`text-xs font-mono mb-3 
                  ${selectedNode.status === "done" ? "text-cyan-400" : selectedNode.status === "active" ? "text-purple-400" : "text-slate-500"}`}
              >
                파트: {selectedNode.company}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {selectedNode.title}
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base mb-6">
                {selectedNode.desc}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 items-center">
                  <span className="w-20 text-slate-400 text-sm font-semibold shrink-0">
                    레벨
                  </span>
                  <span className="text-slate-200 text-sm font-mono bg-slate-700 px-2 py-0.5 rounded">
                    {selectedNode.level}
                  </span>
                </div>
                <div className="flex bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 items-center">
                  <span className="w-20 text-slate-400 text-sm font-semibold shrink-0">
                    관심사
                  </span>
                  <span className="text-slate-200 text-sm flex-1">
                    {selectedNode.interest}
                  </span>
                </div>
                <div className="flex bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <span className="w-20 text-slate-400 text-sm font-semibold shrink-0 pt-1">
                    관련 직무
                  </span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {selectedNode.roles.length > 0 ? (
                      selectedNode.roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-1 bg-cyan-900/20 text-cyan-300 border border-cyan-500/30 rounded-full"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm pt-1">-</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedNode.status === "active" && (
                <div className="mt-8 flex items-center gap-3 text-purple-400 text-sm font-mono bg-purple-500/10 px-4 py-3 rounded-xl border border-purple-500/20 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  IN PROGRESS
                </div>
              )}
              {selectedNode.status === "locked" && (
                <div className="mt-8 flex items-center gap-3 text-slate-500 text-sm font-mono bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50 w-fit">
                  <Lock className="w-3 h-3" />
                  UPCOMING
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {isRecommendModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-md"
            onClick={() => setIsRecommendModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top border line */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-cyan-500 via-indigo-400 to-purple-500 rounded-t-2xl"></div>

              {/* Decorative background glow inside modal */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>

              <button
                type="button"
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                onClick={() => setIsRecommendModalOpen(false)}
              >
                <X className="w-7 h-7" />
              </button>

              <div className="flex items-center gap-2 mb-3 text-cyan-400">
                <Sparkles className="w-7 h-7 animate-pulse" />
                <span className="text-base font-mono tracking-wider uppercase">CURRICULUM RECOMMENDER</span>
              </div>

              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                나만의 커리큘럼 만들기
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                관심사를 선택해 보세요. 당신에게 최적화된 맞춤형 추천 교육 로드맵이 실시간으로 하이라이트됩니다.
              </p>

              <div className="space-y-6">
                {/* Interests Section (Dropdown with Checklist) */}
                <div className="relative">
                  <label className="block text-lg font-bold text-slate-300 mb-3 uppercase tracking-wider pl-1 font-sans">
                    🎯 관심사 선택 <span className="text-sm text-slate-500 font-normal">(복수 선택 가능)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setModalInterestDropdownOpen(!modalInterestDropdownOpen);
                      }}
                      className="w-full bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 p-5 shadow-xl text-left text-slate-300 flex justify-between items-center hover:bg-slate-900 hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <span className="truncate pr-4 font-medium text-lg">
                        {selectedInterests.length > 0
                          ? `선택됨 (${selectedInterests.length}): ${selectedInterests.join(", ")}`
                          : "어떤 분야에 관심 있으신가요?"}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 text-slate-400 shrink-0 transition-transform duration-200 ${modalInterestDropdownOpen ? "rotate-180 text-purple-400" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {modalInterestDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalInterestDropdownOpen(false);
                            }}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-800/90 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900/60 backdrop-blur-md max-h-80 overflow-y-auto"
                          >
                            {INTERESTS.map((interest) => {
                              const isSelected = selectedInterests.includes(interest);
                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => toggleInterest(interest)}
                                  className={`w-full text-left px-6 py-4 hover:bg-slate-900 transition-colors flex items-center justify-between text-base md:text-lg ${isSelected ? "text-purple-400 font-semibold" : "text-slate-300"}`}
                                >
                                  <span>{interest}</span>
                                  {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex gap-3 pt-5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInterests([]);
                  }}
                  className="px-5 py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  초기화
                </button>
                <button
                  type="button"
                  onClick={() => { }}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-4 px-5 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20 hover:scale-[1.01]"
                >
                  커리큘럼 적용
                </button>
                <button
                  type="button"
                  disabled={savingCurriculum || selectedInterests.length === 0}
                  onClick={async () => {
                    if (selectedInterests.length === 0) return;
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      setUser(null);
                      localStorage.setItem("aive_pending_curriculum", JSON.stringify(selectedInterests));
                      setIsRecommendModalOpen(false);
                      setIsLoginModalOpen(true);
                      return;
                    }
                    const saved = await saveCurriculumToDb(selectedInterests);
                    if (saved) setIsRecommendModalOpen(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 px-5 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 border border-blue-500/30"
                >
                  {savingCurriculum ? "저장 중..." : !user ? "로그인 후 저장" : "커리큘럼 저장"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Character Creator Modal */}
      <AnimatePresence>
        {isCharacterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto md:py-12"
          >
            {/* Backdrop close area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsCharacterModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-12 shadow-2xl z-10 overflow-visible my-auto"
            >
              {/* Top border light effect */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-t-[32px]"></div>

              {/* Close button */}
              <button
                type="button"
                title="Close Character Modal"
                onClick={() => setIsCharacterModalOpen(false)}
                className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {!tempCharacter && !isGenerating ? (
                /* SECTION 1: Character Build Panel */
                <div>
                  <div className="flex items-center gap-2.5 mb-3 text-emerald-400">
                    <Award className="w-7 h-7 animate-pulse" />
                    <span className="text-base font-mono tracking-wider uppercase font-bold">CHARACTER BUILDER</span>
                  </div>

                  <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                    나만의 캐릭터 만들기
                  </h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                    당신의 직무, 관심분야, 동물을 선택하면 페이스메이커 캐릭터가 부여됩니다.
                  </p>

                  <div className="space-y-6">
                    {/* 1. Job Role Dropdown */}
                    <div className="relative">
                      <label className="block text-lg font-extrabold text-slate-300 mb-3 uppercase tracking-wider pl-1">
                        직무 선택
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCharRoleDropdownOpen(!charRoleDropdownOpen);
                            setCharInterestDropdownOpen(false);
                            setCharAnimalDropdownOpen(false);
                          }}
                          className="w-full bg-slate-950/90 rounded-2xl border border-slate-800 p-4.5 shadow-xl text-left text-slate-200 flex justify-between items-center hover:bg-slate-900 hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                          <span className="truncate pr-4 font-bold text-base md:text-lg">
                            {charRole || "직무를 선택해 주세요"}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${charRoleDropdownOpen ? "rotate-180 text-emerald-400" : ""}`}
                          />
                        </button>

                        <AnimatePresence>
                          {charRoleDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCharRoleDropdownOpen(false);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900/60 backdrop-blur-md max-h-64 overflow-y-auto"
                              >
                                {ROLES.map((role) => {
                                  const isSelected = charRole === role;
                                  return (
                                    <button
                                      key={role}
                                      type="button"
                                      onClick={() => {
                                        setCharRole(role);
                                        setCharRoleDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-900 transition-colors flex items-center justify-between text-base md:text-lg ${isSelected ? "text-emerald-400 bg-emerald-950/20 font-bold" : "text-slate-300"
                                        }`}
                                    >
                                      <span>{role}</span>
                                      {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* 2. Interests Single Selection (Dropdown) */}
                    <div className="relative">
                      <label className="block text-lg font-extrabold text-slate-300 mb-3 uppercase tracking-wider pl-1">
                        최대 관심사
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCharInterestDropdownOpen(!charInterestDropdownOpen);
                            setCharRoleDropdownOpen(false);
                            setCharAnimalDropdownOpen(false);
                          }}
                          className="w-full bg-slate-950/90 rounded-2xl border border-slate-800 p-4.5 shadow-xl text-left text-slate-200 flex justify-between items-center hover:bg-slate-900 hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                          <span className="truncate pr-4 font-bold text-base md:text-lg">
                            {charInterest || "최대 관심사를 선택해 주세요"}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${charInterestDropdownOpen ? "rotate-180 text-emerald-400" : ""}`}
                          />
                        </button>

                        <AnimatePresence>
                          {charInterestDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCharInterestDropdownOpen(false);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900/60 backdrop-blur-md max-h-64 overflow-y-auto"
                              >
                                {INTERESTS.filter(interest => interest !== "AI 기초").map((interest) => {
                                  const isSelected = charInterest === interest;
                                  return (
                                    <button
                                      key={interest}
                                      type="button"
                                      onClick={() => {
                                        setCharInterest(interest);
                                        setCharInterestDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-900 transition-colors flex items-center justify-between text-base md:text-lg ${isSelected ? "text-emerald-400 font-bold" : "text-slate-300"
                                        }`}
                                    >
                                      <span>{interest}</span>
                                      {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* 3. Animal Selection (Dropdown) */}
                    <div className="relative">
                      <label className="block text-lg font-extrabold text-slate-300 mb-3 uppercase tracking-wider pl-1">
                        동물 캐릭터 선택
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCharAnimalDropdownOpen(!charAnimalDropdownOpen);
                            setCharRoleDropdownOpen(false);
                            setCharInterestDropdownOpen(false);
                          }}
                          className="w-full bg-slate-950/90 rounded-2xl border border-slate-800 p-4.5 shadow-xl text-left text-slate-200 flex justify-between items-center hover:bg-slate-900 hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                          <span className="truncate pr-4 font-bold text-base md:text-lg flex items-center gap-3">
                            {charAnimal ? (
                              <>
                                <span className="text-2xl">
                                  {charAnimal === "강아지" && "🐶"}
                                  {charAnimal === "고양이" && "🐱"}
                                  {charAnimal === "토끼" && "🐰"}
                                  {charAnimal === "판다" && "🐼"}
                                  {charAnimal === "사자" && "🦁"}
                                  {charAnimal === "펭귄" && "🐧"}
                                  {charAnimal === "곰" && "🐻"}
                                  {charAnimal === "여우" && "🦊"}
                                  {charAnimal === "햄스터" && "🐹"}
                                  {charAnimal === "쿼카" && "🐿️"}
                                </span>
                                <span>{charAnimal}</span>
                              </>
                            ) : (
                              "동물을 선택해 주세요"
                            )}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${charAnimalDropdownOpen ? "rotate-180 text-emerald-400" : ""}`}
                          />
                        </button>

                        <AnimatePresence>
                          {charAnimalDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCharAnimalDropdownOpen(false);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 bottom-full mb-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900/60 backdrop-blur-md max-h-[380px] overflow-y-auto"
                              >
                                {[
                                  { name: "강아지", emoji: "🐶" },
                                  { name: "고양이", emoji: "🐱" },
                                  { name: "토끼", emoji: "🐰" },
                                  { name: "판다", emoji: "🐼" },
                                  { name: "사자", emoji: "🦁" },
                                  { name: "펭귄", emoji: "🐧" },
                                  { name: "곰", emoji: "🐻" },
                                  { name: "여우", emoji: "🦊" },
                                  { name: "햄스터", emoji: "🐹" },
                                  { name: "쿼카", emoji: "🐿️" }
                                ].map((item) => {
                                  const isSelected = charAnimal === item.name;
                                  return (
                                    <button
                                      key={item.name}
                                      type="button"
                                      onClick={() => {
                                        setCharAnimal(item.name);
                                        setCharAnimalDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-6 py-4 hover:bg-slate-900 transition-colors flex items-center justify-between text-base md:text-lg ${isSelected ? "text-emerald-400 bg-emerald-950/20 font-bold" : "text-slate-300"
                                        }`}
                                    >
                                      <span className="flex items-center gap-3">
                                        <span className="text-2xl">{item.emoji}</span>
                                        <span>{item.name}</span>
                                      </span>
                                      {isSelected && <Check className="w-5 h-5 text-emerald-400" />}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Error display if failed to fetch OpenAI */}
                  {genError && (
                    <div className="mt-5 p-4 bg-rose-950/40 border border-rose-900/50 rounded-2xl text-sm text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                      <span className="text-base shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="font-extrabold text-base">캐릭터 생성 실패</p>
                        <p className="mt-1 opacity-85 leading-relaxed">{genError}</p>
                      </div>
                    </div>
                  )}

                  {/* Build Action Buttons */}
                  <div className="mt-10 flex gap-4 pt-6 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setCharRole(null);
                        setCharInterest(null);
                        setCharAnimal(null);
                        setGenError(null);
                      }}
                      className="px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-lg font-bold transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      초기화
                    </button>
                    <button
                      type="button"
                      disabled={!charRole || !charInterest || !charAnimal || isGenerating}
                      onClick={async () => {
                        if (!charRole || !charInterest || !charAnimal) return;
                        setIsGenerating(true);
                        setGenError(null);
                        setImageLoadError(false);

                        try {
                          // Find matched course from job_interest_course.json
                          const lookupRole = charRole === "기획&데이터" ? "기획&데이터분석" : charRole;

                          // Map dynamic user-selected interest to keys in job_interest_course.json
                          let lookupInterest = charInterest;
                          if (charInterest === "정적 콘텐츠(이미지)") {
                            lookupInterest = "정적 콘텐츠";
                          } else if (charInterest === "동적 콘텐츠(영상,음악)") {
                            lookupInterest = "동적 콘텐츠";
                          } else if (charInterest === "기획&데이터분석") {
                            lookupInterest = "데이터&기획";
                          } else if (charInterest === "재무분석&투자") {
                            lookupInterest = "투자";
                          } else if (charInterest === "바이브코딩") {
                            lookupInterest = "코딩";
                          }

                          const courseMatch = (rawCourseData as any[]).find(
                            (c) => c.role === lookupRole && c.interest === lookupInterest
                          );
                          const matchedCourse = courseMatch ? courseMatch.course : "정예 스페셜리스트";
                          const courseDesc = courseMatch ? courseMatch.course_desc_ko : null;
                          const courseDescEn = courseMatch ? (courseMatch.course_desc_en || courseMatch.course_desc_ko) : "";

                          const animalObj = rawCharacterData.find(c => c.character === charAnimal);
                          const desc = courseDesc || (animalObj ? animalObj.description : "A magnificent Roadmap companion matching your active career steps.");

                          // Build final prompt for model: "gpt-image-1"
                          const basePrompt = ANIMAL_PROMPTS[charAnimal] || "a cute cartoon animal character, chibi style, white background";
                          const styleDesc = "chibi anime style, super deformed cute proportions";

                          let finalPrompt = `${basePrompt}, ${styleDesc}`;
                          if (courseDescEn && courseDescEn.trim()) {
                            finalPrompt += `, ${courseDescEn.trim()}`;
                          }

                          // Call our server API via POST
                          const response = await fetch("/api/generate-image", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ prompt: finalPrompt }),
                          });

                          const responseText = await response.text();
                          let data;
                          try {
                            data = JSON.parse(responseText);
                          } catch (e: any) {
                            console.error("Non-JSON response received. Error:", e, "Content of responseText is:", responseText);
                            throw new Error(`서버 응답 오류 (상태 코드: ${response.status}). JSON 파싱 에러: ${e.message || e}. 응답 미리보기: ${responseText.substring(0, 120)}...`);
                          }

                          if (!response.ok) {
                            throw new Error(data.error || "Failed to generate character image");
                          }

                          const imageUrl = data.image; // Base64 or URL

                          // Assign custom stat based on chosen job role:
                          let coding = 60;
                          let charm = 100;
                          let speed = 70;
                          let wisdom = 65;

                          if (charRole === "IT&개발") {
                            coding = 98;
                            speed = 85;
                            wisdom = 80;
                          } else if (charRole === "기획&데이터") {
                            coding = 80;
                            wisdom = 95;
                            speed = 75;
                          } else if (charRole === "재무&경영지원") {
                            coding = 70;
                            wisdom = 98;
                            speed = 70;
                          } else if (charRole === "디자인&영상") {
                            coding = 65;
                            wisdom = 75;
                            speed = 92; // High artistic speed
                          } else if (charRole === "영업&마케팅") {
                            coding = 60;
                            wisdom = 88;
                            speed = 80;
                          }

                          // Extra stats for interests selected:
                          if (charInterest) {
                            wisdom += 10;
                            coding += 5;
                          }

                          setTempCharacter({
                            role: charRole,
                            interest: charInterest,
                            animal: charAnimal!,
                            course: matchedCourse,
                            desc,
                            imageUrl: imageUrl,
                            powerStats: { coding: Math.min(coding, 100), charm, speed: Math.min(speed, 100), wisdom: Math.min(wisdom, 100) }
                          });
                        } catch (error: any) {
                          console.error("Error generating character:", error);
                          setGenError(error.message || "서버 통신 중 에러가 발생했습니다.");
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white py-4 px-6 rounded-2xl font-black text-lg md:text-xl tracking-wider transition-all duration-200 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 hover:scale-[1.01]"
                    >
                      {isGenerating ? "캐릭터 그리는 중... 🎨" : "나만의 캐릭터 생성하기"}
                    </button>
                  </div>
                </div>
              ) : isGenerating ? (
                /* SECTION 2: Generate Loading Screen */
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="relative w-44 h-44 mb-10">
                    {/* Pulsing halo */}
                    <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping duration-1500"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-emerald-500 bg-emerald-950/10 flex items-center justify-center animate-spin duration-3000 border-t-transparent border-b-transparent"></div>
                    <div className="absolute inset-6 rounded-full border border-teal-400 border-l-transparent flex items-center justify-center animate-spin duration-2000"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-7xl filter drop-shadow-lg">
                      {charAnimal === "강아지" && "🐶"}
                      {charAnimal === "고양이" && "🐱"}
                      {charAnimal === "토끼" && "🐰"}
                      {charAnimal === "판다" && "🐼"}
                      {charAnimal === "사자" && "🦁"}
                      {charAnimal === "펭귄" && "🐧"}
                      {charAnimal === "곰" && "🐻"}
                      {charAnimal === "여우" && "🦊"}
                      {charAnimal === "햄스터" && "🐹"}
                      {charAnimal === "쿼카" && "🐿️"}
                      {!charAnimal && "🔮"}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white animate-pulse tracking-tight mb-3">
                    캐릭터 생성 중...
                  </h3>
                  <p className="text-sm font-mono text-emerald-400/80 mt-3 uppercase tracking-widest font-extrabold">
                    AI AGENT SYSTEM • CONNECTING {charRole}
                  </p>
                  <p className="text-base text-slate-400 max-w-xl mt-6 leading-relaxed">
                    선택한 커리어 기질과 {charAnimal}의 메커니즘을 융합하여 특별한 가디언 스탯을 할당하는 중입니다.
                  </p>
                </div>
              ) : tempCharacter && (
                /* SECTION 3: Completed Mascot Display Card */
                <div className="animate-fadeIn">
                  <div className="text-center pb-5 mb-5 border-b border-slate-800/70">
                    <div className="text-emerald-400 font-extrabold text-lg sm:text-xl tracking-tight">
                      당신은 {tempCharacter.course} {tempCharacter.animal}입니다.
                    </div>
                  </div>

                  {/* Holo Guardian Profile Card with subtle animations */}
                  <div className="relative group overflow-hidden bg-slate-950 border border-slate-800/90 rounded-2xl p-5 mb-6 shadow-2xl">
                    <div className="absolute -top-[120px] -right-[120px] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-[120px] -left-[120px] w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 py-4">
                      {/* Big Glowing Real Image Display (Enlarged by ~2x) */}
                      <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-1.5 rounded-3xl border border-emerald-500/30 flex items-center justify-center shrink-0 w-72 h-72 sm:w-[400px] sm:h-[400px] shadow-2xl overflow-hidden">
                        {tempCharacter.imageUrl && !imageLoadError ? (
                          <img
                            src={tempCharacter.imageUrl}
                            alt={`${tempCharacter.animal} mascot`}
                            referrerPolicy="no-referrer"
                            onError={() => setImageLoadError(true)}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-1 rounded-2xl border border-emerald-400/10 animate-pulse"></div>
                            <span className="text-[9rem] sm:text-[12rem] filter drop-shadow-[0_4px_24px_rgba(16,185,129,0.5)]">
                              {tempCharacter.animal === "강아지" && "🐶"}
                              {tempCharacter.animal === "고양이" && "🐱"}
                              {tempCharacter.animal === "토끼" && "🐰"}
                              {tempCharacter.animal === "판다" && "🐼"}
                              {tempCharacter.animal === "사자" && "🦁"}
                              {tempCharacter.animal === "펭귄" && "🐧"}
                              {tempCharacter.animal === "곰" && "🐻"}
                              {tempCharacter.animal === "여우" && "🦊"}
                              {tempCharacter.animal === "햄스터" && "🐹"}
                              {tempCharacter.animal === "쿼카" && "🐿️"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Mascot Details (Sized up for a luxurious pairing) */}
                      <div className="text-center sm:text-left flex-1 py-4">
                        <h3 className="text-sm md:text-base font-mono tracking-widest text-emerald-400 font-black uppercase">
                          Animal Avatar
                        </h3>
                        <h4 className="text-xl sm:text-2xl md:text-[30px] font-black text-white mt-3 leading-tight drop-shadow-md tracking-tight">
                          {tempCharacter.course} {tempCharacter.animal}
                        </h4>

                        {/* Selected Interest tag */}
                        {tempCharacter.interest ? (
                          <div className="flex flex-wrap gap-2.5 mt-5 justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-extrabold shadow-sm">
                              #{tempCharacter.interest}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 mt-4 font-mono italic">#통합학습가 #기본탑재데이터</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download and Prompts Explorer (Implements app.py design) */}
                  {tempCharacter.imageUrl && (
                    <div className="mb-6 flex flex-col gap-3">
                      <a
                        href={tempCharacter.imageUrl}
                        download={`AIVE_${tempCharacter.animal}_guard.png`}
                        className="w-full bg-slate-900/60 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-md hover:border-emerald-500/40"
                      >
                        <span>⬇️ 캐릭터 이미지 다운로드</span>
                      </a>

                      <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowPromptDetails(!showPromptDetails)}
                          className="w-full flex justify-between items-center p-3 text-left text-xs text-slate-400 hover:bg-slate-900 transition-colors font-semibold outline-none"
                        >
                          <span className="flex items-center gap-1.5 font-sans">📋 생성 정보 보기</span>
                          <span className="text-[10px] text-slate-500 font-mono">{showPromptDetails ? "접기 ▲" : "펼치기 ▼"}</span>
                        </button>

                        {showPromptDetails && (
                          <div className="p-3.5 border-t border-slate-900/80 text-[11px] text-slate-300 space-y-2 bg-slate-950/40 font-mono">
                            <p><span className="text-slate-500 font-bold">동물:</span> {tempCharacter.animal}</p>
                            {tempCharacter.role && <p><span className="text-slate-500 font-bold">직무:</span> {tempCharacter.role}</p>}
                            {tempCharacter.interest && <p><span className="text-slate-500 font-bold">관심사:</span> {tempCharacter.interest}</p>}
                            <p><span className="text-slate-500 font-bold">교육과정:</span> {tempCharacter.course}</p>
                            <p className="border-t border-slate-900/60 pt-2"><span className="text-slate-500 font-bold text-xs">사용 프롬프트:</span></p>
                            <div className="p-2.5 bg-slate-900/40 rounded border border-slate-850 text-emerald-400 break-words leading-relaxed select-all">
                              {ANIMAL_PROMPTS[tempCharacter.animal] || "a cute cartoon animal character, chibi style, white background"}{tempCharacter.desc ? `, chibi anime style, super deformed cute proportions, ${tempCharacter.desc}` : ""}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post-Generation Actions */}
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setMyCharacter(null); // Clear the active character on the screen
                        localStorage.removeItem("aive_my_character");
                        setTempCharacter(null); // Return to customization
                        setShowPromptDetails(false);
                        setImageLoadError(false);
                      }}
                      className="px-5 py-4 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-sm sm:text-base font-semibold transition-colors flex items-center gap-2 shrink-0"
                    >
                      다시 커스텀하기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMyCharacter(tempCharacter);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-4 px-3 rounded-xl font-bold text-sm sm:text-lg tracking-wide transition-all duration-200 text-center"
                    >
                      캐릭터 적용
                    </button>
                    <button
                      type="button"
                      disabled={savingCharacter}
                      onClick={async () => {
                        if (!user) {
                          // 로그인 후 자동 저장을 위해 캐릭터 임시 보관
                          localStorage.setItem("aive_pending_character", JSON.stringify(tempCharacter));
                          setIsLoginModalOpen(true);
                          return;
                        }
                        const saved = await saveCharacterToDb(tempCharacter);
                        if (saved) {
                          setMyCharacter(tempCharacter);
                          localStorage.setItem("aive_my_character", JSON.stringify(tempCharacter));
                          setIsCharacterModalOpen(false);
                          setShowPromptDetails(false);
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-3 rounded-xl font-bold text-sm sm:text-lg tracking-wide transition-all duration-200 text-center border border-blue-500/30"
                    >
                      {savingCharacter ? "저장 중..." : !user ? "로그인 후 저장" : "캐릭터 저장"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
