import { cn } from "@/lib/utils"

export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-6 py-4", className)}>
      <span className="flex-1 max-w-[200px] h-px bg-gradient-to-r from-transparent to-gold/40" />
      <div className="w-2 h-2 bg-gold rotate-45" />
      <span className="flex-1 max-w-[200px] h-px bg-gradient-to-l from-transparent to-gold/40" />
    </div>
  )
}
