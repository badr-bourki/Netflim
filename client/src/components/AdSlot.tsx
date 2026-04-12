type Props = {
  label?: string
}

export function AdSlot({ label = 'Sponsored' }: Props) {
  return (
    <div className="mx-4 mt-6 rounded bg-white/5 p-4 ring-1 ring-white/10 md:mx-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</div>
        <div className="text-[11px] text-white/35">Ad placeholder</div>
      </div>
      <div className="mt-3 h-16 w-full rounded netflim-skeleton" />
    </div>
  )
}
