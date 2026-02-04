import { findMyChildren } from '@/app/(dashboard)/family/actions'
import { AutoLinkModal } from '@/components/family/auto-link-modal'

export default async function FamilyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: potentialChildren } = await findMyChildren()

  return (
    <>
      {children}
      {potentialChildren && potentialChildren.length > 0 && (
        <AutoLinkModal childrenToLink={potentialChildren} />
      )}
    </>
  )
}
