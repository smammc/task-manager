import { redirect } from 'next/navigation'

// This would be where you check authentication
// For now, it's just a placeholder structure
async function checkAuth() {
  // TODO: Implement actual authentication check
  // const session = await getSession()
  // if (!session) redirect('/login')
  return true
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await checkAuth()

  return <>{children}</>
}
