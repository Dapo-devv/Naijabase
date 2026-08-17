import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-10 text-neutral-text dark:text-white"
    >
      <h1 className="text-3xl font-extrabold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last updated: August 2026</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We collect information you provide directly to us, such as your name, email address, and financial data entered into the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. How We Use Your Data</h2>
          <p className="text-gray-600 dark:text-gray-300">
            TrackCash uses your data to provide expense tracking, spending plans, and financial summaries. We do not sell, trade, or rent your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Data Security</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We implement industry-standard encryption and security practices through Supabase to protect your data. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You may access, correct, or delete your personal data at any time via your Profile settings or by contacting us directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300">
            If you have questions about this Privacy Policy, please contact us at <a href="mailto:dapodevv@gmail.com" className="text-primary underline">dapodevv@gmail.com</a>.
          </p>
        </section>
      </div>
    </motion.div>
  );
}