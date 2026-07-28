import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Helmet>
        <title>Privacy Policy | John20 Deals</title>
        <meta name="description" content="Privacy Policy for John20 Deals" />
      </Helmet>
      <h1 className="text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-4">
            We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Name and contact information (email address, phone number)</li>
            <li>Shipping and billing addresses</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about products, services, and promotions</li>
            <li>Improve and optimize our platform</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Information Sharing</h2>
          <p className="text-slate-600 mb-4">
            We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as payment processing and order fulfillment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
          <p className="text-slate-600 mb-4">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
          <p className="text-slate-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@john20deals.com.
          </p>
        </section>
      </div>
    </div>
  );
}
