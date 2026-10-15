'use client';

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

export const FaqSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(["faq-1"]);

  const faqs: FaqItem[] = [
    {
      id: "faq-1",
      question: "How does inter-college verification work?",
      badge: "Verification",
      answer:
        "Nodes are authenticated via .edu or .ac.in credentials. Faculty advisors co-sign student club charters, and milestones are approved through multi-signature consensus before sign-off.",
    },
    {
      id: "faq-2",
      question: "Can student teams book 5-Axis CNCs or wind tunnels?",
      badge: "Equipment Exchange",
      answer:
        "Yes. Member institutions publish open machine hours in the Spot Market. Registered coalitions can reserve slots with on-site supervisor clearance or remote access credentials.",
    },
    {
      id: "faq-3",
      question: "How is intellectual property (IP) attributed?",
      badge: "Attribution",
      answer:
        "Projects execute a lightweight charter with Mutual Non-Disclosure and Joint Attribution. Pre-existing lab assets remain university property; collaborative outputs are shared under permissive open engineering licenses.",
    },
    {
      id: "faq-4",
      question: "What powers the complementarity match score?",
      badge: "Algorithm",
      answer:
        "Our engine balances skill complementarity (needs vs. offers), shared goal vectors, and equipment availability, boosting regional institutions to prevent central hub bias.",
    },
  ];

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="mt-14 rounded-2xl border border-lavender-200 bg-white p-6 md:p-8 shadow-soft-lavender">
      <div className="pb-5 border-b border-lavender-100">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="rounded-full bg-lavender-100 px-2.5 py-0.5 text-xs font-mono font-medium text-lavender-700 border border-lavender-200">
            FAQ
          </span>
          <span className="text-xs font-mono text-slate-500">
            Protocol Details
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="mt-4 divide-y divide-lavender-100">
        {faqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div key={faq.id} className="py-3.5">
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between text-left group py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-lavender-700 transition-colors">
                    {faq.question}
                  </span>
                  {faq.badge && (
                    <span className="hidden sm:inline-block rounded-md bg-lavender-50 border border-lavender-200 px-2 py-0.5 text-[10px] font-mono text-lavender-700 font-medium">
                      {faq.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border border-lavender-200 bg-lavender-50/70 text-slate-500 group-hover:text-lavender-700 transition-all ${
                    isOpen ? "rotate-180 bg-lavender-100 text-lavender-800" : ""
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pr-4 animate-in fade-in">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
