import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { MaterialIcon } from "@/components/layout/icon";

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  SENT:    { bg: "bg-primary/10",  text: "text-primary",            icon: "check_circle" },
  FAILED:  { bg: "bg-error/10",    text: "text-error",              icon: "error" },
  SKIPPED: { bg: "bg-surface-5",   text: "text-on-surface-variant", icon: "skip_next" },
  PENDING: { bg: "bg-warning/10",  text: "text-warning",            icon: "hourglass_top" },
};

const EVENT_LABELS: Record<string, string> = {
  OTP_SENT:           "OTP Login",
  INVITE_CREATED:     "Invite Sent",
  PAYMENT_LOGGED:     "Payment Logged",
  PAYMENT_CONFIRMED:  "Payment Confirmed",
  PAYMENT_DISPUTED:   "Payment Disputed",
  DISPUTE_FILED:      "Dispute Filed",
  DISPUTE_RESOLVED:   "Dispute Resolved",
};

export default async function NotificationsPage() {
  const user = await requireRole("LANDLORD");

  const notifications = await db.notification.findMany({
    where: { recipientId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const sentCount    = notifications.filter((n) => n.status === "SENT").length;
  const failedCount  = notifications.filter((n) => n.status === "FAILED").length;
  const skippedCount = notifications.filter((n) => n.status === "SKIPPED").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tight">WhatsApp Notifications</h1>
        <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
          Last 100 events
        </span>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          <MaterialIcon name="check_circle" className="text-base" />
          {sentCount} Sent
        </div>
        <div className="flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-full text-sm font-bold">
          <MaterialIcon name="error" className="text-base" />
          {failedCount} Failed
        </div>
        <div className="flex items-center gap-2 bg-surface-5 text-on-surface-variant px-4 py-2 rounded-full text-sm font-bold">
          <MaterialIcon name="skip_next" className="text-base" />
          {skippedCount} Skipped
        </div>
      </div>

      {/* Info banner when no API credentials */}
      {sentCount === 0 && failedCount === 0 && (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
          <MaterialIcon name="info" className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold mb-1">WhatsApp API not configured yet</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Add <code className="bg-surface-5 px-1 py-0.5 rounded text-primary">WHATSAPP_PHONE_NUMBER_ID</code> and{" "}
              <code className="bg-surface-5 px-1 py-0.5 rounded text-primary">WHATSAPP_ACCESS_TOKEN</code> to your{" "}
              <code className="bg-surface-5 px-1 py-0.5 rounded">.env</code> file to start sending real messages.
              Messages to email-based accounts are automatically skipped.
            </p>
          </div>
        </div>
      )}

      {/* Log */}
      {notifications.length === 0 ? (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-16 text-center">
          <MaterialIcon name="notifications_none" className="text-4xl text-on-surface-variant mb-3" />
          <p className="text-on-surface-variant">No notifications sent yet.</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Notifications appear here when events like logins, payments, or disputes occur.
          </p>
        </div>
      ) : (
        <div className="bg-surface-4 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {notifications.map((n) => {
            const style  = STATUS_STYLES[n.status] ?? STATUS_STYLES.PENDING;
            const label  = EVENT_LABELS[n.event] ?? n.event;
            let metadata: { template?: string; params?: string[] } = {};
            try {
              if (n.metadata) metadata = JSON.parse(n.metadata) as typeof metadata;
            } catch { /* ignore */ }

            return (
              <div key={n.id} className="flex items-start gap-4 p-5">
                {/* Status icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  <MaterialIcon name={style.icon} className={`text-base ${style.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold">{label}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {n.status}
                    </span>
                    {n.channel && (
                      <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">
                        via {n.channel}
                      </span>
                    )}
                  </div>

                  {metadata.template && (
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                      {metadata.template}
                      {metadata.params && metadata.params.length > 0 && (
                        <span className="text-on-surface-muted"> [{metadata.params.join(", ")}]</span>
                      )}
                    </p>
                  )}

                  {n.error && (
                    <p className="text-xs text-error mt-1">{n.error}</p>
                  )}

                  {n.messageId && (
                    <p className="text-[10px] text-on-surface-variant/50 mt-0.5 font-mono">ID: {n.messageId}</p>
                  )}
                </div>

                {/* Timestamp */}
                <time
                  dateTime={n.createdAt.toISOString()}
                  className="text-[10px] text-on-surface-variant shrink-0 whitespace-nowrap"
                  title={n.createdAt.toLocaleString()}
                >
                  {n.createdAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
