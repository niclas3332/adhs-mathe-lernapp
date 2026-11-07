import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router'
import { useActiveProfile } from './core/AppStateContext'
import { findConcept } from './concepts/registry'
import { ProfilesScreen } from './admin/ProfilesScreen'
import { ConceptMenu } from './admin/ConceptMenu'
import { SettingsScreen } from './admin/SettingsScreen'
import { InstallHint } from './admin/InstallHint'
import type { ReactNode } from 'react'

function RequireProfile({ children }: { children: ReactNode }) {
  const profile = useActiveProfile()
  return profile ? <>{children}</> : <Navigate to="/" replace />
}

function PlayRoute() {
  const { conceptId } = useParams()
  const profile = useActiveProfile()
  const concept = findConcept(conceptId)
  if (!concept) return <Navigate to="/menu" replace />
  // key: neue Runde bei Profil- oder Konzeptwechsel
  return <concept.Component key={`${profile?.id}-${concept.id}`} />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProfilesScreen />} />
        <Route path="/menu" element={<RequireProfile><ConceptMenu /></RequireProfile>} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/install" element={<InstallHint />} />
        <Route path="/play/:conceptId" element={<RequireProfile><PlayRoute /></RequireProfile>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
