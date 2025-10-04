'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, lazy, Suspense } from 'react'
import { ShoppingCart, Mail, Phone, Copy, Grid3X3 } from 'lucide-react'

// Lazy load heavy components for better performance
const TShirtDesigner = lazy(() => import('@/components/TShirtDesigner'))
const QuoteForm = lazy(() => import('@/components/QuoteForm'))
const ColorCopiesForm = lazy(() => import('@/components/ColorCopiesForm'))

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
      <div className="relative z-10 min-h-[60vh] sm:min-h-screen flex items-center justify-center pt-12 sm:pt-0">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
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
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
              <motion.a 
                href="tel:+16514881244"
                className="inline-flex items-center gap-1 px-2 py-1 mx-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md text-sm"
                initial={{ 
                  opacity: 0, 
                  scale: 0.8,
                  rotateX: -15,
                  y: 10
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateX: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.2,
                  type: "spring",
                  stiffness: 120,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -2,
                  rotateX: 5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <motion.span
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1.4,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="inline-block"
                >
                  <Phone className="h-3 w-3" />
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1.6
                  }}
                >
                  give us a call
                </motion.span>
              </motion.a>
              {' '}— we&apos;re here to make it easy for you.
            </p>
          </motion.div>
         </motion.div>

         {/* Tab Navigation */}
         <motion.div 
           className="mt-12 sm:mt-16 md:mt-20 lg:mt-24"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
         >
           <motion.div 
             className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 py-10 max-w-full sm:flex-nowrap sm:overflow-x-auto min-h-[120px] sm:min-h-auto"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
           >
             {[
               { id: 'tshirts', label: 'Custom T-Shirts', icon: ShoppingCart },
               { id: 'color-copies', label: 'Color Copies', icon: Copy },
               { id: 'gangsheet', label: 'Custom Gangsheet', icon: Grid3X3 },
               { id: 'quote', label: 'Get A Quote', icon: Mail }
             ].map((tab, index) => {
               const Icon = tab.icon
               return (
                 <motion.button
                   key={tab.id}
                   initial={{ 
                     opacity: 0, 
                     y: 30, 
                     scale: 0.8,
                     rotateX: -15
                   }}
                   animate={{ 
                     opacity: 1, 
                     y: 0, 
                     scale: 1,
                     rotateX: 0
                   }}
                   transition={{ 
                     duration: 0.6, 
                     delay: 0.5 + (index * 0.15),
                     type: "spring",
                     stiffness: 100,
                     damping: 12
                   }}
                   whileHover={{ 
                     scale: 1.05,
                     y: -2,
                     transition: { duration: 0.2 }
                   }}
                   whileTap={{ 
                     scale: 0.95,
                     transition: { duration: 0.1 }
                   }}
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
                   className={`flex items-center justify-center space-x-1 sm:space-x-2 px-1 sm:px-4 md:px-6 py-4 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer shadow-lg whitespace-nowrap w-[calc(50%-6px)] sm:w-auto h-12 sm:h-auto ${
                     activeTab === tab.id
                       ? 'text-white border border-orange-300'
                       : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 bg-white'
                   }`}
                   style={{
                     backgroundColor: activeTab === tab.id ? '#FFA503' : 'white'
                   }}
                 >
                   <motion.div
                     initial={{ rotate: -180, scale: 0 }}
                     animate={{ rotate: 0, scale: 1 }}
                     transition={{ 
                       duration: 0.5, 
                       delay: 0.7 + (index * 0.15),
                       type: "spring",
                       stiffness: 200
                     }}
                   >
                     <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                   </motion.div>
                   <motion.span 
                     className="hidden sm:inline font-bold"
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ 
                       duration: 0.4, 
                       delay: 0.9 + (index * 0.15)
                     }}
                   >
                     {tab.label}
                   </motion.span>
                   <motion.span 
                     className="sm:hidden font-bold"
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ 
                       duration: 0.4, 
                       delay: 0.9 + (index * 0.15)
                     }}
                   >
                     {tab.label}
                   </motion.span>
                 </motion.button>
               )
             })}
           </motion.div>
         </motion.div>
       </div>
        </div>


       {/* Transparent Tab Content Area */}
       <div className="relative z-10 w-full">
         <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
           {/* Tab Content */}
           <div id="tab-content" className="min-h-[600px] sm:min-h-[800px] pt-0 p-0 pb-8 sm:pb-16">
             {activeTab === 'tshirts' && (
               <motion.div
                 key="tshirts"
                 initial={{ opacity: 0, y: 30, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -20, scale: 0.95 }}
                 transition={{ 
                   duration: 0.6,
                   type: "spring",
                   stiffness: 100,
                   damping: 15
                 }}
                 className="h-full"
               >
                 <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
                   <TShirtDesigner />
                 </Suspense>
               </motion.div>
             )}

             {activeTab === 'color-copies' && (
               <motion.div
                 key="color-copies"
                 initial={{ opacity: 0, y: 30, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -20, scale: 0.95 }}
                 transition={{ 
                   duration: 0.6,
                   type: "spring",
                   stiffness: 100,
                   damping: 15
                 }}
                 className="w-full"
               >
                 <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
                   <ColorCopiesForm />
                 </Suspense>
               </motion.div>
             )}

             {activeTab === 'gangsheet' && (
               <motion.div
                 key="gangsheet"
                 initial={{ opacity: 0, y: 30, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -20, scale: 0.95 }}
                 transition={{ 
                   duration: 0.6,
                   type: "spring",
                   stiffness: 100,
                   damping: 15
                 }}
                 className="w-full"
               >
                 <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg">
                   <div className="text-center">
                     <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                       Custom Gangsheet Builder
                     </h2>
                     <p className="text-gray-600 mb-6">
                       Create professional gangsheets for your printing projects
                     </p>
                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                       <div className="flex items-center justify-center mb-4">
                         <Grid3X3 className="h-8 w-8 text-orange-500 mr-2" />
                         <span className="text-lg font-semibold text-orange-700">Coming Soon!</span>
                       </div>
                       <p className="text-orange-600">
                         Our advanced gangsheet builder is currently under development. 
                         This powerful tool will help you create professional layouts for your printing projects.
                       </p>
                     </div>
                   </div>
                 </div>
               </motion.div>
             )}

             {activeTab === 'quote' && (
               <motion.div
                 key="quote"
                 initial={{ opacity: 0, y: 30, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: -20, scale: 0.95 }}
                 transition={{ 
                   duration: 0.6,
                   type: "spring",
                   stiffness: 100,
                   damping: 15
                 }}
                 className="w-full"
               >
                 <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
                   <QuoteForm />
                 </Suspense>
               </motion.div>
             )}

           </div>
         </div>
       </div>

       {/* Footer */}
       <footer className="relative z-10 mt-16">
         <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6">
           <div className="text-center">
             <p className="text-sm text-gray-500 font-bold">
               © 2025 QuickCopy2.com. All rights reserved.
             </p>
           </div>
         </div>
      </footer>
    </div>
  )
}