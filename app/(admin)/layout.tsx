import { redirect } from 'next/navigation'

// This would be where you check admin authentication
async function checkAdminAuth() {
  // TODO: Implement actual admin authentication check
  // const session = await getSession()
  // if (!session || !session.user.isAdmin) redirect('/login')
  return true
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdminAuth()

  return <>{children}</>
}
