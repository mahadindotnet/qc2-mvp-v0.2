'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, ShoppingCart, Palette } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">QC2 Custom</span>
          </div>
          <Link 
            href="/test-supabase"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Test Connection
          </Link>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            We&apos;re Rebuilding...
            <br />
            <span className="text-blue-600">But You Can Still Order!</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
          >
            Our new store is coming soon! In the meantime, place custom T-shirt orders, 
            request a quote for other products, or give us a call — we&apos;re here to make it easy for you.
          </motion.p>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {/* Custom T-Shirts */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Custom T-Shirts</h3>
              <p className="text-gray-600 mb-6">
                Design your perfect custom t-shirt with our easy-to-use design tool. 
                Upload your artwork or choose from our templates.
              </p>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
                Start Designing
              </button>
            </div>

            {/* Request Quote */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Quote</h3>
              <p className="text-gray-600 mb-6">
                Need something specific? Get a personalized quote for bulk orders, 
                special products, or custom requirements.
              </p>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
                Get Quote
              </button>
            </div>

            {/* Call Us */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Call Us</h3>
              <p className="text-gray-600 mb-6">
                Prefer to talk? Our friendly team is ready to help you with 
                your custom printing needs and answer any questions.
              </p>
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">
                Call Now
              </button>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center space-x-4">
                <Phone className="h-6 w-6 text-blue-600" />
                <span className="text-lg text-gray-700">(555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-lg text-gray-700">orders@qccustom.com</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-gray-400"
          >
            © 2024 QC2 Custom. All rights reserved. | New store coming soon!
          </motion.p>
        </div>
      </footer>
    </div>
  )
}