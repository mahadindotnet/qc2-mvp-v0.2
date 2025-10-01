'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Palette, Mail, Phone } from 'lucide-react'
import TShirtDesigner from '@/components/TShirtDesigner'
import QuoteForm from '@/components/QuoteForm'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tshirts')
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spotlight Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-200/30 via-transparent to-transparent"></div>
        
        {/* Spread Out Circular Spotlights - Responsive */}
        <div className="absolute top-0 left-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-36 h-36 sm:w-54 sm:h-54 md:w-72 md:h-72 bg-amber-300/18 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-44 h-44 sm:w-66 sm:h-66 md:w-88 md:h-88 bg-yellow-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-orange-400/12 rounded-full blur-2xl"></div>
        
        {/* Center and Edge Spotlights - Responsive */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 w-28 h-28 sm:w-42 sm:h-42 md:w-56 md:h-56 bg-amber-400/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/2 w-36 h-36 sm:w-54 sm:h-54 md:w-72 md:h-72 bg-orange-500/12 rounded-full blur-3xl"></div>
        
        {/* Corner Spotlights - Responsive */}
        <div className="absolute top-1/6 left-1/6 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-yellow-500/8 rounded-full blur-2xl"></div>
        <div className="absolute top-1/6 right-1/6 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/6 left-1/6 w-28 h-28 sm:w-42 sm:h-42 md:w-56 md:h-56 bg-orange-600/6 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/6 right-1/6 w-20 h-20 sm:w-30 sm:h-30 md:w-40 md:h-40 bg-yellow-600/8 rounded-full blur-xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8 flex justify-center"
          >
            <div className="flex justify-center">
              {/* Logo Image - Responsive */}
              <div className="relative">
            <Image
                  src="/images/quickcopy2logo.png"
                  alt="Quick Copy 2 Logo"
                  width={300}
                  height={300}
                  className="drop-shadow-lg max-w-[200px] max-h-[200px] sm:max-w-[250px] sm:max-h-[250px] md:max-w-[300px] md:max-h-[300px] w-auto h-auto"
                  priority
                />
              </div>
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            We&apos;re Rebuilding...
            <br />
            <span style={{ color: '#FFA503' }}>But You Can Still Order!</span>
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-5xl mx-auto leading-relaxed px-4"
          >
            <p className="mb-4">
              Our new store is coming soon! In the meantime, place custom T-shirt orders, request a quote for other products, or{' '}
              <a 
                href="tel:+16514881244"
                className="inline-flex items-center gap-1 px-2 py-1 mx-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md text-sm"
              >
                <Phone className="h-3 w-3" />
                give us a call
              </a>
              {' '}— we&apos;re here to make it easy for you.
            </p>
          </motion.div>
         </motion.div>

         {/* Tab Navigation */}
         <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
           <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-4">
             {[
               { id: 'tshirts', label: 'Custom T-Shirts', icon: ShoppingCart },
               { id: 'gangsheet', label: 'Gangsheet', icon: Palette },
               { id: 'quote', label: 'Get A Quote', icon: Mail }
             ].map((tab) => {
               const Icon = tab.icon
               return (
                   <button
                     key={tab.id}
                     onClick={() => {
                       setActiveTab(tab.id)
                       // Scroll to tab content area
                       setTimeout(() => {
                         const contentArea = document.getElementById('tab-content')
                         if (contentArea) {
                         const elementPosition = contentArea.getBoundingClientRect().top
                         const offsetPosition = elementPosition + window.pageYOffset - 250
                           window.scrollTo({
                             top: offsetPosition,
                             behavior: 'smooth'
                           })
                         }
                       }, 100)
                     }}
                     className={`flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer shadow-lg ${
                     activeTab === tab.id
                       ? 'text-white border border-orange-300'
                       : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 bg-white'
                   }`}
                   style={{
                     backgroundColor: activeTab === tab.id ? '#FFA503' : 'white'
                   }}
                 >
                   <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                   <span className="hidden sm:inline font-bold">{tab.label}</span>
                   <span className="sm:hidden font-bold">{tab.label.split(' ')[0]}</span>
                 </button>
               )
             })}
           </div>
         </div>
       </div>
        </div>


       {/* Transparent Tab Content Area */}
       <div className="relative z-10 w-full">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           {/* Tab Content */}
           <div id="tab-content" className="min-h-[600px] sm:min-h-[800px] pt-0 p-0 pb-8 sm:pb-16">
             {activeTab === 'tshirts' && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 className="h-full"
               >
                 <TShirtDesigner />
               </motion.div>
             )}

             {activeTab === 'gangsheet' && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 className="text-center"
               >
                 <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#FFA503', opacity: 0.1 }}>
                   <Palette className="h-8 w-8" style={{ color: '#FFA503' }} />
                 </div>
                 <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Gangsheet Builder</h3>
                 <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                   Create professional gangsheets for efficient printing layouts. Upload multiple designs and arrange them on a 22×24 inch canvas.
                 </p>
                 <div className="bg-gray-50 rounded-lg p-4 sm:p-8 mb-4 sm:mb-6">
                   <p className="text-gray-500 text-sm sm:text-base">Gangsheet builder coming soon...</p>
                 </div>
                 <button className="text-white py-2 sm:py-3 px-4 sm:px-8 rounded-lg font-semibold transition-colors duration-300 hover:opacity-90 cursor-pointer text-sm sm:text-base" style={{ backgroundColor: '#FFA503' }}>
                   Start Building
                 </button>
               </motion.div>
             )}

             {activeTab === 'quote' && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 className="w-full"
               >
                 <QuoteForm />
               </motion.div>
             )}

           </div>
         </div>
       </div>
    </div>
  )
}