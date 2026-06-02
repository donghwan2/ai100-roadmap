import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { LogOut, User, Mail, Calendar, Zap, Brain, Smile, Award, Trash2, ArrowLeft, AlertCircle, RefreshCw, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Character {
  id: string;
  role: string | null;
  interest: string | null;
  animal: string;
  course: string;
  description: string | null;
  image_url: string | null;
  power_stats: { coding: number; charm: number; speed: number; wisdom: number } | null;
  created_at: string;
  updated_at: string;
}

interface MyPageProps {
  user: any;
  savedCurriculumInterests: string[];
  onCurriculumDelete: () => Promise<void>;
  onBack: () => void;
  onLogout: () => void;
}

const ANIMAL_EMOJI: Record<string, string> = {
  강아지: "🐶", 고양이: "🐱", 토끼: "🐰", 판다: "🐼",
  사자: "🦁", 펭귄: "🐧", 곰: "🐻", 여우: "🦊",
  햄스터: "🐹", 쿼카: "🐿️",
};

function StatBar({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {icon} {label}
        </span>
        <span className="text-xs font-mono font-bold text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function MyPage({ user, savedCurriculumInterests, onCurriculumDelete, onBack, onLogout }: MyPageProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingCurriculum, setDeletingCurriculum] = useState(false);
  const [deleteCurriculumConfirm, setDeleteCurriculumConfirm] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "사용자";
  const email = user?.email || "";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  const fetchCharacter = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("요청 시간 초과. 네트워크를 확인하고 다시 시도해주세요.")), 8000)
      );
      const queryPromise = supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (error) throw error;
      setCharacter(data ?? null);
    } catch (e: any) {
      setFetchError(e?.message || "캐릭터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut 실패해도 onLogout으로 UI 초기화
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  const handleDelete = async () => {
    if (!character) return;
    setDeleting(true);
    try {
      await supabase.from("characters").delete().eq("id", character.id);
      setCharacter(null);
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const stats = character?.power_stats;

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-100 font-sans">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          메인으로 돌아가기
        </button>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-10 tracking-tight">My Page</h1>

        {/* ── 프로필 카드 ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-5 mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                <User className="w-7 h-7 text-slate-500" />
              </div>
            )}
            <div>
              <p className="text-xl font-black text-white">{fullName}</p>
              <p className="text-sm text-slate-400 mt-0.5">AIVE Member</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              {email}
            </div>
            {createdAt && (
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                가입일: {createdAt}
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 disabled:opacity-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </motion.section>

        {/* ── 캐릭터 카드 ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white tracking-tight">나의 캐릭터</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">불러오는 중...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <AlertCircle className="w-10 h-10 text-rose-400 opacity-60" />
              <p className="text-sm text-slate-400">{fetchError}</p>
              <button
                onClick={fetchCharacter}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            </div>
          ) : !character ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-5xl opacity-40">🔮</span>
              <p className="text-base font-bold text-slate-400">저장된 캐릭터가 없습니다</p>
              <p className="text-sm text-slate-600">메인 화면에서 캐릭터를 생성하고 저장해 보세요!</p>
              <button
                onClick={onBack}
                className="mt-4 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-xl transition-colors"
              >
                캐릭터 만들러 가기
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                {/* 캐릭터 프로필 */}
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8">
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-2xl border border-emerald-500/20 bg-slate-950 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5" />
                    {character.image_url && !imageError ? (
                      <img
                        src={character.image_url}
                        alt={character.animal}
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-8xl filter drop-shadow-lg">
                        {ANIMAL_EMOJI[character.animal] ?? "🐾"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-1">
                      Animal Avatar
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-3">
                      {character.course} {character.animal}
                    </h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                      {character.role && (
                        <span className="text-xs px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                          {character.role}
                        </span>
                      )}
                      {character.interest && (
                        <span className="text-xs px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
                          #{character.interest}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      저장일:{" "}
                      {new Date(character.updated_at).toLocaleDateString("ko-KR", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 mb-6 space-y-4">
                    <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Power Stats
                    </p>
                    <StatBar label="Coding" value={stats.coding} icon={<Zap className="w-3 h-3" />} color="bg-cyan-500" />
                    <StatBar label="Charm"  value={stats.charm}  icon={<Smile className="w-3 h-3" />} color="bg-pink-500" />
                    <StatBar label="Speed"  value={stats.speed}  icon={<Zap className="w-3 h-3" />} color="bg-amber-400" />
                    <StatBar label="Wisdom" value={stats.wisdom} icon={<Brain className="w-3 h-3" />} color="bg-purple-500" />
                  </div>
                )}

                {/* 삭제 */}
                <div className="flex justify-end">
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      캐릭터 삭제
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">정말 삭제할까요?</span>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-sm px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400 hover:bg-rose-950 transition-colors disabled:opacity-50"
                      >
                        {deleting ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.section>

        {/* ── 커리큘럼 카드 ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 mt-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black text-white tracking-tight">나만의 커리큘럼</h2>
          </div>

          {savedCurriculumInterests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <span className="text-4xl opacity-30">📚</span>
              <p className="text-base font-bold text-slate-400">저장된 커리큘럼이 없습니다</p>
              <p className="text-sm text-slate-600">
                메인 화면에서 관심사를 선택하고 "로드맵 저장"을 눌러보세요!
              </p>
              <button
                onClick={onBack}
                className="mt-3 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-bold rounded-xl transition-colors"
              >
                커리큘럼 만들러 가기
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
                선택된 관심사 ({savedCurriculumInterests.length}개)
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {savedCurriculumInterests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="flex justify-end">
                {!deleteCurriculumConfirm ? (
                  <button
                    onClick={() => setDeleteCurriculumConfirm(true)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    커리큘럼 삭제
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">정말 삭제할까요?</span>
                    <button
                      onClick={() => setDeleteCurriculumConfirm(false)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      disabled={deletingCurriculum}
                      onClick={async () => {
                        setDeletingCurriculum(true);
                        await onCurriculumDelete();
                        setDeletingCurriculum(false);
                        setDeleteCurriculumConfirm(false);
                      }}
                      className="text-sm px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400 hover:bg-rose-950 transition-colors disabled:opacity-50"
                    >
                      {deletingCurriculum ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
