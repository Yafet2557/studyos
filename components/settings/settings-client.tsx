"use client";

import { useActionState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { changePassword, type PasswordFormState } from "@/lib/actions/settings";

interface SettingsClientProps {
  email: string;
}

export function SettingsClient({ email }: SettingsClientProps) {
  const { theme, toggleTheme } = useTheme();

  const [state, formAction, isPending] = useActionState<
    PasswordFormState,
    FormData
  >(changePassword, null);

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <section className="rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-sm)] p-7 space-y-4">
        <h2 className="text-xl font-serif font-normal tracking-tight">
          Account
        </h2>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-sm">Email address</Label>
          <p className="text-sm font-mono text-foreground">{email}</p>
        </div>
      </section>

      {/* Theme Toggle */}
      <section className="rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-sm)] p-7 space-y-4">
        <h2 className="text-xl font-serif font-normal tracking-tight">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {theme === "dark"
                ? "Dark theme is active"
                : "Light theme is active"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Light mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Dark mode
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-sm)] p-7 space-y-4">
        <h2 className="text-xl font-serif font-normal tracking-tight">
          Change Password
        </h2>
        <form action={formAction} className="flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              disabled={isPending}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              disabled={isPending}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={isPending}
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {state.success}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Update password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
