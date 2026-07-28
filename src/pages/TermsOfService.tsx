import { Helmet } from 'react-helmet-async';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Helmet>
        <title>Terms of Service | John20 Deals</title>
        <meta name="description" content="Terms of Service for John20 Deals" />
      </Helmet>
      <h1 className="text-4xl font-black text-slate-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing or using the John20 Deals website, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use of the Site</h2>
          <p className="text-slate-600 mb-4">
            You may use our site only for lawful purposes and in accordance with these Terms. You agree not to use the site:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>To exploit, harm, or attempt to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate John20 Deals, a John20 Deals employee, another user, or any other person or entity.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Products and Pricing</h2>
          <p className="text-slate-600 mb-4">
            All descriptions of products or product pricing are subject to change at any time without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Orders and Payment</h2>
          <p className="text-slate-600 mb-4">
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
          <p className="text-slate-600 mb-4">
            In no case shall John20 Deals, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Information</h2>
          <p className="text-slate-600 mb-4">
            Questions about the Terms of Service should be sent to us at legal@john20deals.com.
          </p>
        </section>
      </div>
    </div>
  );
}
