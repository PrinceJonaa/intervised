import Google from 'next-auth/providers/google'

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      // Only allow sign in if user email is in the admin list
      if (user.email && adminEmails.includes(user.email)) {
        return true
      }
      return false
    },
    async session({ session, token }: any) {
      // Add user info to session
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/signin',
    error: '/admin/signin',
  },
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails.includes(email)
}
