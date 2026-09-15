"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

// Pre-generated Pledge.to ("Pledger") widget ID from the Impact Hub.
const PLEDGER_WIDGET_ID = "e33e9cb3-1194-451a-a983-e9d0c51ba79c"
const PLEDGER_SCRIPT_SRC = "https://www.pledge.to/embed/widget.js"

interface PledgerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PledgerModal({ isOpen, onClose }: PledgerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Pledge.to's widget.js scans for `.plg-donate` elements on load and then
  // keeps a MutationObserver watching the document, so any `.plg-donate` node
  // added later (like this modal's) is rendered into automatically. We mount a
  // fresh target div each time the modal opens and load the embed script once.
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ""

    const loading = document.createElement("p")
    loading.textContent = "Loading secure donation form…"
    loading.className = "text-center text-sm text-teal/40 pt-24"
    container.appendChild(loading)

    const target = document.createElement("div")
    target.className = "plg-donate"
    target.setAttribute("data-widget-id", PLEDGER_WIDGET_ID)
    container.appendChild(target)

    // Load the embed script only once; the guard inside widget.js makes repeat
    // loads a no-op, and its persistent observer picks up the new target div.
    if (!document.querySelector(`script[src="${PLEDGER_SCRIPT_SRC}"]`)) {
      const script = document.createElement("script")
      script.src = PLEDGER_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }

    return () => {
      container.innerHTML = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-cream border border-gold/30 p-6 md:p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-teal/50 hover:text-teal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="text-[0.6rem] tracking-[0.4em] uppercase text-gold mb-2">Donate with Pledger</div>
          <div className="font-heading text-2xl text-teal">Complete your gift</div>
          <p className="text-sm text-teal/60 mt-1">Secure donation processed by Pledge.to</p>
        </div>

        {/* Pledge.to widget renders into this container via widget.js. */}
        <div ref={containerRef} className="min-h-[420px]" />
      </div>
    </div>
  )
}
