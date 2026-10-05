"use client";

import { useState } from "react";
import { workflow } from "@/data/content";
import s from "./WorkFlow.module.css";

/** 조사료 작업 흐름 — 번호 원형 절차도. 활성 단계만 오렌지. */
export default function WorkFlow() {
  const [active, setActive] = useState(1);
  const current = workflow.find((w) => w.step === active) ?? workflow[1];

  return (
    <section className="sec" id="workflow" aria-labelledby="workflow-title">
      <div className="wrap">
        <h2 className="sec-title" id="workflow-title">
          조사료 작업 흐름
        </h2>
        <p className="sec-sub">베기부터 감싸기, 소모품까지 — 성원마끼나 작업기 한 세트로 끝납니다</p>

        <ol className={s.proc}>
          {workflow.map((w) => {
            const isField = w.step === 0;
            const isOn = w.step === active;
            return (
              <li
                key={w.step}
                className={`${s.st} ${isOn ? s.on : ""} ${isField ? s.first : ""}`}
              >
                <button
                  type="button"
                  onClick={() => !isField && setActive(w.step)}
                  aria-current={isOn ? "step" : undefined}
                  disabled={isField}
                >
                  <i>{isField ? "▦" : w.step}</i>
                  <b>{w.title}</b>
                  <span>
                    {w.desc}
                    {w.machine && (
                      <>
                        <br />
                        {w.machine}
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className={s.note}>
          <b>
            {current.step} {current.title}
          </b>{" "}
          — {current.desc}. <span>{current.machine}</span>
        </div>
      </div>
    </section>
  );
}
