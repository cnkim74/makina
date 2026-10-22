"use client";

import { useState } from "react";
import { workflow } from "@/data/content";
import Segmented from "./Segmented";
import { FieldRows } from "./placeholders";
import s from "./WorkFlow.module.css";

type StepId = `${number}`;

/** 조사료 작업 흐름 — 유리 세그먼트로 단계를 고르면 아래 카드가 바뀐다 */
export default function WorkFlow() {
  const [step, setStep] = useState<StepId>("1");
  const cur = workflow.find((w) => String(w.step) === step) ?? workflow[0];
  const next = workflow.find((w) => w.step === cur.step + 1);

  return (
    <section className="mod" id="workflow" aria-labelledby="workflow-title">
      <div className="mod-in">
        <span className="lab-k">작업 흐름</span>
        <h2 id="workflow-title">조사료, 베기부터 감싸기까지.</h2>
        <p className="tag">첫 단계 베기가 드래곤의 일입니다. 베면서 부숴 두면 말리기부터 먹이기까지 수월해집니다.</p>

        <Segmented<StepId>
          className={s.seg}
          label="작업 단계"
          kind="tablist"
          value={step}
          onChange={setStep}
          options={workflow.map((w) => ({ id: String(w.step) as StepId, label: `${w.step} ${w.title}` }))}
        />

        <div className={s.card} role="tabpanel" aria-label={`${cur.step}단계 ${cur.title}`}>
          <div className={s.text}>
            <span className={s.step}>
              {cur.step}단계 · {cur.title}
            </span>
            <h3>{cur.desc}.</h3>
            <p>{cur.detail}</p>
            <dl className={s.machine}>
              <dt>이 단계의 작업기</dt>
              <dd>{cur.machine}</dd>
            </dl>
            <div className={s.acts}>
              <a className="lnk" href={cur.href}>
                {cur.step === 5 ? "소모품 주문하기" : cur.step === 1 ? "드래곤 보기" : "상담 받기"}
              </a>
              {next && (
                <button type="button" className={`lnk ${s.next}`} onClick={() => setStep(String(next.step) as StepId)}>
                  다음 단계 {next.title}
                </button>
              )}
            </div>
          </div>
          <div className={`photo ${s.pic}`}>
            {cur.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cur.image} alt={`${cur.title} 단계 현장 사진`} loading="lazy" />
            ) : (
              <>
                <FieldRows w={800} h={600} fill={cur.tone} stroke="rgba(0,0,0,.22)" />
                <span className="photo-label">작업 사진 — {cur.title} (교체)</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
