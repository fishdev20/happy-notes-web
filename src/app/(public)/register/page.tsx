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
import { NotebookPen } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 -left-44 h-[34rem] w-[34rem] rounded-full bg-primary/25 blur-[100px]" />
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
            Create account
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-primary">
            Start your note system
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Set up your workspace to write notes, organize with tags and filters, and use AI
            assistance from day one.
          </p>
        </div>

        <Card className="border-border/80 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Create your Happy Notes account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create password"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            <Button type="button" className="w-full">
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
