import { motion } from "framer-motion";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-10 text-neutral-text dark:text-white"
    >
      <h1 className="text-3xl font-extrabold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Last updated: August 2026
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing and using TrackCash ("the App"), you agree to comply
            with and be bound by these Terms of Service. If you do not agree,
            please do not use the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Use of the App</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrackCash provides financial tracking and planning tools for users
            worldwide. You agree to use the App only for lawful purposes and in
            a way that does not infringe the rights of others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. User Accounts</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account credentials. You must notify us immediately of any
            unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">
            4. Currency & Financial Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrackCash supports multiple currencies. All amounts you enter are
            stored in the currency you select in your profile. We are not
            responsible for conversion errors or exchange rate fluctuations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Data Privacy</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your use of the App is also governed by our Privacy Policy. We are
            committed to protecting your data and will not share your personal
            financial information with third parties without your consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The App, including its code, design, layout, graphics, and logo, is
            the intellectual property of TrackCash. You may not copy, modify, or
            reverse engineer any part of the App without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrackCash is provided "as is" without warranties. We do not
            guarantee that the App will be error-free or uninterrupted. We are
            not liable for any indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Termination</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We reserve the right to suspend or terminate your access to the App
            at any time for conduct that violates these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may update these Terms from time to time. Your continued use of
            the App after the changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">10. Contact Information</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have any questions about these Terms, please contact us at{" "}
            <a
              href="mailto:dapodevv@gmail.com"
              className="text-primary underline"
            >
              dapodevv@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
}
