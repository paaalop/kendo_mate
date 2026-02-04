import { getDojos } from './actions'
import { LinkRequestForm } from '@/components/family/link-request-form'
import { getActiveProfileContext } from '@/lib/utils/profile'
import { redirect } from 'next/navigation'

export default async function LinkPage() {
  const context = await getActiveProfileContext()
  
  if (!context) redirect('/login')

  const { allProfiles, activeProfileId, isGuardian } = context
  const activeProfile = allProfiles?.find(p => p.id === activeProfileId) as any
  
  // Only adults or those in guardian summary mode can link
  if (!activeProfile?.is_adult && !isGuardian) {
    redirect('/')
  }

  const dojos = await getDojos()

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Find & Link Child</h1>
      <LinkRequestForm dojos={dojos} />
    </div>
  )
}
