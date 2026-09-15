"use client"

import { useEffect, useRef, useState } from "react"
import { X, ExternalLink } from "lucide-react"

// Pre-generated Pledge.to ("Pledger") widget ID from the Impact Hub.
const PLEDGER_WIDGET_ID = "e33e9cb3-1194-451a-a983-e9d0c51ba79c"
const PLEDGER_SCRIPT_SRC = "https://www.pledge.to/embed/widget.js"
// Direct hosted donation page — used as a fallback when the embed can't load
// (e.g. inside the v0 preview sandbox, which blocks outbound pledge.to calls).
const PLEDGER_HOSTED_URL = `https://www.pledge.to/widgets/${PLEDGER_WIDGET_ID}`

interface PledgerModalProps {
  isOpen: boolean
  onClose: () => void
  // The plan the donor picked BEFORE opening Pledger. `entries` is authoritative
  // (it "matches the tier the donor picked"); `amountDollars` locks the widget's
  // amount so the Pledger charge lines up with that tier / wheel result.
  entries: number
  amountDollars: number
  // A short label describing where this donation came from (tier id, "wheel",
  // "monthly-custom", etc.) — carried through for reconciliation/record keeping.
  context: string
  isOneTime?: boolean
}

export function PledgerModal({ isOpen, onClose, entries, amountDollars, context, isOneTime }: PledgerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // "loading" until the Pledge.to iframe appears; "failed" if it never does.
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading")

  // Pledge.to's widget.js scans for `.plg-donate` elements on load and then
  // keeps a MutationObserver watching the document, so any `.plg-donate` node
  // added later (like this modal's) is rendered into automatically. We mount a
  // fresh target div each time the modal opens and load the embed script once.
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ""
    setStatus("loading")

    const target = document.createElement("div")
    target.className = "plg-donate"
    target.setAttribute("data-widget-id", PLEDGER_WIDGET_ID)

    // Lock the donation amount to the picked tier / wheel result so the amount
    // the donor is charged matches what the site quoted.
    if (amountDollars > 0) {
      target.setAttribute("data-amount", String(amountDollars))
    }

    // Custom metadata. Pledge.to forwards every `data-x-*` attribute into the
    // donation's metadata and echoes it back on the webhook, so we stamp the
    // authoritative entry count + context here and read it back server-side.
    // A random ref lets us trace a specific gift end to end.
    const ref =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    target.setAttribute("data-x-source", "wl-site")
    target.setAttribute("data-x-entries", String(entries))
    target.setAttribute("data-x-context", context)
    target.setAttribute("data-x-plan", isOneTime ? "one_time" : "monthly")
    target.setAttribute("data-x-ref", ref)

    container.appendChild(target)

    // Load the embed script only once; the guard inside widget.js makes repeat
    // loads a no-op, and its persistent observer picks up the new target div.
    if (!document.querySelector(`script[src="${PLEDGER_SCRIPT_SRC}"]`)) {
      const script = document.createElement("script")
      script.src = PLEDGER_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }

    // Consider the widget "loaded" once it injects an iframe into our target.
    const observer = new MutationObserver(() => {
      if (target.querySelector("iframe")) {
        setStatus("loaded")
        observer.disconnect()
      }
    })
    observer.observe(target, { childList: true, subtree: true })

    // If nothing rendered within a few seconds, the embed is blocked or
    // unreachable — surface the hosted-page fallback instead of a spinner.
    const timeout = window.setTimeout(() => {
      if (!target.querySelector("iframe")) setStatus("failed")
    }, 6000)

    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
      container.innerHTML = ""
    }
  }, [isOpen, entries, amountDollars, context, isOneTime])

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
          <div className="font-heading text-2xl text-teal">
            {entries} {entries === 1 ? "Entry" : "Entries"}
          </div>
          <p className="text-sm text-teal/60 mt-1">Secure donation processed by Pledge.to</p>
        </div>

        {/* Pledge.to widget renders into this container via widget.js. */}
        <div className="relative min-h-[420px]">
          <div ref={containerRef} className="min-h-[420px]" />

          {status === "loading" && (
            <p className="absolute inset-0 flex items-center justify-center text-center text-sm text-teal/40 px-6">
              Loading secure donation form…
            </p>
          )}

          {status === "failed" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm text-teal/70 leading-relaxed mb-1">
                The donation form couldn&apos;t load here.
              </p>
              <p className="text-xs text-teal/50 leading-relaxed mb-5">
                This is expected in the preview. It works on the published site — or continue on Pledger directly.
              </p>
              <a
                href={PLEDGER_HOSTED_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-3 px-5 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase transition-all hover:bg-teal2"
              >
                Donate on Pledger
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
