'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function BookingPage() {
  useEffect(() => {
    // Auto-open the Square booking modal after page loads
    const timer = setTimeout(() => {
      const squareButton = document.querySelector('a[href*="squareup.com/appointments"]') as HTMLElement
      if (squareButton) {
        squareButton.click()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Script
        src="https://square.site/appointments/buyer/widget/tmord1l456xq0w/LGG5224WJCQG0.js"
        strategy="afterInteractive"
      />
      
      <section className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center">Book an Appointment</h2>
        <p className="text-center text-lg text-gray-600">
          Choose from our creative, tech, content, social media, or ministry services
        </p>

        {/* Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="text-xl font-bold mb-2">Creative</h3>
            <p className="text-gray-600 text-sm">Videography, photography, music production</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-xl font-bold mb-2">Tech</h3>
            <p className="text-gray-600 text-sm">AI bots, OBS setups, automation</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold mb-2">Content</h3>
            <p className="text-gray-600 text-sm">Captions, VCDF packs, hashtags</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-bold mb-2">Social</h3>
            <p className="text-gray-600 text-sm">Instagram growth, scheduling</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-4xl mb-3">🙏</div>
            <h3 className="text-xl font-bold mb-2">Ministry</h3>
            <p className="text-gray-600 text-sm">Church tech, livestreams</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md border-2 border-light-gold">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold mb-2">& More</h3>
            <p className="text-gray-600 text-sm">Custom projects & consultations</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            The booking window will open automatically, or click below:
          </p>
          <a
            href="https://square.site/appointments/buyer/widget/tmord1l456xq0w/LGG5224WJCQG0"
            target="_blank"
            rel="noopener"
            className="inline-block bg-deep-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-blue-hover transition-colors"
          >
            📅 Open Booking Calendar
          </a>
        </div>
      </section>
    </>
  )
}

