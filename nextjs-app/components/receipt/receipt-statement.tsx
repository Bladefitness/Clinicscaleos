/**
 * Receipt / Statement Template
 * Clinic Growth OS — Health Pro CEO design system
 * Supports both payment receipts and billing statements.
 */

"use client";

import { forwardRef } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface ReceiptStatementData {
  type: "receipt" | "statement";
  id: string;
  date: string;
  dueDate?: string;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patientName?: string;
  patientEmail?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  status?: "paid" | "pending" | "overdue";
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
}

interface ReceiptStatementProps {
  data: ReceiptStatementData;
  className?: string;
  /** Print mode: lighter background for paper */
  printMode?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export const ReceiptStatement = forwardRef<HTMLDivElement, ReceiptStatementProps>(
  ({ data, className, printMode = false }, ref) => {
    const isReceipt = data.type === "receipt";

    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto max-w-[680px] rounded-xl border bg-card text-card-foreground shadow-[0_0_25px_rgba(56,189,248,0.08)]",
          printMode && "border-[rgba(56,189,248,0.15)] bg-[#111d35] text-white print:shadow-none print:border print:rounded-lg",
          className
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b px-6 py-5",
            printMode ? "border-[rgba(56,189,248,0.15)]" : "border-border"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                printMode ? "bg-[#162040] text-[#38bdf8]" : "bg-primary/10 text-primary"
              )}
            >
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Clinic Growth OS</h1>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                by Doctor Lead Flow
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                printMode ? "text-slate-400" : "text-primary"
              )}
            >
              {isReceipt ? "Payment Receipt" : "Billing Statement"}
            </p>
            <p className="text-sm font-mono text-muted-foreground">#{data.id}</p>
          </div>
        </div>

        {/* Clinic + Patient info */}
        <div
          className={cn(
            "grid gap-6 border-b px-6 py-5 sm:grid-cols-2",
            printMode ? "border-[rgba(56,189,248,0.15)]" : "border-border"
          )}
        >
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              From
            </p>
            <p className="font-semibold">{data.clinicName}</p>
            {data.clinicAddress && (
              <p className="text-sm text-muted-foreground">{data.clinicAddress}</p>
            )}
            {data.clinicPhone && (
              <p className="text-sm text-muted-foreground">{data.clinicPhone}</p>
            )}
          </div>
          <div>
            {data.patientName && (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isReceipt ? "Patient" : "Bill to"}
                </p>
                <p className="font-semibold">{data.patientName}</p>
                {data.patientEmail && (
                  <p className="text-sm text-muted-foreground">{data.patientEmail}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Date / Status row */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4",
            printMode ? "border-[rgba(56,189,248,0.15)] bg-[#162040]/50" : "border-border bg-muted/30"
          )}
        >
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-muted-foreground">
                {isReceipt ? "Payment Date" : "Statement Date"}
              </p>
              <p className="font-medium">{data.date}</p>
            </div>
            {data.dueDate && !isReceipt && (
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{data.dueDate}</p>
              </div>
            )}
            {data.paidAt && isReceipt && (
              <div>
                <p className="text-xs text-muted-foreground">Paid On</p>
                <p className="font-medium">{data.paidAt}</p>
              </div>
            )}
          </div>
          {data.status && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                data.status === "paid" && (printMode ? "bg-[#162040] text-slate-300" : "bg-success/10 text-success"),
                data.status === "pending" && (printMode ? "bg-[rgba(56,189,248,0.08)] text-[#38bdf8]" : "bg-amber-500/10 text-amber-600"),
                data.status === "overdue" && (printMode ? "bg-red-900/30 text-red-400" : "bg-destructive/10 text-destructive")
              )}
            >
              {data.status}
            </span>
          )}
        </div>

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className={cn(
                  "border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  printMode ? "border-[rgba(56,189,248,0.15)] bg-[#162040]" : "border-border bg-muted/20"
                )}
              >
                <th className="px-6 py-3">Description</th>
                {(data.lineItems.some((i) => i.quantity != null) || data.lineItems.some((i) => i.unitPrice != null)) && (
                  <>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Unit</th>
                  </>
                )}
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b",
                    printMode ? "border-[rgba(56,189,248,0.1)]" : "border-border"
                  )}
                >
                  <td className="px-6 py-3 font-medium">{item.description}</td>
                  {(data.lineItems.some((x) => x.quantity != null) || data.lineItems.some((x) => x.unitPrice != null)) && (
                    <>
                      <td className="px-6 py-3 text-right text-muted-foreground">
                        {item.quantity ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-right text-muted-foreground">
                        {item.unitPrice != null ? formatCurrency(item.unitPrice) : "—"}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-3 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-6 py-5">
          <div className="w-full max-w-[280px] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.tax != null && data.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(data.tax)}</span>
              </div>
            )}
            {data.discount != null && data.discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
            )}
            <div
              className={cn(
                "flex justify-between border-t pt-3 text-base font-bold",
                printMode ? "border-[rgba(56,189,248,0.15)]" : "border-border"
              )}
            >
              <span>Total</span>
              <span className={printMode ? "text-white" : "text-primary"}>
                {formatCurrency(data.total)}
              </span>
            </div>
            {data.paymentMethod && isReceipt && (
              <p className="pt-1 text-xs text-muted-foreground">
                Paid via {data.paymentMethod}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div
            className={cn(
              "border-t px-6 py-4",
              printMode ? "border-[rgba(56,189,248,0.15)] bg-[#162040]/30" : "border-border bg-muted/20"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </p>
            <p className="mt-1 text-sm">{data.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div
          className={cn(
            "px-6 py-4 text-center text-xs text-muted-foreground",
            printMode ? "border-t border-slate-200" : "border-t border-border"
          )}
        >
          Thank you for your business. Clinic Growth OS — Dominate your market.
        </div>
      </div>
    );
  }
);

ReceiptStatement.displayName = "ReceiptStatement";
