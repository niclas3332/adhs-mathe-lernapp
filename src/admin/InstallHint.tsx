import { useNavigate } from 'react-router'

export function InstallHint() {
  const navigate = useNavigate()
  return (
    <div className="screen admin">
      <div className="admin-bar">
        <h1>App installieren</h1>
        <button type="button" className="btn" onClick={() => navigate(-1)}>Zurück</button>
      </div>
      <h2>iPhone / iPad (Safari)</h2>
      <ol>
        <li>Diese Seite in <strong>Safari</strong> öffnen.</li>
        <li>Unten auf <strong>Teilen</strong> (Quadrat mit Pfeil nach oben) tippen.</li>
        <li><strong>„Zum Home-Bildschirm“</strong> wählen und „Hinzufügen“ tippen.</li>
      </ol>
      <h2>Android (Chrome)</h2>
      <ol>
        <li>Diese Seite in <strong>Chrome</strong> öffnen.</li>
        <li>Oben rechts auf das <strong>⋮-Menü</strong> tippen.</li>
        <li><strong>„App installieren“</strong> bzw. „Zum Startbildschirm hinzufügen“ wählen.</li>
      </ol>
      <p className="muted">
        Nach der Installation läuft die App auch ohne Internet. Hinweis für iPhone: Die installierte App hat einen eigenen
        Speicher – Profile, die in Safari angelegt wurden, sind dort nicht sichtbar. Profile deshalb erst in der installierten App anlegen.
      </p>
    </div>
  )
}
