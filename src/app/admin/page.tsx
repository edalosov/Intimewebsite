import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getGalleryConfig, getActiveQuestion } from "@/lib/config";
import { AdminForm } from "@/components/AdminForm";
import { AdminAnswersTools } from "@/components/AdminAnswersTools";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const [config, question] = await Promise.all([getGalleryConfig(), getActiveQuestion()]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 sm:px-10 sm:py-32">
      <h1 className="font-display text-3xl italic text-foreground">Gallery settings</h1>
      <AdminForm
        initialContractAddress={config.nftContractAddress ?? ""}
        initialChainId={config.chainId}
        initialQuestion={question?.text ?? ""}
      />
      <div className="mt-14 border-t pt-14" style={{ borderColor: "var(--border-soft)" }}>
        <AdminAnswersTools />
      </div>
    </div>
  );
}
