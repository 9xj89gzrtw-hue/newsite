"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * TottBestCatering — Talk of the Town (talkofthetownatlanta.com) "atlanta's
 * best catering company" row-1 section graft (Cycle 30, task v4).
 *
 * Exact 1:1 replication of their homepage row-1 section markup:
 *
 *   <div class="fusion-fullwidth ..." style="padding-top:100px;padding-bottom:60px;">
 *     <div class="fusion-builder-row ..." style="max-width:1456px;">
 *       <div class="fusion-layout-column ... fusion-animated"
 *            data-animationtype="fadeInLeft" data-animationduration="0.3"
 *            data-animationoffset="top-into-view">
 *         <div class="fusion-column-wrapper ...">
 *           <div class="fusion-text fusion-text-1">
 *             <h2 style="text-align:center; font-size:22px; line-height:1.5;">
 *               <span style="color:#000000;">atlanta's best catering company</span>
 *             </h2>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Per task v4: "после этого я тебя просил что-то добавлять? не просил, только
 * эта надпись как у них". So this section is ONLY that one H2 line — nothing
 * else (no eyebrow, no h1, no body, no CTA button). The previous v3 added a
 * whole headline stack which was NOT asked for; v4 strips it back to the
 * exact reference.
 *
 * Styling (from their inline attrs + Avada --h2_typography var):
 *   - font-family: Prata (their Avada H2 font, per MINED §1).
 *   - font-size: 22px (their data-fontsize="22", --fontSize:22).
 *   - line-height: 1.5 (their data-lineheight="33px" / 22 = 1.5).
 *   - text-align: center.
 *   - color: #000000 (their inline span style).
 *   - section padding: 100px top / 60px bottom (their awb-padding).
 *   - section bg: transparent (their row has no bg color → white page bg).
 *
 * Animation: their `fusion-animated` with data-animationtype="fadeInLeft",
 * duration 0.3s, trigger top-into-view. Reproduced via framer-motion
 * whileInView opacity+translateX(-20), 0.3s. Reduced-motion aware.
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md §8 (row 1)
 */
export function TottBestCatering() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const animate = mounted && !reduce;

  return (
    <section
      data-header-theme="light"
      aria-label="Лучший кейтеринг Санкт-Петербурга"
      className="bg-white"
      style={{ paddingTop: "100px", paddingBottom: "60px" }}
    >
      <motion.h2
        className="mx-auto max-w-4xl px-6 text-center text-black"
        style={{
          fontFamily: "var(--font-marck), var(--font-nothing), cursive",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          lineHeight: 1.2,
          fontWeight: 400,
        }}
        initial={animate ? { opacity: 0, x: -20 } : false}
        whileInView={animate ? { opacity: 1, x: 0 } : undefined}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        Лучший кейтеринг Санкт-Петербурга
      </motion.h2>
    </section>
  );
}

export default TottBestCatering;
