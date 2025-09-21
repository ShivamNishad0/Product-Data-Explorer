'use client';

export default function ContactPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-4">
        If you have any questions or feedback, please reach out to us at:
      </p>
      <address className="not-italic">
        <a href="mailto:support@productdataexplorer.com" className="text-blue-600 hover:underline">
          support@productdataexplorer.com
        </a>
      </address>
    </main>
  );
}
