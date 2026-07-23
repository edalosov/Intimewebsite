import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AdminAnswersTools } from "@/components/AdminAnswersTools";

export default async function AdminAnswersPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const answers = await prisma.answer.findMany({
    include: { question: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <Link href="/admin" className="text-xs underline" style={{ color: "var(--foreground-faint)" }}>
        ← Gallery settings
      </Link>
      <h1 className="mt-4 font-display text-3xl italic text-foreground">Answers</h1>

      <div className="mt-10">
        <AdminAnswersTools />
      </div>

      <div className="mt-10 overflow-x-auto">
        {answers.length === 0 ? (
          <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
            No answers submitted yet.
          </p>
        ) : (
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-soft)" }}>
                {["Wallet", "Artwork", "Token ID", "Question", "Answer", "Submitted at"].map((label) => (
                  <th
                    key={label}
                    className="whitespace-nowrap px-3 py-3 text-xs font-normal uppercase tracking-widest"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answers.map((answer) => (
                <tr key={answer.id} className="border-b align-top" style={{ borderColor: "var(--border-soft)" }}>
                  <td className="px-3 py-3 font-mono text-xs text-foreground">{answer.walletAddress}</td>
                  <td className="px-3 py-3 text-foreground">{answer.tokenName}</td>
                  <td className="px-3 py-3 text-foreground">{answer.tokenId}</td>
                  <td className="max-w-xs px-3 py-3 italic" style={{ color: "var(--foreground-muted)" }}>
                    {answer.question.text}
                  </td>
                  <td className="max-w-sm px-3 py-3 text-foreground">{answer.answerText}</td>
                  <td className="whitespace-nowrap px-3 py-3" style={{ color: "var(--foreground-faint)" }}>
                    {answer.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
