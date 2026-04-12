import { useAppStore } from '../stores/appStore'

function PlanCard(props: {
  title: string
  subtitle: string
  price: string
  bullets: string[]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={
        'w-full rounded p-5 text-left transition ' +
        (props.selected
          ? 'bg-white/10 ring-1 ring-white/20'
          : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/15')
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-white">{props.title}</div>
          <div className="mt-1 text-sm text-white/60">{props.subtitle}</div>
        </div>
        <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
          {props.price}
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {props.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-white/50" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <span className={props.selected ? 'netflim-btn-primary' : 'netflim-btn-secondary'}>
          {props.selected ? 'Current plan' : 'Select plan'}
        </span>
      </div>
    </button>
  )
}

export default function PricingPage() {
  const plan = useAppStore((s) => s.subscription.plan)
  const setPlan = useAppStore((s) => s.setPlan)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="text-center">
        <div className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Pricing Plans</div>
        <div className="mt-2 text-sm text-white/65">UI-only monetization for demo purposes.</div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <PlanCard
          title="Free"
          subtitle="Great for casual browsing"
          price="$0"
          bullets={["Ad placeholders", "Limited quality", "Standard servers"]}
          selected={plan === 'free'}
          onSelect={() => setPlan('free')}
        />

        <PlanCard
          title="Pro"
          subtitle="Best experience"
          price="$9 / month"
          bullets={["No ads", "HD / Full HD", "Faster servers"]}
          selected={plan === 'pro'}
          onSelect={() => setPlan('pro')}
        />
      </div>

      <div className="mt-8 rounded bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
        Switching plans updates the UI (ads, badges, and playback hints) but doesn’t charge real money.
      </div>
    </div>
  )
}
