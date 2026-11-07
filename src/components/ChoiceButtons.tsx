export function ChoiceButtons({
  choices,
  onSelect,
  disabled,
  disabledValues = [],
}: {
  choices: number[]
  onSelect: (n: number) => void
  disabled?: boolean
  disabledValues?: number[]
}) {
  return (
    <div className="choices">
      {choices.map((c) => (
        <button key={c} type="button" disabled={disabled || disabledValues.includes(c)} onClick={() => onSelect(c)}>
          {c}
        </button>
      ))}
    </div>
  )
}
