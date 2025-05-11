"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message === "You are not authorized as an admin") {
          setError("Access denied. You are not authorized as an admin.");
        } else {
          setError(error.message || "Failed to sign in");
        }
        return;
      }
      router.push("/admin");
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0">
            <Image
              src="https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=3872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Chemistry background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Chemistry is the study of matter, but I prefer to see it as the
                study of change."
              </p>
              <footer className="text-sm">Walter White</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                <div className="absolute inset-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg animate-pulse">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Chimie
                    </span>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Nomencl
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-spin-slow"></div>
                <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"></div>
              </div>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access the admin panel
                </p>
              </div>
            </div>
            <Card>
              <CardContent className="py-6">
                <form onSubmit={handleSubmit} className="space-y-4 px-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="h-10 mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="h-10 mt-1"
                    />
                  </div>
                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
