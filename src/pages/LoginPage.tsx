import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <LoginForm />
            </div>
        </div>
    )
}