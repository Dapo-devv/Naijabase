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
            with and be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Use of the App</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrackCash provides financial tracking and planning tools. You agree
            to use the App only for lawful purposes and in a way that does not
            infringe the rights of others or restrict their use of the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. User Accounts</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account credentials. You are fully responsible for all activities
            that occur under your account. You must notify us immediately of any
            unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Data Privacy</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your use of the App is also governed by our Privacy Policy. We are
            committed to protecting your data and will not share your personal
            financial information with third parties without your explicit
            consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The App, including its code, design, layout, graphics, and logo, is
            the intellectual property of TrackCash. You may not copy, modify, or
            reverse engineer any part of the App without our prior written
            consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            TrackCash is provided "as is" without any warranties. We do not
            guarantee that the App will be error-free or uninterrupted. In no
            event shall TrackCash be liable for any indirect, incidental, or
            consequential damages arising from the use of the App.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Termination</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We reserve the right to suspend or terminate your access to the App
            at any time, without prior notice, for conduct that we believe
            violates these Terms or is harmful to other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">8. Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may update these Terms from time to time. We will notify you of
            any changes by posting the new Terms on this page. Your continued
            use of the App after the changes constitutes your acceptance of the
            new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">9. Contact Information</h2>
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
