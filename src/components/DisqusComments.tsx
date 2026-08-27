import React, { useEffect } from "react";
import { MessageSquare, Flame } from "lucide-react";

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: { reload: boolean; config?: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

interface DisqusCommentsProps {
  pageIdentifier?: string;
  pageTitle?: string;
}

export function DisqusComments({
  pageIdentifier = "umbrella-oracle-sg",
  pageTitle = "Umbrella Oracler Singapore Weather & Brolly Community",
}: DisqusCommentsProps) {
  useEffect(() => {
    // Configure Disqus parameters
    window.disqus_config = function (this: any) {
      this.page = this.page || {};
      this.page.url = window.location.href;
      this.page.identifier = pageIdentifier;
      this.page.title = pageTitle;
    };

    // If DISQUS already loaded, reset and reload comments for current config
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: window.disqus_config,
      });
      return;
    }

    // Otherwise inject embed script
    const scriptId = "disqus-embed-script";
    if (!document.getElementById(scriptId)) {
      const d = document;
      const s = d.createElement("script");
      s.id = scriptId;
      s.src = "https://umbrella-4.disqus.com/embed.js";
      s.setAttribute("data-timestamp", String(+new Date()));
      s.async = true;
      (d.head || d.body).appendChild(s);
    }
  }, [pageIdentifier, pageTitle]);

  return (
    <section
      id="disqus-community-section"
      aria-label="Disqus Community Discussion"
      className="w-full bg-[#FFF500] text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 my-8 font-sans transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-black pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-black text-[#FFF500] p-2.5 border-2 border-black">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2 font-['Outfit',sans-serif]">
              Brolly Community Chat
              <span className="bg-[#0040D6] text-[#FFF500] text-xs px-2 py-0.5 font-mono uppercase tracking-wider font-extrabold border border-black">
                Live
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/80 font-mono">
              Share real-time rain updates, flooded void decks, or vent about forgotten umbrellas!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs bg-black text-[#FFF500] px-3 py-1.5 border-2 border-black font-bold">
          <Flame className="w-4 h-4 text-[#FFF500] animate-pulse" />
          <span>Disqus Powered</span>
        </div>
      </div>

      {/* Disqus Canvas Container */}
      <div className="bg-white p-4 sm:p-6 border-4 border-black min-h-[280px]">
        <div id="disqus_thread" className="w-full" />
        <noscript>
          Please enable JavaScript to view the{" "}
          <a
            href="https://disqus.com/?ref_noscript"
            className="underline font-bold text-[#0040D6]"
            target="_blank"
            rel="noopener noreferrer"
          >
            comments powered by Disqus.
          </a>
        </noscript>
      </div>

      {/* Footer Tagline */}
      <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-black/70 font-bold uppercase tracking-wider">
        <span>● Real-time sync enabled</span>
        <span>Join the forecast banter</span>
      </div>
    </section>
  );
}
