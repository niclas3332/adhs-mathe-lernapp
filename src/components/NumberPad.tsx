import { useState } from 'react'

export function NumberPad({ onSubmit, disabled }: { onSubmit: (n: number) => void; disabled?: boolean }) {
  const [value, setValue] = useState('')

  const press = (d: string) => setValue((v) => (v.length >= 4 ? v : v === '0' ? d : v + d))
  const submit = () => {
    if (!value || disabled) return
    onSubmit(parseInt(value, 10))
    setValue('')
  }

  return (
    <>
      <div className="task-display" aria-live="polite">{value || ' '}</div>
      <div className="numpad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" disabled={disabled} onClick={() => press(d)}>{d}</button>
        ))}
        <button type="button" disabled={disabled || !value} onClick={() => setValue((v) => v.slice(0, -1))} aria-label="Löschen">⌫</button>
        <button type="button" disabled={disabled} onClick={() => press('0')}>0</button>
        <button type="button" className="ok" disabled={disabled || !value} onClick={submit}>OK</button>
      </div>
    </>
  )
}
