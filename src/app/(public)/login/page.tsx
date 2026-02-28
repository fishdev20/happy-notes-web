"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import useToastStore from "@/store/use-toast-store";
import { Chrome, Github, Loader2, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const pushToast = useToastStore((state) => state.pushToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "github" | null>(null);

  const nextPath = searchParams.get("next") || "/home";

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      pushToast({
        title: "Login failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: "Logged in",
      description: "Welcome back to Happy Notes.",
      variant: "success",
    });

    router.replace(nextPath);
    router.refresh();
  }

  async function handleOAuthLogin(provider: "google" | "github") {
    setOauthProvider(provider);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setOauthProvider(null);
      pushToast({
        title: "OAuth login failed",
        description: error.message,
        variant: "error",
      });
    }
  }

  return (
    <div className="relative min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 -left-44 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute top-1/3 -right-44 h-[32rem] w-[32rem] rounded-full bg-secondary/25 blur-[110px]" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <NotebookPen className="h-5 w-5 text-primary" />
          Happy Notes
        </Link>
        <ModeToggle />
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden lg:block">
          <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-primary">
            Sign in to your workspace
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Continue writing notes, chatting with AI, and reviewing your plans from calendar and
            saved views.
          </p>
        </div>

        <Card className="border-border/80 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access Happy Notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || oauthProvider !== null}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("google")}
                disabled={isSubmitting || oauthProvider !== null}
              >
                {oauthProvider === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="h-4 w-4" />
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("github")}
                disabled={isSubmitting || oauthProvider !== null}
              >
                {oauthProvider === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
