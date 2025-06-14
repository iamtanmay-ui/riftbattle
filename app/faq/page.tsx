"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How does the account trading process work?",
      answer: "Our platform connects buyers and sellers of gaming accounts. Once you find an account you're interested in, you can purchase it through our secure payment system. The seller will then transfer the account credentials to you through our escrow system, ensuring a safe transaction for both parties."
    },
    {
      question: "Is trading accounts safe on your platform?",
      answer: "Yes, we've implemented a secure escrow system that protects both buyers and sellers. Payments are held in escrow until the account transfer is complete and verified. Additionally, we verify all sellers to minimize the risk of fraudulent listings."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayPal, and various cryptocurrency options including Bitcoin, Ethereum, and more. All payment information is securely processed and never stored on our servers."
    },
    {
      question: "What happens if I don't receive my account after payment?",
      answer: "Our escrow system holds the payment until you confirm receipt of the account. If you don't receive the account or if there are issues with the account, you can open a dispute, and our support team will investigate and help resolve the issue."
    },
    {
      question: "Can I sell my own account on your platform?",
      answer: "Yes, you can list your account for sale after creating a seller account and passing our verification process. You'll need to provide accurate details about your account and set your price."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account by going to your Account Settings and selecting the 'Delete Account' option. This will permanently remove all your personal information from our system. Note that any active listings or transactions must be completed or canceled before account deletion."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team through the Contact page, where you can submit a ticket describing your issue. Alternatively, you can email us directly at support@riftbattle.com."
    },
    {
      question: "Are there fees for using the platform?",
      answer: "Yes, we charge a small commission on successful transactions to maintain the platform and provide our escrow service. The exact fee structure is available on our Fees page."
    },
    {
      question: "What information do you collect from users?",
      answer: "We collect basic account information such as email, username, and payment details for transactions. For more details on data collection and usage, please refer to our Privacy Policy."
    },
    {
      question: "Can I use the platform without creating an account?",
      answer: "Yes, you can browse listings without an account. For purchasing, we offer a guest checkout option, though creating an account provides additional benefits like saved payment methods and transaction history."
    }
  ];
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Frequently Asked Questions
        </h1>
        
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search questions..."
            className="pl-10 bg-slate-800/50 border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No matching questions found. Try a different search term.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Still have questions? Visit our{" "}
            <a href="/contact" className="text-blue-400 hover:underline">
              Contact page
            </a>{" "}
            to get in touch with our support team.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
