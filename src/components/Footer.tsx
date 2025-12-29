'use client'

import { TranslatedText } from './TranslatedText'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container-wrapper py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div>
            <div className="text-xl font-bold text-white mb-2">
              MedHelp
            </div>
            <p className="text-gray-300">
              <TranslatedText text="Платформа для навчання навичкам екстреної медичної допомоги" />
            </p>
          </div>
          <div>
            <div className="text-xl font-bold text-white mb-2">
              <TranslatedText text="Контакти" />
            </div>
            <p className="text-gray-300">
              Email: medhelpedu@gmail.com <TranslatedText text="Телефон: +380 63 704 77 31" />
            </p>
          </div>
        </div>
        <div className="mt-4 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>
            <TranslatedText text="© 2025 MedHelp. Усі права захищені" />
          </p>
        </div>
      </div>
    </footer>
  )
}