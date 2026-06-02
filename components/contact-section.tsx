'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    emailOptIn: false,
    smsOptIn: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section id="contact" className="py-16 lg:py-24 bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card p-8 lg:p-12 rounded-xl border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">Thank You!</h3>
            <p className="text-muted-foreground">
              Your message has been received. We will get back to you as soon as possible.
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  message: '',
                  emailOptIn: false,
                  smsOptIn: false,
                })
              }}
              className="mt-6"
              variant="outline"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-16 lg:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Info */}
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Get in Touch</p>
            <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground text-balance">
              Contact Us
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
              Connect with us to learn more about our fundraising initiatives and how you can 
              contribute to our cause. We would love to hear from you.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <a href="mailto:amit@kollelohrmoshe.com" className="text-muted-foreground hover:text-primary transition-colors">
                    amit@kollelohrmoshe.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Phone</h4>
                  <a href="tel:+18187442970" className="text-muted-foreground hover:text-primary transition-colors">
                    (818) 744-2970
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Address</h4>
                  <p className="text-muted-foreground">
                    Los Angeles, California
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card p-6 lg:p-8 rounded-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm text-foreground">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-sm text-foreground">Your Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-phone" className="text-sm text-foreground">Your Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-sm text-foreground">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Type the subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm text-foreground">Message</Label>
                <textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 w-full min-h-[120px] px-3 py-2 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>

              {/* Subscription Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contact-emailOptIn"
                    checked={formData.emailOptIn}
                    onCheckedChange={(checked) => setFormData({ ...formData, emailOptIn: checked === true })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="contact-emailOptIn" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Subscribe to email updates about Kollel news and events
                  </Label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contact-smsOptIn"
                    checked={formData.smsOptIn}
                    onCheckedChange={(checked) => setFormData({ ...formData, smsOptIn: checked === true })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="contact-smsOptIn" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to receive text message updates from Kollel Ohr Moshe
                  </Label>
                </div>

                {/* SMS Disclosure - Required for Compliance */}
                {formData.smsOptIn && (
                  <div className="p-3 bg-muted/50 rounded-md border border-border text-xs text-muted-foreground space-y-2">
                    <p>
                      <strong>SMS Terms:</strong> By checking the box above, you consent to receive recurring 
                      automated promotional and informational text messages from Kollel Ohr Moshe at the phone 
                      number provided. Message frequency varies (approximately 2-4 messages per month).
                    </p>
                    <p>
                      <strong>Msg & Data rates may apply.</strong> Message and data rates may apply depending 
                      on your mobile carrier plan.
                    </p>
                    <p>
                      <strong>Opt-Out:</strong> You can opt out at any time by replying STOP to any message. 
                      After opting out, you will receive one final confirmation message.
                    </p>
                    <p>
                      <strong>Help:</strong> For assistance, reply HELP to any message or contact us at{' '}
                      <a href="mailto:amit@kollelohrmoshe.org" className="text-primary hover:underline">
                        amit@kollelohrmoshe.org
                      </a>
                    </p>
                    <p>
                      Consent is not a condition of purchase. View our{' '}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                      {' '}and{' '}
                      <a href="/terms" className="text-primary hover:underline">Terms & Conditions</a>.
                    </p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
