import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TranslatedText } from '@/components/TranslatedText';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] bg-white">
        <div className="container-wrapper py-8">
          <h1 className="text-3xl font-bold section-spacing"><TranslatedText text="Про проєкт" /></h1>
          <p className="mb-6 text-lg">
            <b>MedHelp</b> — <TranslatedText text="це сучасна платформа для навчання навичкам екстреної медичної допомоги з використанням інтерактивних симуляцій та курсів." />
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6 text-base">
            <li><TranslatedText text="Розроблена як дипломний проєкт студентом" /> <b><TranslatedText text="Ватажко Михайлом Андрійовичем" /></b> <TranslatedText text="(2025 рік)" />.</li>
            <li><TranslatedText text="Мета — зробити навчання екстреної медичної допомоги доступним, цікавим та ефективним для всіх." /></li>
            <li><TranslatedText text="Платформа містить:" /></li>
              <ul className="list-[circle] pl-6 mt-1">
                <li><TranslatedText text="Інтерактивні симуляції екстрених ситуацій" /></li>
                <li><TranslatedText text="Навчальні курси для медиків та всіх охочих" /></li>
                <li><TranslatedText text="Зручне відстеження прогресу" /></li>
                <li><TranslatedText text="Сучасний пошуковий інтерфейс" /></li>
                <li><TranslatedText text="Адаптивний дизайн для будь-яких пристроїв" /></li>
              </ul>
            <li><TranslatedText text="Використані технології" /> : React + TailwindCSS, Next.js, TypeScript.</li>
          </ul>
          <div className="bg-gray-100 rounded p-4 text-gray-700 mb-6">
            <b><TranslatedText text="Призначення" />:</b> <TranslatedText text="Дипломний проєкт для здобуття ступеня бакалавра" /><br/>
            <b><TranslatedText text="Автор" />:</b> <TranslatedText text="Ватажко Михайло Андрійович" /><br/>
            <b><TranslatedText text="Рік" />:</b> 2025
          </div>
          <p className="text-base text-gray-600">
            <TranslatedText text="Якщо у вас є питання або пропозиції — пишіть на" /> <a href="mailto:medhelpedu@gmail.com" className="text-blue-600 underline">medhelpedu@gmail.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}