import { useToastStore } from '../stores/toastStore'

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className={
            'netflim-toast-in max-w-[340px] rounded bg-black/80 px-3 py-2 text-left text-sm text-white shadow ring-1 ring-white/10 ' +
            (t.type === 'success'
              ? 'border-l-2 border-green-500'
              : t.type === 'error'
                ? 'border-l-2 border-red-500'
                : 'border-l-2 border-blue-400')
          }
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
