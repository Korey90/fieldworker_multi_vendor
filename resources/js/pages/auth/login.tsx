import { Head, useForm} from '@inertiajs/react';
import { Users, Shield, Briefcase } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { login as loginRoute, register } from '@/routes';
import { request } from '@/routes/password';
import loginActions from '@/routes/login';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};


interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(loginActions.store.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Fieldworker Login" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Fieldworker Portal
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to manage your workforce and operations
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="text-sm font-medium text-green-800">{status}</div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="mt-8 space-y-6" onSubmit={submit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <Label htmlFor="email" className="sr-only">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="rounded-b-none"
                                    placeholder="Email address"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="rounded-t-none"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', !!checked)}
                                />
                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                                    Remember me
                                </Label>
                            </div>

                            {canResetPassword && (
                                <div className="text-sm">
                                    <a
                                        href={request.url()}
                                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                            )}
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <Shield className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                </span>
                                {processing ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <a
                                    href={register.url()}
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                >
                                    Sign up for access
                                </a>
                            </p>
                        </div>
                    </form>

                                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                    {/* Features */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">
                                    Fieldworker Features
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4 mr-2 text-blue-500" />
                                Workforce Management
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                                Job Assignment & Tracking
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                Multi-Sector Support
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
