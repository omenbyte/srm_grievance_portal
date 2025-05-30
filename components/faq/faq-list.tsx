"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Faq {
  id: number
  question: string
  answer: string
}

interface FaqListProps {
  faqs: Faq[]
}

export function FaqList({ faqs }: FaqListProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No FAQs match your search criteria.</p>
      </div>
    )
  }

  return (
    <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-4">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={`item-${faq.id}`}
          className="border rounded-xl px-4 py-2 bg-background/50 hover:bg-background/80 transition-colors"
        >
          <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
