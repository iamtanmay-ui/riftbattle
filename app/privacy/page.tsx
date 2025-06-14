"use client";

import { PageLayout } from "@/components/layout/page-layout";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-6">
            Last Updated: March 27, 2025
          </p>
          
          <p className="mb-6">
            At Rift Battle, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Collection of Your Information</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the website includes:
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Personal Data</h3>
          <p>
            When you register for an account, we collect personally identifiable information, such as your name, email address, and other contact details. This information is necessary for providing our services and facilitating transactions between users.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Financial Data</h3>
          <p>
            We may collect financial information, such as payment method details, when you engage in transactions on our platform. This information is processed securely through our payment processors and is not stored on our servers.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Data From Social Networks</h3>
          <p>
            If you choose to link your account with social media platforms, we may have access to certain information from your social media profile based on your privacy settings on those platforms.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Device Information</h3>
          <p>
            We collect device information such as your IP address, browser type, operating system, and other technical information when you access our website.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the website to:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Create and manage your account;</li>
            <li>Process transactions and send transaction notifications;</li>
            <li>Increase the efficiency and operation of the platform;</li>
            <li>Monitor and analyze usage and trends to improve your experience;</li>
            <li>Notify you of updates to the website and services;</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity;</li>
            <li>Resolve disputes and troubleshoot problems;</li>
            <li>Respond to customer service requests;</li>
            <li>Send you marketing and promotional communications (with opt-out options).</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">By Law or to Protect Rights</h3>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Third-Party Service Providers</h3>
          <p>
            We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Marketing Communications</h3>
          <p>
            With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Interactions with Other Users</h3>
          <p>
            If you interact with other users of the website, those users may see your name, profile photo, and descriptions of your activity.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights Regarding Your Data</h2>
          <p>
            You have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li><strong>Access:</strong> You can request access to your personal information we hold.</li>
            <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> You can request that we delete your personal information.</li>
            <li><strong>Restriction:</strong> You can request that we restrict the processing of your data under certain circumstances.</li>
            <li><strong>Data Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Objection:</strong> You can object to our processing of your personal data.</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Account Deletion</h2>
          <p>
            You can delete your account at any time by visiting your account settings or contacting us. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Service, and/or comply with legal requirements.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Web Beacons</h2>
          <p>
            We may use cookies, web beacons, tracking pixels, and other tracking technologies on the website to help customize the website and improve your experience. For more information on how we use cookies, please refer to our Cookie Policy.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Third-Party Websites</h2>
          <p>
            The website may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the website, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p>
            The website is not directed to anyone under the age of 13. We do not knowingly collect or solicit information from anyone under the age of 13. If we learn that we have collected personal information from a child under age 13, we will delete that information as quickly as possible.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            <Link href="/contact" className="text-blue-400 hover:underline">
              Contact Us
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
