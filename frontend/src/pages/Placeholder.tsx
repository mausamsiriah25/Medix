export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">This section is planned but not part of the current build.</p>
    </div>
  )
}
