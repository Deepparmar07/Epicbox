import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Cloud,
  ArrowRight,
  FolderOpen,
  Share2,
  Star,
} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await signIn(normalizedEmail, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('lastEmail', normalizedEmail);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('lastEmail');
      }

      toast({
        title: 'Welcome Back!',
        description: 'Successfully logged in to EpicBox',
      });
      navigate('/');
    } catch (error) {
      const description =
        error instanceof Error && error.message === 'Invalid login credentials'
          ? 'No account with this email and password was found in the new Supabase project. Create a new account first, or check your password.'
          : error instanceof Error
            ? error.message
            : 'Invalid credentials';
      toast({
        title: 'Login Failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const lastEmail = localStorage.getItem('lastEmail');
    if (remembered === 'true' && lastEmail) {
      setEmail(lastEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <PageMeta title="Sign in | EpicBox" description="Sign in to your EpicBox account to manage your files." />

      <aside className="relative hidden min-h-screen overflow-hidden bg-[#101b35] px-12 py-7 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <img src="/images/logo/logo-icon.svg" alt="" className="h-11 w-11 rounded-xl" />
          <span className="text-2xl font-bold tracking-tight">EpicBox</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-xl py-8">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-blue-100">
            <Shield className="h-4 w-4" />
            Your personal file workspace
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Your files, organized and within reach.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Keep important files together, find them quickly, and share them on your terms.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <FolderOpen className="mb-5 h-5 w-5 text-blue-200" />
              <p className="font-medium">Stay organized</p>
              <p className="mt-1 text-sm text-slate-300">Folders and quick access</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <Share2 className="mb-5 h-5 w-5 text-blue-200" />
              <p className="font-medium">Share with control</p>
              <p className="mt-1 text-sm text-slate-300">Links and access options</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <Star className="mb-5 h-5 w-5 text-blue-200" />
              <p className="font-medium">Find it faster</p>
              <p className="mt-1 text-sm text-slate-300">Favorites and recent files</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-400">A clearer home for your digital files.</p>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-900/20" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl dark:bg-indigo-900/20" />

        <div className="relative z-10 w-full max-w-[430px]">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img src="/images/logo/logo-icon.svg" alt="" className="h-11 w-11 rounded-xl shadow-sm" />
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">EpicBox</p>
              <p className="text-xs text-muted-foreground">Your personal file workspace</p>
            </div>
          </div>

          <Card className="border-border/70 bg-card/95 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
            <CardHeader className="space-y-2 px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-sm">
                Sign in to continue to your EpicBox workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link to="/forgot-password">
                    <button
                      type="button"
                      className="text-sm text-secondary hover:underline font-medium"
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    New to EpicBox?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Link to="/register">
                  <Button variant="outline" className="w-full h-11" disabled={loading}>
                    Create an Account
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Your account is protected by Supabase authentication.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
