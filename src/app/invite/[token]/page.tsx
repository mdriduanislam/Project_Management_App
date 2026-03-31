import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AcceptInviteClient } from "@/components/invite/accept-invite-client";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Invitation</h1>
          <p className="text-gray-500 mt-2">This invitation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invitation Expired</h1>
          <p className="text-gray-500 mt-2">This invitation has expired. Ask an admin to send a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <AcceptInviteClient
      token={token}
      orgName={invitation.organization.name}
      email={invitation.email}
      role={invitation.role}
      isLoggedIn={!!userId}
    />
  );
}
