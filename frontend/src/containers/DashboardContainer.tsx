import { useState } from 'react'
import type { User } from '../types'
import { DiaryContainer } from './DiaryContainer'
import { GroupsContainer } from './GroupsContainer'
import { PeopleContainer } from './PeopleContainer'
import { DashboardView, type DashboardSection } from '../presentation/layout/DashboardView'

type DashboardContainerProps = {
  user: User
  error: string
  onLogout: () => void
}

export function DashboardContainer({ user, error, onLogout }: DashboardContainerProps) {
  const [section, setSection] = useState<DashboardSection>('diaries')

  return (
    <DashboardView
      user={user}
      section={section}
      error={error}
      onSectionChange={setSection}
      onLogout={onLogout}
    >
      {section === 'diaries' && <DiaryContainer />}
      {section === 'people' && <PeopleContainer />}
      {section === 'groups' && <GroupsContainer />}
    </DashboardView>
  )
}
