// app/(app)/profile/page.tsx — member self-service profile: edit name and phone, and choose
// whether to share email/phone in the directory (private by default).
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/(app)/profile/actions";
import { getProfile } from "@/lib/auth";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { saved, error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Contact details are private until you choose to share them.
        </p>
      </header>

      {saved ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          Profile saved.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form action={updateProfile} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile.full_name ?? ""}
            autoComplete="name"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profile.email ?? ""}
            readOnly
            className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60"
          />
          <span className="text-xs text-zinc-500">
            Managed by your sign-in; contact an admin to change it.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            autoComplete="tel"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium">
            Share in directory
          </legend>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="share_email"
              defaultChecked={profile.share_email}
              className="h-4 w-4"
            />
            Show my email to approved members
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="share_phone"
              defaultChecked={profile.share_phone}
              className="h-4 w-4"
            />
            Show my phone to approved members
          </label>
        </fieldset>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
