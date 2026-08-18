// app/(app)/messages/page.tsx — messages placeholder. Becomes the in-app posts feed in a
// future phase; for now it points participants to check email for updates from the coach.
import { PlaceholderScreen } from "@/components/placeholder-screen";

export default function MessagesPage() {
  return (
    <PlaceholderScreen
      title="Messages"
      description="Read posts and updates from your coach."
    />
  );
}
