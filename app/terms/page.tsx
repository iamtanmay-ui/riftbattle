"use client";

import { PageLayout } from "@/components/layout/page-layout";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Terms of Service
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-6">
            Last Updated: March 27, 2025
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Rift Battle, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Rift Battle's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose;</li>
            <li>Attempt to decompile or reverse engineer any software contained on Rift Battle's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Terms</h2>
          <p>
            To access certain features of the platform, you may be required to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself. You are responsible for safeguarding your password and for all activities that occur under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p>
            You agree not to use the platform to:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Violate any applicable laws or regulations;</li>
            <li>Infringe upon the rights of others;</li>
            <li>Post or transmit unauthorized commercial communications;</li>
            <li>Upload viruses or other malicious code;</li>
            <li>Solicit personal information from minors;</li>
            <li>Engage in fraudulent activities;</li>
            <li>Interfere with the proper working of the platform.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Trading and Transactions</h2>
          <p>
            Rift Battle serves as a platform connecting buyers and sellers of gaming accounts. We are not responsible for the quality, safety, legality, or availability of the items listed. By engaging in transactions on our platform, you agree to the following:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>All transactions must comply with our platform rules and applicable laws;</li>
            <li>Rift Battle charges a commission fee on successful transactions;</li>
            <li>Sellers are responsible for accurately describing their items;</li>
            <li>Buyers are responsible for reviewing item descriptions before purchasing;</li>
            <li>All disputes will be handled according to our dispute resolution process.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disclaimer</h2>
          <p>
            The materials on Rift Battle's website are provided on an 'as is' basis. Rift Battle makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitations</h2>
          <p>
            In no event shall Rift Battle or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Rift Battle's website, even if Rift Battle or a Rift Battle authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Revisions and Errata</h2>
          <p>
            The materials appearing on Rift Battle's website could include technical, typographical, or photographic errors. Rift Battle does not warrant that any of the materials on its website are accurate, complete or current. Rift Battle may make changes to the materials contained on its website at any time without notice.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Links</h2>
          <p>
            Rift Battle has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Rift Battle of the site. Use of any such linked website is at the user's own risk.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Modifications</h2>
          <p>
            Rift Battle may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <div className="mt-8">
            <p>
              For questions about our Terms of Service, please contact us at:{" "}
              <Link href="/contact" className="text-blue-400 hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
