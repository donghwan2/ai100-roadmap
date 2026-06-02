import React, { useState } from 'react'
import { X, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="bg-white rounded-2xl shadow-2xl max-w-[400px] w-full relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 또는 회원가입</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                더 스마트한 응답, 파일 및 이미지 업로드<br />등을 이용할 수 있습니다.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3 mb-5">
              {/* Google — functional */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700 font-medium text-sm"
              >
                <GoogleIcon />
                Google 계정으로 계속하기
              </button>

              {/* Phone — UI only */}
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-full text-gray-300 cursor-not-allowed font-medium text-sm select-none"
              >
                <Phone className="w-5 h-5 shrink-0" />
                휴대전화 번호로 계속하기
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email — UI only */}
            <div className="space-y-3">
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm"
                readOnly
                tabIndex={-1}
              />
              <button
                type="button"
                disabled
                className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-base cursor-not-allowed opacity-40 select-none"
              >
                계속
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
