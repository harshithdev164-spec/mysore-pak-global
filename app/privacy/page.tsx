import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | World of Mysore Pak",
  description:
    "How World of Mysore Pak collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#1B3A2D]/50 mb-10">
          Last updated: 30 May 2026
        </p>

        <div className="prose prose-sm sm:prose-base max-w-none text-[#1B3A2D]/80 space-y-6">
          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">Who we are</h2>
            <p>
              World of Mysore Pak (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website{" "}
              <a href="https://www.worldofmysorepak.com" className="text-[#C9972D] underline">
                worldofmysorepak.com
              </a>{" "}
              and a WhatsApp Business presence on <strong>+91 63648 95293</strong>. This page
              explains what personal data we collect and how we use it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">What we collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Order details</strong>: name, email, mobile, shipping address — to fulfil and deliver your orders.</li>
              <li><strong>Payment metadata</strong>: payment ID, status, amount (handled and stored by Razorpay; we do not store card numbers).</li>
              <li><strong>WhatsApp messages</strong>: the content of any message you send to our WhatsApp Business number, plus your WhatsApp ID — to respond and to maintain conversation history.</li>
              <li><strong>Site usage</strong>: standard server logs (IP, user-agent, referring URL, timestamp) for security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">How we use it</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To process, ship, and provide updates about your orders (over email, SMS, and WhatsApp).</li>
              <li>To answer your questions when you message us on WhatsApp.</li>
              <li>To send shipping status notifications (order confirmed, shipped with tracking, delivered) over WhatsApp using pre-approved Meta templates.</li>
              <li>To improve our products, site, and customer service.</li>
              <li>To comply with legal/tax obligations.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your data, and we do <strong>not</strong> use it for
              third-party advertising.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">Service providers we share data with</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Razorpay</strong> — payment processing (PCI-DSS compliant).</li>
              <li><strong>Delhivery, DTDC, DHL Express</strong> — shipping. We share name, address, phone, and order weight only.</li>
              <li><strong>Meta (WhatsApp Cloud API)</strong> — WhatsApp messaging.</li>
              <li><strong>Supabase</strong> — encrypted hosted database for orders + messages.</li>
              <li><strong>Vercel</strong> — website hosting and serverless functions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">WhatsApp messaging — your rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You can opt out of proactive WhatsApp notifications at any time by replying <strong>STOP</strong> to our business number.</li>
              <li>You can request deletion of your WhatsApp conversation history with us by emailing{" "}
                <a href="mailto:support@worldofmysorepak.com" className="text-[#C9972D] underline">
                  support@worldofmysorepak.com
                </a>.</li>
              <li>Conversations are retained for up to 24 months for customer service purposes, then automatically purged unless tied to an active order dispute.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">How long we keep your data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Order records: as required by Indian tax law (currently 8 years).</li>
              <li>WhatsApp messages: 24 months, then purged.</li>
              <li>Marketing consent: until you withdraw it.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">Your rights</h2>
            <p>
              You can ask us to access, correct, or delete your personal data, or opt out of
              marketing communications, by emailing{" "}
              <a href="mailto:support@worldofmysorepak.com" className="text-[#C9972D] underline">
                support@worldofmysorepak.com
              </a>{" "}
              or messaging us on WhatsApp at <strong>+91 63648 95293</strong>. We respond within
              30 days.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">Contact</h2>
            <p>
              World of Mysore Pak<br />
              138/B 52-D, 49-D block, JC Layout, Chamundi Betta Road,<br />
              Nazarbad Mohalla, Mysuru 570011, Karnataka, India<br />
              <a href="mailto:support@worldofmysorepak.com" className="text-[#C9972D] underline">
                support@worldofmysorepak.com
              </a>{" "}
              · +91 63648 95293
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-[#1B3A2D]">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
              the top reflects the most recent revision.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
