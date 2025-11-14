import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          About Nostra
        </h1>
        <div className="mt-8 text-left space-y-8 text-lg text-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">What is Nostra?</h2>
            <p className="leading-relaxed">
              An open-source modular platform and open protocols. To unite people and communities in a large interoperable open network.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">We are looking for:</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pioneering communities ready to test sovereign social tools and turn real flows into blueprints for others.</li>
              <li>Developers eager to become core contributors.</li>
              <li>Collaborators passionate about reclaiming social capital from extractive platforms.</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact</h2>
            <div className="space-y-2">
              <p className="leading-relaxed">
                <Link 
                  href="mailto:nostra@nostrahub.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  nostra@nostrahub.com
                </Link>
              </p>
              <p className="leading-relaxed">
                <Link 
                  href="https://t.me/nostrafuture" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  t.me/nostrafuture
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
